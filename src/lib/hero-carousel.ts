import type { Database } from "@/lib/database.types";

export type DbHeroCarouselSettings =
  Database["public"]["Tables"]["hero_carousel_settings"]["Row"];
export type DbHeroCarouselSlide =
  Database["public"]["Tables"]["hero_carousel_slides"]["Row"];

export interface HeroCarouselSettings {
  enabled: boolean;
  autoplay: boolean;
  intervalSeconds: number;
  showIndicators: boolean;
  showArrows: boolean;
}

export interface HeroCarouselSlide {
  id: string;
  position: number;
  imageUrl: string | null;
  imageAlt: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
}

export const DEFAULT_HERO_CAROUSEL_SETTINGS: HeroCarouselSettings = {
  enabled: true,
  autoplay: true,
  intervalSeconds: 5,
  showIndicators: true,
  showArrows: true,
};

export function dbToHeroSettings(row: DbHeroCarouselSettings): HeroCarouselSettings {
  return {
    enabled: row.enabled,
    autoplay: row.autoplay,
    intervalSeconds: Number(row.interval_seconds) || 5,
    showIndicators: row.show_indicators,
    showArrows: row.show_arrows,
  };
}

export function heroSettingsToDb(
  settings: HeroCarouselSettings
): Database["public"]["Tables"]["hero_carousel_settings"]["Update"] {
  return {
    enabled: settings.enabled,
    autoplay: settings.autoplay,
    interval_seconds: settings.intervalSeconds,
    show_indicators: settings.showIndicators,
    show_arrows: settings.showArrows,
  };
}

export function dbToHeroSlide(row: DbHeroCarouselSlide): HeroCarouselSlide {
  return {
    id: row.id,
    position: row.position,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    title: row.title,
    subtitle: row.subtitle,
    buttonText: row.button_text,
    buttonLink: row.button_link,
    active: row.active,
  };
}

export function heroSlideToDb(
  slide: HeroCarouselSlide
): Database["public"]["Tables"]["hero_carousel_slides"]["Update"] {
  return {
    image_url: slide.imageUrl,
    image_alt: slide.imageAlt,
    title: slide.title,
    subtitle: slide.subtitle,
    button_text: slide.buttonText,
    button_link: slide.buttonLink,
    active: slide.active,
  };
}

/** Slides prêtes à l'affichage (actives, avec image). */
export function activeHeroSlides(slides: HeroCarouselSlide[]): HeroCarouselSlide[] {
  return slides
    .filter((s) => s.active && !!s.imageUrl?.trim())
    .sort((a, b) => a.position - b.position);
}

export type HeroDisplayMode = "fallback" | "single" | "carousel";

export function resolveHeroDisplay(
  settings: HeroCarouselSettings,
  slides: HeroCarouselSlide[]
): { mode: HeroDisplayMode; slides: HeroCarouselSlide[] } {
  const active = activeHeroSlides(slides);
  if (!settings.enabled || active.length === 0) {
    return { mode: "fallback", slides: [] };
  }
  if (active.length === 1) {
    return { mode: "single", slides: active };
  }
  return { mode: "carousel", slides: active };
}
