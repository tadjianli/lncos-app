/**
 * LN COS — Home sections DB mappers (shared admin + client)
 */

import type { Database, Json } from "./database.types";
import type { HomeSection } from "./home-sections";

type DbSection = Database["public"]["Tables"]["home_sections"]["Row"];

export function dbToSection(r: DbSection): HomeSection {
  const sch = r.schedule as { enabled: boolean; start: string; end: string };
  return {
    id: r.id,
    type: r.type as HomeSection["type"],
    name: r.name,
    enabled: r.enabled,
    variant: r.variant,
    title: r.title,
    subtitle: r.subtitle ?? undefined,
    eyebrow: r.eyebrow ?? undefined,
    titleAccent: r.title_accent ?? undefined,
    cta: r.cta ?? undefined,
    source: (r.source as HomeSection["source"]) ?? undefined,
    img: r.img ?? undefined,
    device: r.device as HomeSection["device"],
    audience: r.audience as HomeSection["audience"],
    schedule: sch,
    views: r.views,
  };
}

export function sectionToDb(
  s: HomeSection,
  isDraft: boolean,
  position: number
): Database["public"]["Tables"]["home_sections"]["Insert"] {
  return {
    id: s.id,
    type: s.type,
    name: s.name,
    enabled: s.enabled,
    variant: s.variant,
    title: s.title,
    subtitle: s.subtitle ?? null,
    eyebrow: s.eyebrow ?? null,
    title_accent: s.titleAccent ?? null,
    cta: s.cta ?? null,
    source: s.source ?? null,
    img: s.img ?? null,
    device: s.device,
    audience: s.audience,
    schedule: s.schedule as unknown as Json,
    views: s.views ?? 0,
    position,
    is_draft: isDraft,
  };
}
