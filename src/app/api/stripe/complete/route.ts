import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notifyAdminsNewOrder } from "@/lib/push/notify-admins";

interface CompleteBody {
  session_id: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    qty: number;
    variant?: string;
    image_url?: string | null;
  }>;
  subtotal?: number;
  shipping_cost?: number;
  discount?: number;
  promo_code?: string;
  total?: number;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/stripe/complete
 * Called after Stripe redirects the user back to /bag?stripe_session_id=xxx.
 * 1. Retrieves the session from Stripe (source of truth).
 * 2. Verifies payment_status === "paid".
 * 3. Idempotently creates the order + order_items in Supabase.
 * 4. Increments promo usage count if applicable.
 * 5. Returns { id, ref } for the confirmation screen.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Paiement non configuré — contactez l'administrateur" }, { status: 503 });
    }

    const body: CompleteBody = await req.json();
    const {
      session_id,
      items = [],
      subtotal = 0,
      shipping_cost = 0,
      discount = 0,
      promo_code,
      total = 0,
    } = body;

    if (!session_id) {
      return NextResponse.json({ error: "session_id requis" }, { status: 400 });
    }

    // ── 1. Verify payment with Stripe ────────────────────────────────
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log(`[stripe/complete] session=${session_id} payment_status=${session.payment_status} status=${session.status}`);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Paiement non finalisé (statut : ${session.payment_status})`, status: session.payment_status },
        { status: 402 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ── 2. Idempotency — order already created for this session ──────
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existing) {
      console.log(`[stripe/complete] order already exists id=${existing.id}`);
      return NextResponse.json({ id: existing.id, ref: existing.id, already_created: true });
    }

    // ── 3. Create order ──────────────────────────────────────────────
    // Use Stripe-verified amount as source of truth (amount_total is in cents)
    const verifiedTotal    = session.amount_total ? session.amount_total / 100 : total;
    const verifiedSubtotal = subtotal > 0 ? subtotal : verifiedTotal - shipping_cost;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        subtotal: verifiedSubtotal,
        shipping_cost,
        discount,
        ...(promo_code ? { promo_code } : {}),
        total: verifiedTotal,
        status: "preparing",
        payment_status: "paid",
        stripe_session_id: session_id,
        payment_provider: "stripe",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("[stripe/complete] order insert:", orderErr);
      return NextResponse.json({ error: "Erreur de création de commande" }, { status: 500 });
    }

    console.log(`[stripe/complete] order created id=${order.id} total=${verifiedTotal}€`);

    // ── 4. Increment promo usage count ───────────────────────────────
    if (promo_code) {
      await supabase.rpc("increment_promo_uses", { promo_code_arg: promo_code });
    }

    // ── 5. Insert order items ────────────────────────────────────────
    if (items.length > 0) {
      const rows = items.map((it) => ({
        order_id: order.id,
        product_id: it.id,
        name: it.name,
        price: it.price,
        qty: it.qty,
        variant: it.variant ?? null,
        image_url: it.image_url ?? null,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(rows);
      if (itemsErr) console.warn("[stripe/complete] order_items insert:", itemsErr);
      else console.log(`[stripe/complete] ${rows.length} order item(s) saved`);
    }

    await notifyAdminsNewOrder(order.id, verifiedTotal);

    return NextResponse.json({ id: order.id, ref: order.id });
  } catch (err) {
    console.error("[stripe/complete]", err);
    const message = err instanceof Stripe.errors.StripeError
      ? err.message
      : err instanceof Error ? err.message : "Erreur de vérification du paiement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
