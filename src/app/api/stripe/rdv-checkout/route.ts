import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { calcDeposit, dbToRdvSettings } from "@/lib/rdv-settings";
import { resolveCheckoutOrigin } from "@/lib/stripe/checkout-origin";

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
 * Creates a Stripe Checkout Session for an RDV deposit (amount validated server-side).
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Paiement non configuré — contactez l'administrateur" },
        { status: 503 },
      );
    }

    const body: RdvCheckoutBody = await req.json();
    const { appointment_id, service_name, returnUrl: _clientReturnUrl } = body;

    if (!appointment_id) {
      return NextResponse.json({ error: "Données de réservation invalides" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: appt, error: apptErr } = await supabase
      .from("appointments")
      .select("id, status, price, deposit, payment_status, stripe_session_id")
      .eq("id", appointment_id)
      .maybeSingle();

    if (apptErr || !appt) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    if (appt.payment_status === "deposit" || appt.payment_status === "paid") {
      return NextResponse.json({ error: "Ce rendez-vous est déjà payé" }, { status: 400 });
    }

    if (appt.status === "cancelled") {
      return NextResponse.json({ error: "Ce rendez-vous a été annulé" }, { status: 400 });
    }

    const { data: settingsRow } = await supabase.from("rdv_settings").select("*").eq("id", "default").maybeSingle();
    const settings = dbToRdvSettings(settingsRow);
    const expectedDeposit = calcDeposit(Number(appt.price), settings);

    if (expectedDeposit <= 0) {
      return NextResponse.json({ error: "Aucun acompte requis pour ce rendez-vous" }, { status: 400 });
    }

    if (Math.abs(Number(appt.deposit) - expectedDeposit) > 0.02) {
      await supabase.from("appointments").update({ deposit: expectedDeposit }).eq("id", appointment_id);
    }

    if (body.deposit_amount != null && Math.abs(body.deposit_amount - expectedDeposit) > 0.02) {
      console.warn(
        `[stripe/rdv-checkout] deposit mismatch client=${body.deposit_amount} server=${expectedDeposit}`,
      );
    }

    if (appt.stripe_session_id) {
      try {
        const existing = await stripe.checkout.sessions.retrieve(appt.stripe_session_id);
        if (existing.url && existing.payment_status !== "paid") {
          return NextResponse.json({ url: existing.url, session_id: existing.id });
        }
      } catch {
        /* session expired — create a new one */
      }
    }

    const origin = resolveCheckoutOrigin(req);

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
            unit_amount: Math.round(expectedDeposit * 100),
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
      .update({ stripe_session_id: session.id, deposit: expectedDeposit })
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
