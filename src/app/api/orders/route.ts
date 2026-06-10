import { NextResponse } from "next/server";

/**
 * Route legacy désactivée — les commandes passent exclusivement par Stripe Checkout.
 * @see /api/stripe/checkout + /api/stripe/complete
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Cette route est désactivée. Utilisez le paiement Stripe via le panier.",
    },
    { status: 410 }
  );
}
