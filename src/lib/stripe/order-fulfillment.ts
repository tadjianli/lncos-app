import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { sendOrderConfirmationEmail } from "@/lib/email/order-emails";
import { notifyAdminsNewOrder } from "@/lib/push/notify-admins";
import {
  decodeShippingAddress,
  shippingAddressToJson,
  type ShippingAddress,
} from "@/lib/stripe/shipping-address";

export interface OrderLineItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  variant?: string;
  image_url?: string | null;
}

type CatalogProduct = {
  name: string;
  price: number;
  stock: number;
  variants: Array<{ name: string; price: number; stock: number }>;
};

export class OrderValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Compact snapshot stored in Stripe session metadata (survives redirect / webhook). */
export function encodeItemsSnapshot(items: OrderLineItem[]): Record<string, string> {
  const compact = items
    .map(
      (it) =>
        `${it.id}|${it.qty}|${encodeURIComponent(it.variant ?? "")}|${it.price.toFixed(2)}|${encodeURIComponent(it.name.slice(0, 48))}`,
    )
    .join(";");

  const meta: Record<string, string> = {};
  if (compact.length <= 500) {
    meta.items_snapshot = compact;
    return meta;
  }

  let remaining = compact;
  let chunk = 0;
  while (remaining.length > 0 && chunk < 12) {
    let part = remaining.slice(0, 450);
    if (remaining.length > 450) {
      const lastSemi = part.lastIndexOf(";");
      if (lastSemi > 0) part = part.slice(0, lastSemi);
    }
    meta[`items_${chunk}`] = part;
    remaining = remaining.slice(part.length + (remaining[part.length] === ";" ? 1 : 0));
    chunk += 1;
  }
  meta.items_chunks = String(chunk);
  return meta;
}

export function decodeItemsSnapshot(metadata: Stripe.Metadata | null | undefined): OrderLineItem[] | null {
  if (!metadata) return null;
  if (metadata.items_snapshot) return parseCompactSnapshot(metadata.items_snapshot);

  const chunks = parseInt(metadata.items_chunks ?? "0", 10);
  if (chunks <= 0) return null;

  let raw = "";
  for (let i = 0; i < chunks; i++) {
    if (i > 0 && raw.length > 0 && !raw.endsWith(";")) raw += ";";
    raw += metadata[`items_${i}`] ?? "";
  }
  return parseCompactSnapshot(raw);
}

function parseCompactSnapshot(raw: string): OrderLineItem[] {
  return raw
    .split(";")
    .filter(Boolean)
    .map((part) => {
      const segments = part.split("|");
      const [id, qtyStr, variantEnc, priceStr, nameEnc] = segments;
      return {
        id,
        name: decodeURIComponent(nameEnc ?? ""),
        price: parseFloat(priceStr),
        qty: parseInt(qtyStr, 10),
        variant: decodeURIComponent(variantEnc ?? "") || undefined,
      };
    })
    .filter((it) => it.id && it.qty > 0 && Number.isFinite(it.price));
}

export async function loadCatalog(
  supabase: SupabaseClient<Database>,
  productIds: string[],
): Promise<Map<string, CatalogProduct>> {
  const { data: catalogRows, error } = await supabase
    .from("products")
    .select("id, name, price, active, stock, product_variants(name, price, stock)")
    .in("id", productIds)
    .eq("active", true);

  if (error || !catalogRows?.length) {
    throw new OrderValidationError("Produits invalides ou indisponibles", 400);
  }

  return new Map(
    catalogRows.map((row) => [
      row.id,
      {
        name: row.name as string,
        price: Number(row.price),
        stock: Number(row.stock ?? 0),
        variants: ((row.product_variants ?? []) as Array<{ name: string; price: number; stock: number }>).map(
          (v) => ({
            name: v.name,
            price: Number(v.price),
            stock: Number(v.stock ?? 0),
          }),
        ),
      },
    ]),
  );
}

/** Revalidate cart lines against live catalogue (price, variant, stock). */
export async function validateOrderItems(
  supabase: SupabaseClient<Database>,
  items: OrderLineItem[],
): Promise<OrderLineItem[]> {
  if (!items.length) {
    throw new OrderValidationError("Panier vide", 400);
  }

  const productIds = [...new Set(items.map((it) => it.id))];
  const catalog = await loadCatalog(supabase, productIds);
  const validated: OrderLineItem[] = [];

  for (const item of items) {
    const product = catalog.get(item.id);
    if (!product) {
      throw new OrderValidationError(`Produit introuvable : ${item.id}`, 400);
    }

    const hasVariants = product.variants.length > 0;
    const variant = item.variant ? product.variants.find((v) => v.name === item.variant) : null;

    if (hasVariants && !variant) {
      throw new OrderValidationError(`Variante invalide pour ${product.name}`, 400);
    }

    const unitPrice = variant ? variant.price : product.price;
    if (Math.abs(unitPrice - item.price) > 0.02) {
      throw new OrderValidationError(`Prix invalide pour ${product.name}`, 400);
    }

    const available = variant ? variant.stock : product.stock;
    if (available < item.qty) {
      throw new OrderValidationError(`Stock insuffisant pour ${product.name}`, 400);
    }

    validated.push({
      ...item,
      name: item.name?.trim() || product.name,
      price: unitPrice,
      variant: variant?.name ?? item.variant,
    });
  }

  return validated;
}

