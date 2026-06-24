/**
 * LN COS — Trust bandeau pills (home + App Builder)
 */

import type { HomeSection } from "./home-sections";

export interface TrustPill {
  icon: string;
  text: string;
}

export const DEFAULT_TRUST_PILLS: TrustPill[] = [
  { icon: "truck", text: "Livraison 48h offerte" },
  { icon: "sparkle", text: "Vegan & cruelty-free" },
  { icon: "heart", text: "Formulé en France" },
  { icon: "star", text: "+12 000 avis 4.9/5" },
];

export const DEFAULT_TRUST_SUBTITLE = DEFAULT_TRUST_PILLS.map((p) => p.text).join("|");
export const DEFAULT_TRUST_ICONS = DEFAULT_TRUST_PILLS.map((p) => p.icon).join("|");

function splitTokens(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(/[|\n]/).map((t) => t.trim()).filter(Boolean);
}

export function parseTrustPills(
  section: Pick<HomeSection, "subtitle" | "eyebrow">
): TrustPill[] {
  const texts = splitTokens(section.subtitle);
  const icons = splitTokens(section.eyebrow);

  if (texts.length === 0) return [...DEFAULT_TRUST_PILLS];

  return texts.map((text, i) => ({
    icon: icons[i] ?? icons[icons.length - 1] ?? "star",
    text,
  }));
}
