import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * POST /api/sumup/webhook
 * Backup webhook handler — fires when SumUp sends CHECKOUT_STATUS_CHANGED events.
 * Idempotent: creates the order only if /api/sumup/complete has not already done so.
 *
 * Configure in SumUp Dashboard → Integrations → Webhooks.
 * Set SUMUP_WEBHOOK_SECRET in env → SumUp sends it in x-api-key or x-webhook-secret header.
 */
export async function POST(req: Request) {
  try {
    // Optional secret verification
    const secret = process.env.SUMUP_WEBHOOK_SECRET;
    if (secret) {
      const incomingKey =
        req.headers.get("x-api-key") ?? req.headers.get("x-webhook-secret") ?? "";
      if (incomingKey !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await req.json();

    // Only handle successful payments
    if (payload.status !== "PAID") {
      return NextResponse.json({ received: true });
    }

    const checkoutId: string = payload.id ?? payload.checkout_id ?? "";
    if (!checkoutId) {
      return NextResponse.json({ error: "Missing checkout id" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Idempotency — skip if order already exists for this checkout
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("sumup_checkout_id", checkoutId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true, already_created: true });
    }

    // Fallback order creation (in case the redirect flow never completed)
    const amount: number = payload.amount ?? 0;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: null,
        subtotal: amount,
        shipping_cost: 0,
        total: amount,
        status: "preparing",
        payment_status: "paid",
        sumup_checkout_id: checkoutId,
        payment_provider: "sumup",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[/api/sumup/webhook] order insert:", error);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    console.log("[/api/sumup/webhook] fallback order created:", order?.id);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[/api/sumup/webhook]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
