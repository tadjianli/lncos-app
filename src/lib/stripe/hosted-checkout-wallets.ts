import type Stripe from "stripe";

type HostedWalletOptions = NonNullable<Stripe.Checkout.SessionCreateParams["wallet_options"]>;

/**
 * Stripe Checkout — portefeuilles express (Apple Pay, etc.).
 * Sur Chrome/desktop, Apple Pay ouvre pay.apple.com et échoue souvent ;
 * on privilégie le formulaire carte classique pour les acomptes RDV / panier.
 */
export function cardFirstHostedCheckoutParams(): {
  payment_method_types: ["card"];
  wallet_options: HostedWalletOptions;
} {
  return {
    payment_method_types: ["card"],
    wallet_options: {
      link: { display: "never" },
      apple_pay: { enabled: false },
      google_pay: { enabled: false },
    } as HostedWalletOptions,
  };
}
