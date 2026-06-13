import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/middleware";
import { sendOrderShippedEmail } from "@/lib/email/order-emails";

type OrderStatus = "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";

interface Body {
  status: OrderStatus;
  tracking_number?: string | null;
}

/**
 * PATCH /api/admin/orders/[id]/status
 * Admin-only order status update with shipped notification email.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Body;
    const { status, tracking_number } = body;

    if (!status) {
      return NextResponse.json({ error: "status requis" }, { status: 400 });
    }

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const admin = await isAdminUser(authClient, user.id);
    if (!admin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Session admin authentifiée — RLS is_admin() autorise la mise à jour des commandes.
    const supabase = authClient;
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("id, status, tracking_number, shipped_email_sent_at, stripe_session_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const updates: {
      status: OrderStatus;
      tracking_number?: string | null;
    } = { status };

    if (tracking_number !== undefined) {
      updates.tracking_number = tracking_number;
    }

    const { error: updateErr } = await supabase.from("orders").update(updates).eq("id", id);
    if (updateErr) {
      console.error("[admin/orders/status]", updateErr);
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    if (status === "shipped" && order.status !== "shipped" && !order.shipped_email_sent_at) {
      let customerEmail: string | null = null;

      if (order.stripe_session_id && process.env.STRIPE_SECRET_KEY) {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
        try {
          const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
          customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
        } catch (err) {
          console.warn("[admin/orders/status] stripe session lookup:", err);
        }
      }

      if (customerEmail) {
        const sent = await sendOrderShippedEmail({
          to: customerEmail,
          orderRef: id,
          trackingNumber: tracking_number ?? order.tracking_number,
        });
        if (sent) {
          await supabase
            .from("orders")
            .update({ shipped_email_sent_at: new Date().toISOString() })
            .eq("id", id);
        }
      }
    }

    return NextResponse.json({ ok: true, id, status });
  } catch (err) {
    console.error("[admin/orders/status]", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
