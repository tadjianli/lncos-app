import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  variant?: string;
}

interface CheckoutBody {
  items: CheckoutItem[];
  subtotal: number;
  shipping_cost: number;
  shipping_method_name?: string;
  discount: number;
  promo_code?: string;
  total: number;
  returnUrl?: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session and returns the session URL.
 * Discount is applied as a Stripe coupon (created server-side) so itemisation
 * stays intact in the Stripe dashboard.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[stripe/checkout] STRIPE_SECRET_KEY is not set");
      return NextResponse.json({ error: "Paiement non configuré — contactez l'administrateur" }, { status: 503 });
    }

    const body: CheckoutBody = await req.json();
    const {
      items,
      shipping_cost,
      shipping_method_name,
      discount,
      promo_code,
      total,
      returnUrl: clientReturnUrl,
    } = body;

    if (!items?.length || total <= 0) {
      return NextResponse.json({ error: "Données de commande invalides" }, { status: 400 });
    }

    // Build return URL
    let origin = clientReturnUrl?.startsWith("http") ? new URL(clientReturnUrl).origin : null;
    if (!origin) {
      const h = await headers();
      const host = h.get("host") ?? "localhost:3000";
      const proto = host.includes("localhost") ? "http" : "https";
      origin = `${proto}://${host}`;
    }

    // Stripe replaces {CHECKOUT_SESSION_ID} with the real session id on redirect
    const successUrl = `${origin}/bag?stripe_session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${origin}/bag`;

    // ── Build line items ─────────────────────────────────────────────
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((it) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: it.name,
          ...(it.variant ? { description: it.variant } : {}),
        },
        unit_amount: Math.round(it.price * 100),
      },
      quantity: it.qty,
    }));

    // Add shipping as a line item when > 0
    if (shipping_cost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: shipping_method_name ?? "Livraison" },
          unit_amount: Math.round(shipping_cost * 100),
        },
        quantity: 1,
      });
    }

    // ── Discount — create a one-time Stripe coupon ───────────────────
    let discounts: Stripe.Checkout.SessionCreateParams["discounts"] | undefined;
    if (discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "eur",
        duration: "once",
        name: promo_code ? `Code ${promo_code}` : "Remise",
        max_redemptions: 1,
      });
      discounts = [{ coupon: coupon.id }];
      console.log(`[stripe/checkout] coupon created id=${coupon.id} amount_off=${discount}€ code=${promo_code ?? "none"}`);
    }

    // ── Create session ───────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(discounts ? { discounts } : {}),
      metadata: {
        promo_code: promo_code ?? "",
        shipping_method: shipping_method_name ?? "",
      },
    });

    console.log(`[stripe/checkout] session created id=${session.id} total=${total}€ items=${items.length} promo=${promo_code ?? "none"}`);

    return NextResponse.json({ session_id: session.id, session_url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Stripe.errors.StripeError
      ? err.message
      : err instanceof Error ? err.message : "Initialisation du paiement échouée";
    const status  = err instanceof Stripe.errors.StripeAuthenticationError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
