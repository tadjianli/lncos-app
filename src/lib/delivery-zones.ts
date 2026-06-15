/**
 * LN COS — Zones de livraison (paramètres commerçant → SEO & copy)
 */

export interface DeliveryZoneSettings {
  reunion: boolean;
  france: boolean;
  europe: boolean;
  international: boolean;
}

export const DEFAULT_DELIVERY_ZONES: DeliveryZoneSettings = {
  reunion: true,
  france: false,
  europe: false,
  international: false,
};

export const DELIVERY_ZONE_LABELS: { key: keyof DeliveryZoneSettings; label: string }[] = [
  { key: "reunion", label: "La Réunion" },
  { key: "france", label: "France métropolitaine" },
  { key: "europe", label: "Europe" },
  { key: "international", label: "International" },
];

/** Phrase livraison injectée dans meta SEO et descriptions produit. */
export function getSeoDeliveryPhrase(zones: DeliveryZoneSettings): string {
  const broad = zones.france || zones.europe || zones.international;
  if (broad) return "Livraison en France et à l'international";
  return "Livraison rapide";
}

export function dbToDeliveryZones(row: {
  delivery_reunion?: boolean | null;
  delivery_france?: boolean | null;
  delivery_europe?: boolean | null;
  delivery_international?: boolean | null;
} | null | undefined): DeliveryZoneSettings {
  if (!row) return DEFAULT_DELIVERY_ZONES;
  return {
    reunion: row.delivery_reunion ?? DEFAULT_DELIVERY_ZONES.reunion,
    france: row.delivery_france ?? false,
    europe: row.delivery_europe ?? false,
    international: row.delivery_international ?? false,
  };
}

export function deliveryZonesToDb(zones: DeliveryZoneSettings) {
  return {
    delivery_reunion: zones.reunion,
    delivery_france: zones.france,
    delivery_europe: zones.europe,
    delivery_international: zones.international,
  };
}
