/**
 * Suivi colis — transporteurs, URLs et libellés partagés client / admin / emails.
 */

export type OrderStatus = "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";

export const TRACKABLE_STATUSES: OrderStatus[] = ["shipped", "in_transit", "delivered"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  preparing: "En préparation",
  shipped: "Expédiée",
  in_transit: "En transit",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export interface OrderCarrier {
  id: string;
  label: string;
  buildUrl: (trackingNumber: string) => string;
}

export const ORDER_CARRIERS: OrderCarrier[] = [
  {
    id: "colissimo",
    label: "Colissimo",
    buildUrl: (n) =>
      `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(n)}`,
  },
  {
    id: "chronopost",
    label: "Chronopost",
    buildUrl: (n) =>
      `https://www.chronopost.fr/tracking-no-cms/suivi-page?langue=fr&numeroEnvoi=${encodeURIComponent(n)}`,
  },
  {
    id: "mondial_relay",
    label: "Mondial Relay",
    buildUrl: (n) =>
      `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encodeURIComponent(n)}`,
  },
  {
    id: "dhl",
    label: "DHL",
    buildUrl: (n) =>
      `https://www.dhl.com/fr-fr/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(n)}`,
  },
  {
    id: "ups",
    label: "UPS",
    buildUrl: (n) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  },
  {
    id: "fedex",
    label: "FedEx",
    buildUrl: (n) =>
      `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  },
  {
    id: "other",
    label: "Autre",
    buildUrl: () => "",
  },
];

export function carrierLabel(carrierId: string | null | undefined): string | null {
  if (!carrierId?.trim()) return null;
  const found = ORDER_CARRIERS.find((c) => c.id === carrierId);
  if (found && found.id !== "other") return found.label;
  return carrierId.trim();
}

export function buildCarrierTrackingUrl(
  carrier: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null {
  const number = trackingNumber?.trim();
  if (!number) return null;

  const carrierId = carrier?.trim();
  if (!carrierId) return null;

  const preset = ORDER_CARRIERS.find((c) => c.id === carrierId);
  if (preset && preset.id !== "other") {
    const url = preset.buildUrl(number);
    return url || null;
  }

  return null;
}

/** URL effective : admin > template transporteur. */
export function resolveOrderTrackingUrl(input: {
  trackingUrl?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
}): string | null {
  const custom = input.trackingUrl?.trim();
  if (custom) {
    try {
      const parsed = new URL(custom);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return custom;
    } catch {
      /* ignore invalid URL */
    }
  }

  return buildCarrierTrackingUrl(input.carrier, input.trackingNumber);
}

export function isTrackableStatus(status: OrderStatus): boolean {
  return TRACKABLE_STATUSES.includes(status);
}
