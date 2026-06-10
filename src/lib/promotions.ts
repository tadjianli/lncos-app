/**
 * LN COS — Logique promotions (partagée client + serveur)
 */

export interface PromoLike {
  type: "percentage" | "fixed" | "shipping" | string;
  value: number;
  freeShipping?: boolean;
}

export function computePromoDiscount(promo: PromoLike, subtotal: number): number {
  if (promo.type === "shipping") return 0;
  if (promo.type === "percentage") return parseFloat((subtotal * (promo.value / 100)).toFixed(2));
  if (promo.type === "fixed") return Math.min(promo.value, subtotal);
  return 0;
}

export function promoGrantsFreeShipping(promo: PromoLike): boolean {
  return promo.type === "shipping" || promo.freeShipping === true;
}
