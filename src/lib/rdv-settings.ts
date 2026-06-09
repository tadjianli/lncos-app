/**
 * LN COS — RDV page settings (singleton config)
 */

export type DepositType = "percent" | "fixed";

export interface RdvSettings {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  trust1Icon: string;
  trust1Text: string;
  trust2Icon: string;
  trust2Text: string;
  trust3Icon: string;
  trust3Text: string;
  confirmTitle: string;
  confirmReminder: string;
  locationName: string;
  depositEnabled: boolean;
  depositType: DepositType;
  depositValue: number;
  depositLabel: string;
  depositMinAmount: number;
}

export const DEFAULT_RDV_SETTINGS: RdvSettings = {
  heroEyebrow: "Institut onglerie",
  heroTitle: "Réservez votre moment beauté",
  heroSubtitle: "En moins de 60 secondes, sans appel.",
  ctaLabel: "Prendre rendez-vous",
  trust1Icon: "clock",
  trust1Text: "Dispo. temps réel",
  trust2Icon: "bell",
  trust2Text: "Rappel auto.",
  trust3Icon: "star",
  trust3Text: "+ points VIP",
  confirmTitle: "Rendez-vous confirmé ✨",
  confirmReminder: "Un rappel vous sera envoyé 24h avant.",
  locationName: "Institut LN COS",
  depositEnabled: false,
  depositType: "percent",
  depositValue: 30,
  depositLabel: "Acompte à régler maintenant",
  depositMinAmount: 0,
};

export function calcDeposit(total: number, settings: RdvSettings): number {
  if (!settings.depositEnabled || total < settings.depositMinAmount) return 0;
  if (settings.depositType === "percent") {
    const pct = Math.min(100, Math.max(0, settings.depositValue));
    return Math.round((total * pct) / 100 * 100) / 100;
  }
  return Math.min(Math.max(0, settings.depositValue), total);
}

export type DbRdvSettingsRow = {
  id: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  cta_label: string;
  trust_1_icon: string;
  trust_1_text: string;
  trust_2_icon: string;
  trust_2_text: string;
  trust_3_icon: string;
  trust_3_text: string;
  confirm_title: string;
  confirm_reminder: string;
  location_name: string;
  deposit_enabled: boolean;
  deposit_type: DepositType;
  deposit_value: number;
  deposit_label: string;
  deposit_min_amount: number;
};

export function dbToRdvSettings(row: Partial<DbRdvSettingsRow> | null): RdvSettings {
  if (!row) return DEFAULT_RDV_SETTINGS;
  return {
    heroEyebrow: row.hero_eyebrow ?? DEFAULT_RDV_SETTINGS.heroEyebrow,
    heroTitle: row.hero_title ?? DEFAULT_RDV_SETTINGS.heroTitle,
    heroSubtitle: row.hero_subtitle ?? DEFAULT_RDV_SETTINGS.heroSubtitle,
    ctaLabel: row.cta_label ?? DEFAULT_RDV_SETTINGS.ctaLabel,
    trust1Icon: row.trust_1_icon ?? DEFAULT_RDV_SETTINGS.trust1Icon,
    trust1Text: row.trust_1_text ?? DEFAULT_RDV_SETTINGS.trust1Text,
    trust2Icon: row.trust_2_icon ?? DEFAULT_RDV_SETTINGS.trust2Icon,
    trust2Text: row.trust_2_text ?? DEFAULT_RDV_SETTINGS.trust2Text,
    trust3Icon: row.trust_3_icon ?? DEFAULT_RDV_SETTINGS.trust3Icon,
    trust3Text: row.trust_3_text ?? DEFAULT_RDV_SETTINGS.trust3Text,
    confirmTitle: row.confirm_title ?? DEFAULT_RDV_SETTINGS.confirmTitle,
    confirmReminder: row.confirm_reminder ?? DEFAULT_RDV_SETTINGS.confirmReminder,
    locationName: row.location_name ?? DEFAULT_RDV_SETTINGS.locationName,
    depositEnabled: row.deposit_enabled ?? DEFAULT_RDV_SETTINGS.depositEnabled,
    depositType: row.deposit_type ?? DEFAULT_RDV_SETTINGS.depositType,
    depositValue: Number(row.deposit_value ?? DEFAULT_RDV_SETTINGS.depositValue),
    depositLabel: row.deposit_label ?? DEFAULT_RDV_SETTINGS.depositLabel,
    depositMinAmount: Number(row.deposit_min_amount ?? DEFAULT_RDV_SETTINGS.depositMinAmount),
  };
}

export function rdvSettingsToDb(s: RdvSettings): Omit<DbRdvSettingsRow, "id"> {
  return {
    hero_eyebrow: s.heroEyebrow,
    hero_title: s.heroTitle,
    hero_subtitle: s.heroSubtitle,
    cta_label: s.ctaLabel,
    trust_1_icon: s.trust1Icon,
    trust_1_text: s.trust1Text,
    trust_2_icon: s.trust2Icon,
    trust_2_text: s.trust2Text,
    trust_3_icon: s.trust3Icon,
    trust_3_text: s.trust3Text,
    confirm_title: s.confirmTitle,
    confirm_reminder: s.confirmReminder,
    location_name: s.locationName,
    deposit_enabled: s.depositEnabled,
    deposit_type: s.depositType,
    deposit_value: s.depositValue,
    deposit_label: s.depositLabel,
    deposit_min_amount: s.depositMinAmount,
  };
}
