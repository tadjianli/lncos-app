import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyAdminsNewOrder } from "@/lib/push/notify-admins";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/stripe/webhook
 * Backup handler — fires when Stripe sends checkout.session.completed.
 * Idempotent: creates the order only if /api/stripe/complete has not already done so.
 *
 * Configure in Stripe Dashboard → Developers → Webhooks.
 * Set STRIPE_WEBHOOK_SECRET in env → Stripe sends it as the Stripe-Signature header.
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("[stripe/webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
    }

    // Must read raw body (not parsed JSON) for signature verification
    const body      = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;
    if (secret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, secret);
      } catch (sigErr) {
        console.error("[stripe/webhook] signature verification failed:", sigErr);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`[stripe/webhook] checkout.session.completed session=${session.id} payment_status=${session.payment_status}`);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[stripe/webhook] SUPABASE_SERVICE_ROLE_KEY not set — cannot create order");
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY non configurée — impossible de créer la commande. Ajoutez cette clé dans les variables d'environnement." },
        { status: 503 }
      );
    }

    const supabase = createServiceClient();

    // Idempotency — skip if order already exists
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existing) {
      console.log(`[stripe/webhook] order already exists id=${existing.id} — skipping`);
      return NextResponse.json({ received: true, already_created: true });
    }

    // Minimal order — items not available via webhook (client snapshot handles that)
    const amount       = session.amount_total ? session.amount_total / 100 : 0;
    const promoCode    = session.metadata?.promo_code || null;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: null,
        subtotal: amount,
        shipping_cost: 0,
        total: amount,
        status: "preparing",
        payment_status: "paid",
        stripe_session_id: session.id,
        ...(promoCode ? { promo_code: promoCode } : {}),
        payment_provider: "stripe",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[stripe/webhook] order insert:", error);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    console.log(`[stripe/webhook] fallback order created id=${order?.id}`);

    // Increment promo usage if present
    if (promoCode) {
      await supabase.rpc("increment_promo_uses", { promo_code_arg: promoCode });
    }

    await notifyAdminsNewOrder(order.id, amount);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
