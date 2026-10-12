import type Stripe from "stripe";

/**
 * Stripe Checkout — carte (+ Apple Pay auto sur Safari/iPhone si domaine validé).
 * Ne pas passer apple_pay/google_pay dans wallet_options : l'API renvoie
 * "Received unknown parameters: apple_pay, google_pay".
 */
export function hostedCheckoutPaymentParams(): Pick<
  Stripe.Checkout.SessionCreateParams,
  "payment_method_types" | "wallet_options"
> {
  return {
    payment_method_types: ["card"],
    wallet_options: {
      link: { display: "never" },
    },
  };
}
