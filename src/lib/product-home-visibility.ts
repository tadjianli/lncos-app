/**
 * LN COS — Visibilité produit sur l'accueil (sections dynamiques admin)
 */

import type { Product } from "./data";

export type HomeDisplayKey = "flash" | "best_seller" | "new_arrivals";
export type HomeUniverseKey = "skincare" | "parfums" | "makeup" | "self_care_rituals";

export type ProductHomeVisibility = Partial<
  Record<HomeDisplayKey | HomeUniverseKey, boolean>
>;

export const HOME_DISPLAY_OPTIONS: { key: HomeDisplayKey; label: string }[] = [
  { key: "flash", label: "Vente Flash" },
  { key: "best_seller", label: "Best-Seller" },
  { key: "new_arrivals", label: "Nouveautés" },
];

export const HOME_UNIVERSE_OPTIONS: { key: HomeUniverseKey; label: string }[] = [
  { key: "skincare", label: "Skincare" },
  { key: "parfums", label: "Parfums" },
  { key: "makeup", label: "Maquillage" },
  { key: "self_care_rituals", label: "Self-Care Rituals" },
];

export const DEFAULT_HOME_VISIBILITY: ProductHomeVisibility = {};

export function normalizeHomeVisibility(
  raw: unknown,
  tag?: string | null
): ProductHomeVisibility {
  const vis: ProductHomeVisibility = {};

  if (raw && typeof raw === "object") {
    for (const { key } of [...HOME_DISPLAY_OPTIONS, ...HOME_UNIVERSE_OPTIONS]) {
      if ((raw as Record<string, unknown>)[key] === true) vis[key] = true;
    }
  }

  const hasAny = Object.values(vis).some(Boolean);
  if (!hasAny && tag) {
    if (tag === "Flash") vis.flash = true;
    if (tag === "Best-seller") vis.best_seller = true;
    if (tag === "Nouveau") vis.new_arrivals = true;
  }

  return vis;
}

export function isVisibleInHome(
  product: Product,
  key: HomeDisplayKey | HomeUniverseKey
): boolean {
  return product.homeVisibility?.[key] === true;
}

export function filterProductsByHomeKey(
  products: Product[],
  key: HomeDisplayKey | HomeUniverseKey
): Product[] {
  return products.filter((p) => isVisibleInHome(p, key));
}

export function groupProductsByUniverse(
  products: Product[]
): Record<HomeUniverseKey, Product[]> {
  return {
    skincare: filterProductsByHomeKey(products, "skincare"),
    parfums: filterProductsByHomeKey(products, "parfums"),
    makeup: filterProductsByHomeKey(products, "makeup"),
    self_care_rituals: filterProductsByHomeKey(products, "self_care_rituals"),
  };
}

/** Mapping source App Builder → clé visibilité */
export function homeKeyFromProductSource(
  source: string | undefined
): HomeDisplayKey | null {
  switch (source) {
    case "flash":
      return "flash";
    case "best":
      return "best_seller";
    case "new":
      return "new_arrivals";
    default:
      return null;
  }
}
