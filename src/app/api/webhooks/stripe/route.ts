import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  let event;
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2026-05-27.dahlia" });
    const body      = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const userId  = intent.metadata?.user_id;
    const total   = intent.amount / 100;
    const subtotal = parseFloat(intent.metadata?.subtotal ?? String(total));
    const shipping = parseFloat(intent.metadata?.shipping_cost ?? "0");

    try {
      const supabase = await createSupabaseServerClient();
      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id:         userId && userId !== "guest" ? userId : null,
          subtotal,
          shipping_cost:   shipping,
          total,
          status:          "preparing",
          payment_status:  "paid",
          tracking_number: null,
        })
        .select("id")
        .single();

      if (order) {
        // Update order with Stripe payment intent reference
        await supabase.from("orders").update({ tracking_number: intent.id }).eq("id", order.id);
        console.log("Order created from webhook:", order.id);
      }
    } catch (err) {
      console.error("Failed to create order from webhook:", err);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    console.warn("Payment failed for intent:", intent.id, intent.last_payment_error?.message);
    // Could notify user via email here
  }

  return NextResponse.json({ received: true });
}
