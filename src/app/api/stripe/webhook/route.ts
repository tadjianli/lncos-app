import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { fulfillStripeOrder, OrderValidationError } from "@/lib/stripe/order-fulfillment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/stripe/webhook
 * Backup handler — fires when Stripe sends checkout.session.completed.
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === "production") {
        console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET required in production");
        return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
      }
      console.warn("[stripe/webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev only)");
    }

    const body = await req.text();
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
    console.log(`[stripe/webhook] checkout.session.completed session=${session.id}`);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    if (session.metadata?.type === "rdv_deposit") {
      return NextResponse.json({ received: true, skipped: "rdv_deposit" });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[stripe/webhook] SUPABASE_SERVICE_ROLE_KEY not set");
      return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
    }

    const supabase = createServiceClient();

    await fulfillStripeOrder({
      session,
      supabase,
      userId: null,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      console.error("[stripe/webhook] validation:", err.message);
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[stripe/webhook]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
