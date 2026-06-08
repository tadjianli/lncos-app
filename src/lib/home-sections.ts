/**
 * LN COS — Home sections schema
 * Defines the structure and default configuration of home page sections.
 * These are controlled by the AppBuilder in the admin panel.
 */

export type SectionType =
  | "hero"
  | "trust"
  | "products"
  | "routine"
  | "promo"
  | "reels"
  | "bento"
  | "quote"
  | "reviews"
  | "newsletter";

export type SectionVariant = string;
export type ProductSource = "flash" | "best" | "reco" | "new";
export type Audience = "all" | "vip" | "logged_in";
export type Device = "all" | "mobile" | "desktop";

export interface SectionSchedule {
  enabled: boolean;
  start: string; // ISO date string
  end: string;
}

export interface HomeSection {
  id: string;
  type: SectionType;
  name: string;
  enabled: boolean;
  variant: SectionVariant;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  titleAccent?: string;
  cta?: string;
  source?: ProductSource;
  img?: string;
  device: Device;
  audience: Audience;
  schedule: SectionSchedule;
  views?: number;
}

/* ─── Default published sections ─────────────────────────────────────── */

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  {
    id: "hero-1",
    type: "hero",
    name: "Bannière héro",
    enabled: true,
    variant: "luxury",
    title: "Révélez votre éclat",
    titleAccent: "éclat",
    eyebrow: "Nouvelle collection",
    cta: "Découvrir",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "trust-1",
    type: "trust",
    name: "Bandeau confiance",
    enabled: true,
    variant: "pills",
    title: "Bandeau confiance",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "products-flash",
    type: "products",
    name: "Ventes Flash",
    enabled: true,
    variant: "carousel",
    title: "Ventes Flash",
    source: "flash",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "routine-1",
    type: "routine",
    name: "Rituel beauté",
    enabled: true,
    variant: "editorial",
    title: "Votre rituel parfait",
    eyebrow: "Sur-mesure",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "products-best",
    type: "products",
    name: "Best-sellers",
    enabled: true,
    variant: "carousel",
    title: "Best-sellers",
    source: "best",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "promo-1",
    type: "promo",
    name: "Promo éditoriale",
    enabled: true,
    variant: "editorial",
    title: "L'art de la séduction",
    titleAccent: "séduction",
    eyebrow: "Édition Limitée",
    subtitle: "Découvrez notre collection capsule Élixir Noir — une fragrance boisée pour les âmes audacieuses.",
    cta: "Découvrir",
    img: "parfum-noir",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "bento-1",
    type: "bento",
    name: "Univers LN COS",
    enabled: true,
    variant: "bento",
    title: "L'univers LN COS",
    subtitle: "Self-care",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "products-new",
    type: "products",
    name: "Nouveautés",
    enabled: true,
    variant: "grid",
    title: "Nouveautés",
    source: "new",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "quote-1",
    type: "quote",
    name: "Citation",
    enabled: true,
    variant: "immersive",
    title: "La beauté commence à l'instant où vous décidez d'être vous-même.",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "reels-1",
    type: "reels",
    name: "Reels beauté",
    enabled: true,
    variant: "vertical",
    title: "LN COS Beauté",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
  {
    id: "newsletter-1",
    type: "newsletter",
    name: "Newsletter",
    enabled: true,
    variant: "card",
    title: "Rejoignez le club beauté",
    eyebrow: "Club LN COS",
    subtitle: "Offres exclusives, lancements en avant-première et conseils beauté personnalisés.",
    cta: "Je m'inscris",
    device: "all",
    audience: "all",
    schedule: { enabled: false, start: "", end: "" },
  },
];

/** Filter sections visible for a given render context */
export function visibleSections(
  sections: HomeSection[],
  opts: { isMobile?: boolean; isVip?: boolean; isLoggedIn?: boolean; now?: Date } = {}
): HomeSection[] {
  const now = opts.now ?? new Date();
  return sections.filter((sec) => {
    if (!sec.enabled) return false;
    if (sec.device === "mobile" && !opts.isMobile) return false;
    if (sec.device === "desktop" && opts.isMobile) return false;
    if (sec.audience === "vip" && !opts.isVip) return false;
    if (sec.audience === "logged_in" && !opts.isLoggedIn) return false;
    if (sec.schedule?.enabled) {
      if (sec.schedule.start && now < new Date(sec.schedule.start)) return false;
      if (sec.schedule.end && now > new Date(sec.schedule.end + "T23:59:59")) return false;
    }
    return true;
  });
}
