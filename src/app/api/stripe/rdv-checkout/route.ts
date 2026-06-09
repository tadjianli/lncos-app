import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

interface RdvCheckoutBody {
  appointment_id: string;
  deposit_amount: number;
  service_name: string;
  returnUrl?: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/stripe/rdv-checkout
 * Creates a Stripe Checkout Session for an RDV deposit.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Paiement non configuré — contactez l'administrateur" },
        { status: 503 }
      );
    }

    const body: RdvCheckoutBody = await req.json();
    const { appointment_id, deposit_amount, service_name, returnUrl: clientReturnUrl } = body;

    if (!appointment_id || deposit_amount <= 0) {
      return NextResponse.json({ error: "Données de réservation invalides" }, { status: 400 });
    }

    const supabase = await createSupabaseServiceClient();
    const { data: appt, error: apptErr } = await supabase
      .from("appointments")
      .select("id, status, deposit, stripe_session_id")
      .eq("id", appointment_id)
      .maybeSingle();

    if (apptErr || !appt) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    if (appt.stripe_session_id) {
      const existing = await stripe.checkout.sessions.retrieve(appt.stripe_session_id);
      if (existing.url && existing.payment_status !== "paid") {
        return NextResponse.json({ url: existing.url, session_id: existing.id });
      }
    }

    let origin = clientReturnUrl?.startsWith("http") ? new URL(clientReturnUrl).origin : null;
    if (!origin) {
      const h = await headers();
      const host = h.get("host") ?? "localhost:3000";
      const proto = host.includes("localhost") ? "http" : "https";
      origin = `${proto}://${host}`;
    }

    const successUrl = `${origin}/rdv?rdv_session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/rdv`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Acompte — ${service_name}`,
              description: "Réservation institut LN COS",
            },
            unit_amount: Math.round(deposit_amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: "rdv_deposit",
        appointment_id,
      },
    });

    await supabase
      .from("appointments")
      .update({ stripe_session_id: session.id })
      .eq("id", appointment_id);

    return NextResponse.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error("[stripe/rdv-checkout]", err);
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erreur de création du paiement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
