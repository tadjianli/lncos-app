/**
 * Routes et états UI du tunnel de commande LN COS.
 * UI uniquement — aucune logique métier / paiement.
 */

/** Préfixe des routes checkout dédiées (ex. /checkout/address). */
export const CHECKOUT_ROUTE_PREFIX = "/checkout";

/** Routes checkout connues (documentation + garde-fous). */
export const CHECKOUT_ROUTES = [
  "/checkout",
  "/checkout/address",
  "/checkout/shipping",
  "/checkout/payment",
  "/checkout/confirmation",
] as const;

export function isCheckoutRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === CHECKOUT_ROUTE_PREFIX ||
    pathname.startsWith(`${CHECKOUT_ROUTE_PREFIX}/`)
  );
}

/**
 * Mode focus conversion : masquer tab bar, FAB panier et distractions.
 * - Routes /checkout/*
 * - Écran checkout interne /bag (bottomNav désactivé côté page)
 */
export function isCheckoutFocusMode(
  pathname: string | null | undefined,
  bottomNavEnabled: boolean
): boolean {
  if (isCheckoutRoute(pathname)) return true;
  if (pathname === "/bag" || pathname?.startsWith("/bag/")) {
    return !bottomNavEnabled;
  }
  return false;
}
