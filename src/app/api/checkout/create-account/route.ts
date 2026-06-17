import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { decodeShippingAddress } from "@/lib/stripe/shipping-address";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

interface CreateAccountBody {
  session_id: string;
  password: string;
  email: string;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * POST /api/checkout/create-account
 * Crée un compte client après paiement réussi et rattache la commande.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
    }

    const body = (await req.json()) as CreateAccountBody;
    const { session_id, password, email: bodyEmail } = body;

    if (!session_id?.trim()) {
      return NextResponse.json({ error: "session_id requis" }, { status: 400 });
    }
    if (!bodyEmail?.trim()) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Mot de passe invalide (min. 8 caractères)" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Paiement non finalisé" }, { status: 402 });
    }
    if (session.metadata?.type !== "shop_order") {
      return NextResponse.json({ error: "Session invalide" }, { status: 400 });
    }

    const sessionEmail =
      session.customer_details?.email?.trim() ??
      session.customer_email?.trim() ??
      null;
    if (!sessionEmail) {
      return NextResponse.json({ error: "Email introuvable sur la session de paiement" }, { status: 400 });
    }

    if (normalizeEmail(bodyEmail) !== normalizeEmail(sessionEmail)) {
      return NextResponse.json({ error: "Email incompatible avec la commande" }, { status: 403 });
    }

    const email = normalizeEmail(sessionEmail);
    const supabase = createServiceClient();

    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.user_id) {
      return NextResponse.json({ ok: true, already_linked: true, user_id: order.user_id });
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (profileRow?.id) {
      return NextResponse.json(
        {
          error: "Un compte existe déjà avec cet email — connectez-vous pour retrouver votre commande",
          code: "account_exists",
        },
        { status: 409 },
      );
    }

    const shipping = decodeShippingAddress(session.metadata ?? {});
    const fullName = shipping
      ? `${shipping.firstName} ${shipping.lastName}`.trim()
      : email.split("@")[0];

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || null },
    });

    if (createErr || !created.user) {
      console.error("[checkout/create-account] createUser:", createErr);
      return NextResponse.json(
        { error: createErr?.message ?? "Impossible de créer le compte" },
        { status: 500 },
      );
    }

    const userId = created.user.id;

    await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName || null,
      phone: shipping?.phone ?? null,
    });

    await supabase.from("orders").update({ user_id: userId }).eq("id", order.id);

    return NextResponse.json({ ok: true, user_id: userId, email });
  } catch (err) {
    console.error("[checkout/create-account]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}
