/**
 * LN COS — Paramètres légaux & zones de livraison (singleton Supabase)
 */

import type { DeliveryZoneSettings } from "@/lib/delivery-zones";
import { dbToDeliveryZones, deliveryZonesToDb, DEFAULT_DELIVERY_ZONES } from "@/lib/delivery-zones";

export interface LegalSettings {
  hostingInfo: string;
  deliveryZones: DeliveryZoneSettings;
}

export const DEFAULT_LEGAL_SETTINGS: LegalSettings = {
  hostingInfo: "",
  deliveryZones: DEFAULT_DELIVERY_ZONES,
};

export function dbToLegalSettings(
  row: {
    hosting_info?: string | null;
    delivery_reunion?: boolean | null;
    delivery_france?: boolean | null;
    delivery_europe?: boolean | null;
    delivery_international?: boolean | null;
  } | null | undefined
): LegalSettings {
  if (!row) return DEFAULT_LEGAL_SETTINGS;
  return {
    hostingInfo: row.hosting_info?.trim() ?? "",
    deliveryZones: dbToDeliveryZones(row),
  };
}

export function legalSettingsToDb(settings: LegalSettings) {
  return {
    hosting_info: settings.hostingInfo.trim(),
    ...deliveryZonesToDb(settings.deliveryZones),
  };
}

export const LEGAL_CONTACT_EMAIL = "contact@lncos.fr";

export const LEGAL_ADDRESS = {
  line1: "4 rue du Mur Cassé",
  line2: "97450 Saint-Louis",
  region: "La Réunion",
};
