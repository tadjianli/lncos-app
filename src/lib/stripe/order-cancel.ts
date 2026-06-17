import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { OrderLineItem } from "@/lib/stripe/order-fulfillment";

function itemsToStockPayload(items: OrderLineItem[]) {
  return items.map((it) => ({
    product_id: it.id,
    variant: it.variant ?? "",
    qty: it.qty,
  }));
}

export async function loadOrderLineItems(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<OrderLineItem[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, name, price, qty, variant")
    .eq("order_id", orderId);

  if (error || !data?.length) return [];

  return data.map((row) => ({
    id: row.product_id,
    name: row.name,
    price: Number(row.price),
    qty: row.qty,
    variant: row.variant ?? undefined,
  }));
}

export async function restockOrderItems(
  supabase: SupabaseClient<Database>,
  items: OrderLineItem[],
): Promise<void> {
  if (!items.length) return;

  const { error } = await supabase.rpc("increment_order_items_stock", {
    items: itemsToStockPayload(items),
  });

  if (error) {
    console.error("[order-cancel] restock failed:", error);
    throw new Error("Échec du réapprovisionnement stock");
  }
}

export async function refundStripeCheckoutSession(
  stripe: Stripe,
  sessionId: string,
): Promise<{ refunded: boolean; reason?: string }> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  if (session.payment_status !== "paid") {
    return { refunded: false, reason: "not_paid" };
  }

  const paymentIntent = session.payment_intent;
  const paymentIntentId =
    typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id ?? null;

  if (!paymentIntentId) {
    return { refunded: false, reason: "no_payment_intent" };
  }

  await stripe.refunds.create({ payment_intent: paymentIntentId });
  return { refunded: true };
}
