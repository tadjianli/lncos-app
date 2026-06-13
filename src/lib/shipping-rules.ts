/**
 * LN COS — Règles de livraison (calcul, éligibilité, validation, libellés)
 */

import type { ShippingMethod } from "@/lib/shipping/method";

export type ShippingMethodInput = Omit<ShippingMethod, "id" | "createdAt">;

export interface ShippingRulesValidation {
  valid: boolean;
  errors: string[];
}

/** Méthode visible au checkout pour ce montant de panier (hors is_active). */
export function isShippingMethodEligible(
  method: Pick<
    ShippingMethod,
    | "minimumOrderEnabled"
    | "minimumOrderAmount"
    | "maximumOrderEnabled"
    | "maximumOrderAmount"
  >,
  subtotal: number
): boolean {
  if (method.minimumOrderEnabled) {
    const min = method.minimumOrderAmount;
    if (min == null || subtotal < min) return false;
  }
  if (method.maximumOrderEnabled) {
    const max = method.maximumOrderAmount;
    if (max != null && subtotal > max) return false;
  }
  return true;
}

/** Frais de livraison pour une méthode et un sous-total donné. */
export function computeShippingCost(
  method: Pick<
    ShippingMethod,
    | "price"
    | "isFree"
    | "freeShippingEnabled"
    | "freeShippingThreshold"
  >,
  subtotal: number,
  promoFreeShipping = false
): number {
  if (promoFreeShipping || method.isFree) return 0;
  if (
    method.freeShippingEnabled &&
    method.freeShippingThreshold != null &&
    subtotal >= method.freeShippingThreshold
  ) {
    return 0;
  }
  return Math.max(0, method.price);
}

export function filterEligibleShippingMethods(
  methods: ShippingMethod[],
  subtotal: number
): ShippingMethod[] {
  return methods.filter((m) => m.isActive && isShippingMethodEligible(m, subtotal));
}

export function validateShippingMethodForm(
  form: ShippingMethodInput
): ShippingRulesValidation {
  const errors: string[] = [];

  if (!form.name.trim()) {
    errors.push("Le nom est obligatoire.");
  }

  if (form.price < 0) {
    errors.push("Le prix ne peut pas être négatif.");
  }

  if (form.freeShippingEnabled) {
    if (form.freeShippingThreshold == null || form.freeShippingThreshold <= 0) {
      errors.push("Indiquez un montant valide pour la livraison offerte.");
    }
  }

  if (form.minimumOrderEnabled) {
    if (form.minimumOrderAmount == null || form.minimumOrderAmount <= 0) {
      errors.push("Indiquez un montant minimum de commande valide.");
    }
  }

  if (form.maximumOrderEnabled) {
    if (form.maximumOrderAmount == null || form.maximumOrderAmount <= 0) {
      errors.push("Indiquez un montant maximum de commande valide.");
    }
  }

  if (
    form.minimumOrderEnabled &&
    form.maximumOrderEnabled &&
    form.minimumOrderAmount != null &&
    form.maximumOrderAmount != null &&
    form.minimumOrderAmount > form.maximumOrderAmount
  ) {
    errors.push("Le minimum de commande ne peut pas dépasser le maximum.");
  }

  return { valid: errors.length === 0, errors };
}

export function getShippingAdminBadges(method: ShippingMethod): string[] {
  const badges: string[] = [];
  if (method.isFree) badges.push("GRATUIT");
  if (method.freeShippingEnabled && method.freeShippingThreshold != null) {
    badges.push(`OFFERT DÈS ${formatEuro(method.freeShippingThreshold)}`);
  }
  if (method.minimumOrderEnabled && method.minimumOrderAmount != null) {
    badges.push(`MIN ${formatEuro(method.minimumOrderAmount)}`);
  }
  if (method.maximumOrderEnabled && method.maximumOrderAmount != null) {
    badges.push(`MAX ${formatEuro(method.maximumOrderAmount)}`);
  }
  badges.push(method.isActive ? "ACTIF" : "INACTIF");
  return badges;
}

export function getShippingPreviewConditions(method: ShippingMethodInput): string[] {
  const lines: string[] = [];
  if (method.isFree) {
    lines.push("✓ Toujours gratuite");
  }
  if (method.freeShippingEnabled && method.freeShippingThreshold != null) {
    lines.push(`✓ Offert dès ${formatEuro(method.freeShippingThreshold)}`);
  }
  if (method.minimumOrderEnabled && method.minimumOrderAmount != null) {
    lines.push(`✓ Disponible à partir de ${formatEuro(method.minimumOrderAmount)}`);
  }
  if (method.maximumOrderEnabled && method.maximumOrderAmount != null) {
    lines.push(`✓ Disponible jusqu'à ${formatEuro(method.maximumOrderAmount)}`);
  }
  if (lines.length === 0) {
    lines.push("✓ Aucune condition supplémentaire");
  }
  return lines;
}

/** Libellés secondaires affichés au client (sous le délai). */
export function getShippingClientHints(method: ShippingMethod, subtotal: number): string[] {
  const hints: string[] = [];
  if (method.isFree) {
    hints.push("Gratuite");
    return hints;
  }
  if (
    method.freeShippingEnabled &&
    method.freeShippingThreshold != null
  ) {
    if (subtotal >= method.freeShippingThreshold) {
      hints.push("Offerte");
    } else {
      hints.push(`Offerte dès ${formatEuro(method.freeShippingThreshold)}`);
    }
  }
  if (method.minimumOrderEnabled && method.minimumOrderAmount != null) {
    hints.push(`Disponible dès ${formatEuro(method.minimumOrderAmount)}`);
  }
  if (method.maximumOrderEnabled && method.maximumOrderAmount != null) {
    hints.push(`Jusqu'à ${formatEuro(method.maximumOrderAmount)}`);
  }
  return hints;
}

export function formatShippingPriceLabel(
  method: ShippingMethod,
  subtotal: number,
  promoFreeShipping = false
): string {
  const cost = computeShippingCost(method, subtotal, promoFreeShipping);
  return cost === 0 ? "Gratuit" : `${cost.toFixed(2).replace(".", ",")} €`;
}

function formatEuro(amount: number): string {
  return `${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2).replace(".", ",")}€`;
}
