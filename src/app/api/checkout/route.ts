import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
}

// Stripe is optional — if STRIPE_SECRET_KEY is not configured,
// checkout falls through to the legacy POST /api/orders flow.
export async function POST(req: Request) {
  try {
    const body: CheckoutBody = await req.json();
    const { items, subtotal, shipping_cost, total } = body;

    if (!items?.length || total <= 0) {
      return NextResponse.json({ error: "Invalid checkout data" }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      // No Stripe configured — return a mock client_secret so the UI can
      // fall through to direct order creation.
      return NextResponse.json({ mode: "direct", client_secret: null });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2026-05-27.dahlia" });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user?.id ?? "guest",
        item_count: String(items.length),
        subtotal: String(subtotal),
        shipping_cost: String(shipping_cost),
        item_names: items.map((i) => `${i.name} x${i.qty}`).join(", ").slice(0, 500),
      },
    });

    return NextResponse.json({
      mode: "stripe",
      client_secret: intent.client_secret,
      payment_intent_id: intent.id,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
