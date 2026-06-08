import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCheckoutStatus } from "@/lib/sumup";

interface CompleteBody {
  checkout_id: string;
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

/**
 * POST /api/sumup/complete
 * Called after the user returns from SumUp's hosted checkout.
 * 1. Verifies payment status server-side (SumUp is source of truth).
 * 2. Idempotently creates the order + order_items in Supabase.
 * 3. Returns { id, ref } for the confirmation screen.
 */
export async function POST(req: Request) {
  try {
    const body: CompleteBody = await req.json();
    const {
      checkout_id,
      items = [],
      subtotal = 0,
      shipping_cost = 0,
      discount = 0,
      promo_code,
      total = 0,
    } = body;

    if (!checkout_id) {
      return NextResponse.json({ error: "checkout_id requis" }, { status: 400 });
    }

    if (!process.env.SUMUP_CLIENT_ID || !process.env.SUMUP_CLIENT_SECRET) {
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 503 });
    }

    // ── 1. Verify payment with SumUp ──────────────────────────────
    const checkout = await getCheckoutStatus(checkout_id);

    if (checkout.status !== "PAID") {
      return NextResponse.json(
        {
          error: `Paiement non finalisé (statut : ${checkout.status})`,
          status: checkout.status,
        },
        { status: 402 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ── 2. Idempotency — order already created for this checkout ──
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("sumup_checkout_id", checkout_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ id: existing.id, ref: existing.id, already_created: true });
    }

    // ── 3. Create order ────────────────────────────────────────────
    // Use SumUp-verified amount as the authoritative total
    const verifiedTotal = checkout.amount > 0 ? checkout.amount : total;
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
        sumup_checkout_id: checkout_id,
        payment_provider: "sumup",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("[/api/sumup/complete] order insert:", orderErr);
      return NextResponse.json({ error: "Erreur de création de commande" }, { status: 500 });
    }

    // ── 4. Increment promo usage count ────────────────────────────
    if (promo_code) {
      await supabase.rpc("increment_promo_uses", { promo_code_arg: promo_code });
    }

    // ── 5. Insert order items ──────────────────────────────────────
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
      if (itemsErr) console.warn("[/api/sumup/complete] order_items insert:", itemsErr);
    }

    return NextResponse.json({ id: order.id, ref: order.id });
  } catch (err) {
    console.error("[/api/sumup/complete]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur de vérification du paiement" },
      { status: 500 }
    );
  }
}
