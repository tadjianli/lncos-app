/**
 * LN COS — Per-page section configuration (App Builder tabs)
 */

import type { HomeSection, PageSlug, SectionType } from "./home-sections";

export type { PageSlug };

export const APP_PAGES: { slug: PageSlug; label: string; path: string }[] = [
  { slug: "home", label: "Accueil", path: "/" },
  { slug: "boutique", label: "Boutique", path: "/boutique" },
  { slug: "discover", label: "Catégories", path: "/discover" },
  { slug: "rdv", label: "RDV", path: "/rdv" },
  { slug: "profile", label: "Profil", path: "/profile" },
];

const base = (s: Partial<HomeSection> & Pick<HomeSection, "id" | "type" | "name" | "title">): HomeSection => ({
  enabled: true,
  variant: "default",
  device: "all",
  audience: "all",
  schedule: { enabled: false, start: "", end: "" },
  pageSlug: "home",
  ...s,
});

export const DEFAULT_SECTIONS_BY_PAGE: Record<PageSlug, HomeSection[]> = {
  home: [], // uses DEFAULT_HOME_SECTIONS from home-sections.ts
  boutique: [
    base({ id: "hero-boutique", type: "hero", name: "En-tête boutique", pageSlug: "boutique", eyebrow: "LN COS", title: "Boutique", subtitle: "Du plus récent au plus ancien" }),
    base({ id: "products-all", type: "products", name: "Catalogue produits", pageSlug: "boutique", title: "Tous les produits", source: "all", variant: "grid" }),
  ],
  discover: [
    base({ id: "hero-discover", type: "hero", name: "En-tête découverte", pageSlug: "discover", eyebrow: "Boutique LN COS", title: "Découvrez", subtitle: "Explorez nos univers beauté" }),
    base({ id: "categories-1", type: "categories", name: "Grille catégories", pageSlug: "discover", title: "Catégories", variant: "grid" }),
  ],
  rdv: [
    base({ id: "hero-rdv", type: "hero", name: "Hero RDV", pageSlug: "rdv", eyebrow: "Institut onglerie", title: "Réservez votre moment beauté", subtitle: "En moins de 60 secondes, sans appel." }),
    base({ id: "trust-rdv", type: "trust", name: "Bandeau confiance RDV", pageSlug: "rdv", title: "Confiance", subtitle: "Dispo. temps réel|Rappel auto.|+ points VIP", variant: "pills" }),
    base({ id: "cta-rdv", type: "cta", name: "Bouton réservation", pageSlug: "rdv", title: "Prendre rendez-vous", cta: "Prendre rendez-vous" }),
  ],
  profile: [
    base({ id: "hero-profile", type: "hero", name: "En-tête profil", pageSlug: "profile", eyebrow: "LN COS", title: "Mon espace", subtitle: "Compte, commandes et fidélité" }),
    base({ id: "newsletter-profile", type: "newsletter", name: "Club beauté", pageSlug: "profile", eyebrow: "Club VIP", title: "Rejoignez le Club LN COS", subtitle: "Offres exclusives et conseils personnalisés." }),
  ],
};

/** Section types allowed per page in App Builder */
export const ALLOWED_TYPES_BY_PAGE: Record<PageSlug, SectionType[]> = {
  home: ["hero", "trust", "products", "routine", "promo", "reels", "bento", "quote", "reviews", "transformations", "newsletter"],
  boutique: ["hero", "products", "trust", "promo", "newsletter", "quote"],
  discover: ["hero", "categories", "products", "promo", "trust"],
  rdv: ["hero", "trust", "cta", "promo", "quote"],
  profile: ["hero", "newsletter", "quote", "promo"],
};

export function previewPath(slug: PageSlug): string {
  const page = APP_PAGES.find((p) => p.slug === slug);
  return `${page?.path ?? "/"}?preview=1`;
}
