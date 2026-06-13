import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { dbToShipping } from "@/lib/admin-supabase";
import { computePromoDiscount, promoGrantsFreeShipping } from "@/lib/promotions";
import { computeShippingCost, isShippingMethodEligible } from "@/lib/shipping-rules";
import {
  encodeItemsSnapshot,
  loadCatalog,
  OrderValidationError,
  type OrderLineItem,
} from "@/lib/stripe/order-fulfillment";

interface CheckoutBody {
  items: OrderLineItem[];
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

    const supabase = await createClient();
    const productIds = [...new Set(items.map((it) => it.id))];
    const catalog = await loadCatalog(supabase, productIds);

    let verifiedSubtotal = 0;
    for (const item of items) {
      const product = catalog.get(item.id);
      if (!product) {
        return NextResponse.json({ error: `Produit introuvable : ${item.id}` }, { status: 400 });
      }

      const hasVariants = product.variants.length > 0;
      const variant = item.variant ? product.variants.find((v) => v.name === item.variant) : null;

      if (hasVariants && !variant) {
        return NextResponse.json({ error: `Variante requise pour ${product.name}` }, { status: 400 });
      }

      const unitPrice = variant ? variant.price : product.price;
      if (Math.abs(unitPrice - item.price) > 0.02) {
        console.warn(`[stripe/checkout] prix invalide id=${item.id} client=${item.price} serveur=${unitPrice}`);
        return NextResponse.json({ error: "Prix produit invalide" }, { status: 400 });
      }

      const available = variant ? variant.stock : product.stock;
      if (available < item.qty) {
        return NextResponse.json({ error: `Stock insuffisant pour ${product.name}` }, { status: 400 });
      }

      verifiedSubtotal += unitPrice * item.qty;
    }
    verifiedSubtotal = parseFloat(verifiedSubtotal.toFixed(2));

    if (Math.abs(verifiedSubtotal - body.subtotal) > 0.02) {
      return NextResponse.json({ error: "Sous-total invalide" }, { status: 400 });
    }

    let verifiedDiscount = 0;
    let promoFreeShipping = false;
    if (promo_code) {
      const { data: promoRow } = await supabase
        .from("promotions")
        .select("type, value, free_shipping, is_active, expires_at, max_uses, current_uses, minimum_order")
        .eq("code", promo_code.toUpperCase().trim())
        .maybeSingle();
      if (promoRow?.is_active) {
        const expired = promoRow.expires_at && new Date(promoRow.expires_at) < new Date();
        const maxed = promoRow.max_uses != null && promoRow.current_uses >= promoRow.max_uses;
        const minOk = !promoRow.minimum_order || verifiedSubtotal >= Number(promoRow.minimum_order);
        if (!expired && !maxed && minOk) {
          verifiedDiscount = computePromoDiscount(
            { type: promoRow.type, value: Number(promoRow.value), freeShipping: promoRow.free_shipping ?? false },
            verifiedSubtotal,
          );
          promoFreeShipping = promoGrantsFreeShipping({
            type: promoRow.type,
            value: Number(promoRow.value),
            freeShipping: promoRow.free_shipping ?? false,
          });
        }
      }
    }

    if (Math.abs(verifiedDiscount - (discount ?? 0)) > 0.02) {
      return NextResponse.json({ error: "Remise invalide" }, { status: 400 });
    }

    let verifiedShipping = shipping_cost;
    if (shipping_method_name) {
      const { data: methodRow } = await supabase
        .from("shipping_methods")
        .select("*")
        .eq("name", shipping_method_name)
        .eq("is_active", true)
        .maybeSingle();

      if (!methodRow) {
        return NextResponse.json({ error: "Méthode de livraison invalide" }, { status: 400 });
      }

      const method = dbToShipping(methodRow);
      if (!isShippingMethodEligible(method, verifiedSubtotal)) {
        return NextResponse.json({ error: "Méthode de livraison non disponible pour ce panier" }, { status: 400 });
      }

      verifiedShipping = computeShippingCost(method, verifiedSubtotal, promoFreeShipping);
      if (Math.abs(verifiedShipping - shipping_cost) > 0.02) {
        return NextResponse.json({ error: "Frais de livraison invalides" }, { status: 400 });
      }
    } else if (shipping_cost > 0) {
      return NextResponse.json({ error: "Méthode de livraison requise" }, { status: 400 });
    }

    const expectedTotal = verifiedSubtotal - verifiedDiscount + verifiedShipping;
    if (Math.abs(expectedTotal - total) > 0.02) {
      return NextResponse.json({ error: "Total invalide" }, { status: 400 });
    }

    let origin = clientReturnUrl?.startsWith("http") ? new URL(clientReturnUrl).origin : null;
    if (!origin) {
      const host = req.headers.get("host") ?? "localhost:3000";
      const proto = host.includes("localhost") ? "http" : "https";
      origin = `${proto}://${host}`;
    }

    const successUrl = `${origin}/bag?stripe_session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/bag`;

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

    if (verifiedShipping > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: shipping_method_name ?? "Livraison" },
          unit_amount: Math.round(verifiedShipping * 100),
        },
        quantity: 1,
      });
    }

    let discounts: Stripe.Checkout.SessionCreateParams["discounts"] | undefined;
    if (verifiedDiscount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(verifiedDiscount * 100),
        currency: "eur",
        duration: "once",
        name: promo_code ? `Code ${promo_code}` : "Remise",
        max_redemptions: 1,
      });
      discounts = [{ coupon: coupon.id }];
    }

    const itemsMeta = encodeItemsSnapshot(items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(discounts ? { discounts } : {}),
      metadata: {
        type: "shop_order",
        promo_code: promo_code ?? "",
        shipping_method: shipping_method_name ?? "",
        subtotal: verifiedSubtotal.toFixed(2),
        shipping_cost: verifiedShipping.toFixed(2),
        discount: verifiedDiscount.toFixed(2),
        ...itemsMeta,
      },
    });

    console.log(`[stripe/checkout] session created id=${session.id} total=${total}€ items=${items.length}`);

    return NextResponse.json({ session_id: session.id, session_url: session.url });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[stripe/checkout]", err);
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Initialisation du paiement échouée";
    const status = err instanceof Stripe.errors.StripeAuthenticationError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
