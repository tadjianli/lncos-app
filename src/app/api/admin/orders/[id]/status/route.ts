import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/middleware";
import { sendOrderShippedEmail } from "@/lib/email/order-emails";
import { resolveOrderTrackingUrl } from "@/lib/order-tracking";
import {
  loadOrderLineItems,
  refundStripeCheckoutSession,
  restockOrderItems,
} from "@/lib/stripe/order-cancel";

type OrderStatus = "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";

interface Body {
  status: OrderStatus;
  tracking_number?: string | null;
  carrier?: string | null;
  tracking_url?: string | null;
}

/**
 * PATCH /api/admin/orders/[id]/status
 * Admin-only order status update with shipped notification email.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Body;
    const { status, tracking_number, carrier, tracking_url } = body;

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

    const supabase = authClient;
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select(
        "id, status, payment_status, stock_adjusted, stripe_session_id, tracking_number, carrier, tracking_url, shipped_email_sent_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (status === "cancelled" && order.status !== "cancelled") {
      if (order.status === "delivered") {
        return NextResponse.json({ error: "Impossible d'annuler une commande livrée" }, { status: 400 });
      }

      const service = createServiceClient();
      let refunded = false;
      let restocked = false;

      if (order.payment_status === "paid" && order.stripe_session_id && process.env.STRIPE_SECRET_KEY) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
        try {
          const result = await refundStripeCheckoutSession(stripe, order.stripe_session_id);
          refunded = result.refunded;
          if (!result.refunded && result.reason !== "not_paid") {
            console.warn("[admin/orders/status] refund skipped:", result.reason);
          }
        } catch (err) {
          console.error("[admin/orders/status] stripe refund:", err);
          return NextResponse.json(
            { error: "Remboursement Stripe échoué — commande non annulée" },
            { status: 502 },
          );
        }
      }

      if (order.stock_adjusted) {
        try {
          const items = await loadOrderLineItems(service, id);
          await restockOrderItems(service, items);
          restocked = true;
          await service.from("orders").update({ stock_adjusted: false }).eq("id", id);
        } catch (err) {
          console.error("[admin/orders/status] restock:", err);
          if (refunded) {
            return NextResponse.json(
              {
                error:
                  "Remboursement effectué mais réapprovisionnement stock échoué — intervention manuelle requise",
              },
              { status: 500 },
            );
          }
          return NextResponse.json({ error: "Réapprovisionnement stock échoué" }, { status: 500 });
        }
      }

      const { error: cancelErr } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          payment_status: refunded ? "refunded" : order.payment_status,
        })
        .eq("id", id);

      if (cancelErr) {
        console.error("[admin/orders/status] cancel update:", cancelErr);
        return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        id,
        status: "cancelled",
        refunded,
        restocked,
      });
    }

    const updates: {
      status: OrderStatus;
      tracking_number?: string | null;
      carrier?: string | null;
      tracking_url?: string | null;
    } = { status };

    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (carrier !== undefined) updates.carrier = carrier;
    if (tracking_url !== undefined) updates.tracking_url = tracking_url;

    const { error: updateErr } = await supabase.from("orders").update(updates).eq("id", id);
    if (updateErr) {
      console.error("[admin/orders/status]", updateErr);
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    const effectiveTracking =
      tracking_number !== undefined ? tracking_number : order.tracking_number;
    const effectiveCarrier = carrier !== undefined ? carrier : order.carrier;
    const effectiveTrackingUrl =
      tracking_url !== undefined ? tracking_url : order.tracking_url;

    if (status === "shipped" && order.status !== "shipped" && !order.shipped_email_sent_at) {
      let customerEmail: string | null = null;

      if (order.stripe_session_id && process.env.STRIPE_SECRET_KEY) {
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
          trackingNumber: effectiveTracking,
          carrier: effectiveCarrier,
          trackingUrl: resolveOrderTrackingUrl({
            trackingUrl: effectiveTrackingUrl,
            carrier: effectiveCarrier,
            trackingNumber: effectiveTracking,
          }),
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
