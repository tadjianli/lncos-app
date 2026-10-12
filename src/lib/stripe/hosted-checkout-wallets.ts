import type Stripe from "stripe";

type HostedWalletOptions = NonNullable<Stripe.Checkout.SessionCreateParams["wallet_options"]>;

/** Stripe Checkout — carte + portefeuilles (Apple Pay sur Safari / iPhone). */
export function hostedCheckoutPaymentParams(): {
  payment_method_types: ["card"];
  wallet_options: HostedWalletOptions;
} {
  return {
    payment_method_types: ["card"],
    wallet_options: {
      link: { display: "never" },
      apple_pay: { enabled: true },
      google_pay: { enabled: true },
    } as HostedWalletOptions,
  };
}
