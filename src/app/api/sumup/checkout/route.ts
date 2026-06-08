import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createCheckout, SumUpApiError } from "@/lib/sumup";

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
  returnUrl?: string;
}

/**
 * POST /api/sumup/checkout
 * Creates a SumUp hosted checkout session and returns the redirect URL.
 * All SumUp credentials stay server-side.
 */
export async function POST(req: Request) {
  try {
    const body: CheckoutBody = await req.json();
    const { items, total, returnUrl: clientReturnUrl } = body;

    if (!items?.length || total <= 0) {
      return NextResponse.json({ error: "Invalid checkout data" }, { status: 400 });
    }

    if (!process.env.SUMUP_CLIENT_ID || !process.env.SUMUP_CLIENT_SECRET) {
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 503 });
    }

    // Build return URL — use client-supplied if valid, else derive from Host header
    let returnUrl = clientReturnUrl;
    if (!returnUrl?.startsWith("http")) {
      const h = await headers();
      const host = h.get("host") ?? "localhost:3000";
      const proto = host.includes("localhost") ? "http" : "https";
      returnUrl = `${proto}://${host}/bag`;
    }

    // Unique reference: LN- + last 6 chars of base-36 timestamp
    const reference = `LN-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const description = `LN COS · ${items.length} article${items.length > 1 ? "s" : ""}`;

    const { id, checkoutUrl } = await createCheckout({
      reference,
      amount: parseFloat(total.toFixed(2)),
      description,
      returnUrl,
    });

    return NextResponse.json({ checkout_id: id, checkout_url: checkoutUrl, reference });
  } catch (err) {
    console.error("[/api/sumup/checkout]", err);
    const message = err instanceof SumUpApiError
      ? err.userMessage()
      : err instanceof Error ? err.message : "Initialisation du paiement échouée";
    const status = err instanceof SumUpApiError && err.statusCode === 401 ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
