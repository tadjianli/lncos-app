export interface LegalSettings {
  hostingInfo: string;
}

export const DEFAULT_LEGAL_SETTINGS: LegalSettings = {
  hostingInfo: "",
};

export function dbToLegalSettings(
  row: { hosting_info?: string | null } | null | undefined
): LegalSettings {
  if (!row) return DEFAULT_LEGAL_SETTINGS;
  return {
    hostingInfo: row.hosting_info?.trim() ?? "",
  };
}

export function legalSettingsToDb(settings: LegalSettings) {
  return {
    hosting_info: settings.hostingInfo.trim(),
  };
}

export const LEGAL_CONTACT_EMAIL = "contact@lncos.fr";

export const LEGAL_ADDRESS = {
  line1: "4 rue du Mur Cassé",
  line2: "97450 Saint-Louis",
  region: "La Réunion",
};
