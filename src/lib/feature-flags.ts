/**
 * LN COS — Feature flags
 *
 * VIP program UI: set ENABLE_VIP_PROGRAM=true (or NEXT_PUBLIC_ENABLE_VIP_PROGRAM=true)
 * to re-enable all client-facing loyalty surfaces.
 */

import type { HomeSection } from "./home-sections";

function readVipProgramFlag(): boolean {
  const raw =
    process.env.NEXT_PUBLIC_ENABLE_VIP_PROGRAM ??
    process.env.ENABLE_VIP_PROGRAM ??
    "false";
  return raw === "true" || raw === "1";
}

/** Static at build time — default false (program hidden). */
export const ENABLE_VIP_PROGRAM = readVipProgramFlag();

export function isVipProgramEnabled(): boolean {
  return ENABLE_VIP_PROGRAM;
}

const VIP_MARKETING_RE = /\b(vip|club ln cos|programme vip|points vip)\b/i;

function isVipMarketingSection(section: HomeSection): boolean {
  if (section.type === "newsletter") return true;
  if (section.audience === "vip") return true;

  const blob = [section.eyebrow, section.title, section.subtitle, section.name]
    .filter(Boolean)
    .join(" ");
  if (VIP_MARKETING_RE.test(blob)) return true;

  if (section.type === "trust" && /vip/i.test(section.subtitle ?? "")) return true;

  return false;
}

function sanitizeSectionForVipOff(section: HomeSection): HomeSection {
  if (section.type === "trust" && section.subtitle?.includes("|")) {
    const pills = section.subtitle
      .split("|")
      .map((t) => t.trim())
      .filter((t) => t && !/vip/i.test(t));
    if (pills.length !== section.subtitle.split("|").length) {
      return { ...section, subtitle: pills.join("|") };
    }
  }

  if (
    section.type === "hero" &&
    section.pageSlug === "profile" &&
    /fidélité/i.test(section.subtitle ?? "")
  ) {
    return { ...section, subtitle: "Compte, commandes et préférences" };
  }

  return section;
}

/** Hide VIP marketing CMS blocks when the program is disabled. */
export function filterSectionsForVipProgram(sections: HomeSection[]): HomeSection[] {
  if (ENABLE_VIP_PROGRAM) return sections;

  return sections
    .filter((s) => !isVipMarketingSection(s))
    .map(sanitizeSectionForVipOff);
}