async function countOrderItems(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<number> {
  const { count } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);
  return count ?? 0;
}

async function insertOrderItems(
  supabase: SupabaseClient<Database>,
  orderId: string,
  items: OrderLineItem[],
): Promise<void> {
  if (!items.length) return;

  const rows = items.map((it) => ({
    order_id: orderId,
    product_id: it.id,
    name: it.name,
    price: it.price,
    qty: it.qty,
    variant: it.variant ?? null,
    image_url: it.image_url ?? null,
  }));

  const { error } = await supabase.from("order_items").insert(rows);
  if (error) {
    throw new OrderValidationError("Erreur enregistrement des articles de commande", 500);
  }
}

function itemsToStockPayload(items: OrderLineItem[]) {
  return items.map((it) => ({
    product_id: it.id,
    variant: it.variant ?? "",
    qty: it.qty,
  }));
}

async function applyStockDecrement(
  supabase: SupabaseClient<Database>,
  items: OrderLineItem[],
): Promise<void> {
  if (!items.length) return;

  const { error } = await supabase.rpc("decrement_order_items_stock", {
    items: itemsToStockPayload(items),
  });

  if (error) {
    console.error("[stripe/fulfill] stock decrement:", error);
    throw new OrderValidationError("Stock insuffisant — commande non finalisée", 409);
  }
}

async function applyStockIncrementRollback(
  supabase: SupabaseClient<Database>,
  items: OrderLineItem[],
): Promise<void> {
  if (!items.length) return;

  const { error } = await supabase.rpc("increment_order_items_stock", {
    items: itemsToStockPayload(items),
  });

  if (error) {
    console.error("[stripe/fulfill] stock rollback failed:", error);
  }
}

async function markStockAdjusted(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ stock_adjusted: true })
    .eq("id", orderId)
    .eq("stock_adjusted", false);

  if (error) {
    console.error("[stripe/fulfill] stock_adjusted flag:", error);
  }
}

async function applyPromoOnce(
  supabase: SupabaseClient<Database>,
  orderId: string,
  promoCode: string | null,
  alreadyApplied: boolean,
): Promise<void> {
  if (!promoCode || alreadyApplied) return;

  await supabase.rpc("increment_promo_uses", { promo_code_arg: promoCode });
  await supabase.from("orders").update({ promo_uses_applied: true }).eq("id", orderId);
}

