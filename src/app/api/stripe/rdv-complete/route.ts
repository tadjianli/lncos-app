import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { calcDeposit, dbToRdvSettings } from "@/lib/rdv-settings";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/stripe/rdv-complete
 * Verifies RDV deposit payment and confirms the appointment.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });
    }

    const { session_id } = await req.json();
    if (!session_id) {
      return NextResponse.json({ error: "session_id requis" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Paiement non finalisé (${session.payment_status})` },
        { status: 402 },
      );
    }

    if (session.metadata?.type !== "rdv_deposit") {
      return NextResponse.json({ error: "Session invalide pour un rendez-vous" }, { status: 400 });
    }

    const appointmentId = session.metadata?.appointment_id;
    if (!appointmentId) {
      return NextResponse.json({ error: "Réservation introuvable dans la session" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: appt, error: fetchErr } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .maybeSingle();

    if (fetchErr || !appt) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    if (appt.stripe_session_id && appt.stripe_session_id !== session_id) {
      return NextResponse.json({ error: "Session de paiement non associée à ce rendez-vous" }, { status: 403 });
    }

    if (appt.payment_status === "deposit" || appt.payment_status === "paid") {
      return NextResponse.json({
        ok: true,
        already_confirmed: true,
        appointment: appt,
      });
    }

    const { data: settingsRow } = await supabase.from("rdv_settings").select("*").eq("id", "default").maybeSingle();
    const settings = dbToRdvSettings(settingsRow);
    const expectedDeposit = calcDeposit(Number(appt.price), settings);
    const verifiedDeposit = session.amount_total ? session.amount_total / 100 : expectedDeposit;

    if (expectedDeposit > 0 && verifiedDeposit + 0.02 < expectedDeposit) {
      return NextResponse.json({ error: "Montant d'acompte insuffisant" }, { status: 402 });
    }

    const { data: updated, error: updateErr } = await supabase
      .from("appointments")
      .update({
        payment_status: "deposit",
        status: "confirmed",
        deposit: verifiedDeposit,
        stripe_session_id: session_id,
      })
      .eq("id", appointmentId)
      .select("*")
      .single();

    if (updateErr || !updated) {
      console.error("[stripe/rdv-complete] update:", updateErr);
      return NextResponse.json({ error: "Erreur de confirmation du rendez-vous" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, appointment: updated });
  } catch (err) {
    console.error("[stripe/rdv-complete]", err);
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erreur de vérification du paiement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
