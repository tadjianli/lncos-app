import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  fulfillStripeOrder,
  OrderValidationError,
  type OrderLineItem,
} from "@/lib/stripe/order-fulfillment";

interface CompleteBody {
  session_id: string;
  items?: OrderLineItem[];
  subtotal?: number;
  shipping_cost?: number;
  discount?: number;
  promo_code?: string;
  total?: number;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/stripe/complete
 * Called after Stripe redirects the user back to /bag?stripe_session_id=xxx.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Paiement non configuré — contactez l'administrateur" }, { status: 503 });
    }

    const body: CompleteBody = await req.json();
    const { session_id, items = [] } = body;

    if (!session_id) {
      return NextResponse.json({ error: "session_id requis" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log(`[stripe/complete] session=${session_id} payment_status=${session.payment_status}`);

    if (session.metadata?.type === "rdv_deposit") {
      return NextResponse.json({ error: "Session RDV — utiliser /api/stripe/rdv-complete" }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY non configurée — impossible de créer la commande." },
        { status: 503 },
      );
    }

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    const supabase = createServiceClient();

    const result = await fulfillStripeOrder({
      session,
      supabase,
      userId: user?.id ?? null,
      clientItems: items,
    });

    return NextResponse.json({
      id: result.id,
      ref: result.ref,
      already_created: result.already_created,
      items_saved: result.items_saved,
    });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[stripe/complete]", err);
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erreur de vérification du paiement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