async function maybeSendConfirmationEmail(
  supabase: SupabaseClient<Database>,
  orderId: string,
  session: Stripe.Checkout.Session,
  total: number,
  items: OrderLineItem[],
  shippingAddress: ShippingAddress | null,
): Promise<void> {
  const to = session.customer_details?.email ?? session.customer_email ?? null;
  if (!to) return;

  const { data: row } = await supabase
    .from("orders")
    .select("confirmation_email_sent_at")
    .eq("id", orderId)
    .maybeSingle();

  if (row?.confirmation_email_sent_at) return;

  const sent = await sendOrderConfirmationEmail({
    to,
    orderRef: orderId,
    total,
    items,
    shippingAddress,
  });

  if (sent) {
    await supabase
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}

async function finalizeOrderFulfillment(
  supabase: SupabaseClient<Database>,
  orderId: string,
  session: Stripe.Checkout.Session,
  items: OrderLineItem[],
  verifiedTotal: number,
  shippingAddress: ShippingAddress | null,
  stockAdjusted: boolean,
  notifyAdmin: boolean,
): Promise<number> {
  let itemsSaved = items.length;

  if (!stockAdjusted && items.length) {
    await applyStockDecrement(supabase, items);
    await markStockAdjusted(supabase, orderId);
  }

  if (items.length) {
    await maybeSendConfirmationEmail(supabase, orderId, session, verifiedTotal, items, shippingAddress);
  }

  if (notifyAdmin) {
    await notifyAdminsNewOrder(orderId, verifiedTotal);
  }

  return itemsSaved;
}

export interface FulfillOrderInput {
  session: Stripe.Checkout.Session;
  supabase: SupabaseClient<Database>;
  userId?: string | null;
  clientItems?: OrderLineItem[];
}

export interface FulfillOrderResult {
  id: string;
  ref: string;
  already_created: boolean;
  items_saved: number;
}

/**
 * Idempotent order creation + line items from Stripe session metadata or validated client snapshot.
 */
export async function fulfillStripeOrder(input: FulfillOrderInput): Promise<FulfillOrderResult> {
  const { session, supabase, userId, clientItems = [] } = input;
  const sessionId = session.id;

  if (session.payment_status !== "paid") {
    throw new OrderValidationError(`Paiement non finalisé (${session.payment_status})`, 402);
  }

  const meta = session.metadata ?? {};
  const promoCode = meta.promo_code?.trim() || null;
  const shippingCost = parseFloat(meta.shipping_cost ?? "0") || 0;
  const discount = parseFloat(meta.discount ?? "0") || 0;
  const verifiedTotal = session.amount_total ? session.amount_total / 100 : 0;
  const verifiedSubtotal =
    parseFloat(meta.subtotal ?? "0") || Math.max(0, verifiedTotal - shippingCost + discount);
  const shippingAddress = decodeShippingAddress(meta);
  const shippingAddressJson = shippingAddress ? shippingAddressToJson(shippingAddress) : null;

  let items =
    decodeItemsSnapshot(meta) ??
    (clientItems.length ? clientItems : null);

  if (items?.length) {
    items = await validateOrderItems(supabase, items);
  }

  const { data: existing } = await supabase
    .from("orders")
    .select(
      "id, subtotal, shipping_cost, discount, promo_code, total, stock_adjusted, shipping_address, promo_uses_applied",
    )
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (existing) {
    const existingCount = await countOrderItems(supabase, existing.id);
    if (existingCount === 0 && items?.length) {
      await insertOrderItems(supabase, existing.id, items);
      if (!existing.shipping_address && shippingAddressJson) {
        await supabase.from("orders").update({ shipping_address: shippingAddressJson }).eq("id", existing.id);
      }
      await finalizeOrderFulfillment(
        supabase,
        existing.id,
        session,
        items,
        verifiedTotal,
        shippingAddress,
        Boolean(existing.stock_adjusted),
        false,
      );
      return { id: existing.id, ref: existing.id, already_created: true, items_saved: items.length };
    }

    if (items?.length && !existing.stock_adjusted) {
      await finalizeOrderFulfillment(
        supabase,
        existing.id,
        session,
        items,
        verifiedTotal,
        shippingAddress,
        false,
        false,
      );
    } else if (items?.length) {
      await maybeSendConfirmationEmail(supabase, existing.id, session, verifiedTotal, items, shippingAddress);
    }

    await applyPromoOnce(supabase, existing.id, promoCode, Boolean(existing.promo_uses_applied));

    return { id: existing.id, ref: existing.id, already_created: true, items_saved: existingCount || (items?.length ?? 0) };
  }

  let stockReserved = false;

  try {
    if (items?.length) {
      await applyStockDecrement(supabase, items);
      stockReserved = true;
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId ?? null,
        subtotal: verifiedSubtotal,
        shipping_cost: shippingCost,
        discount,
        ...(promoCode ? { promo_code: promoCode } : {}),
        total: verifiedTotal,
        status: "preparing",
        payment_status: "paid",
        stripe_session_id: sessionId,
        payment_provider: "stripe",
        ...(shippingAddressJson ? { shipping_address: shippingAddressJson } : {}),
      })
      .select("id")
      .single();

    if (orderErr) {
      if (orderErr.code === "23505") {
        const { data: raced } = await supabase
          .from("orders")
          .select("id")
          .eq("stripe_session_id", sessionId)
          .maybeSingle();
        if (raced) {
          if (stockReserved && items?.length) {
            await applyStockIncrementRollback(supabase, items);
          }
          return fulfillStripeOrder({ ...input, clientItems: items ?? clientItems });
        }
      }
      console.error("[stripe/fulfill] order insert:", orderErr);
      throw new OrderValidationError("Erreur de création de commande", 500);
    }

    if (!order) {
      throw new OrderValidationError("Erreur de création de commande", 500);
    }

    stockReserved = false;

    let itemsSaved = 0;
    if (items?.length) {
      await insertOrderItems(supabase, order.id, items);
      await markStockAdjusted(supabase, order.id);
      itemsSaved = items.length;
      await maybeSendConfirmationEmail(supabase, order.id, session, verifiedTotal, items, shippingAddress);
      await notifyAdminsNewOrder(order.id, verifiedTotal);
    } else {
      console.warn(`[stripe/fulfill] order ${order.id} created without line items (session=${sessionId})`);
      await notifyAdminsNewOrder(order.id, verifiedTotal);
    }

    await applyPromoOnce(supabase, order.id, promoCode, false);

    return { id: order.id, ref: order.id, already_created: false, items_saved: itemsSaved };
  } catch (err) {
    if (stockReserved && items?.length) {
      await applyStockIncrementRollback(supabase, items);
    }
    throw err;
  }
}
