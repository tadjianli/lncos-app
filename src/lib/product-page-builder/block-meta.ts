import type { ProductPageBlockType } from "./types";
import { PRODUCT_PAGE_BLOCK_REGISTRY } from "./registry";

/** Palette LN COS unifiée — pas de couleur par bloc */
export const PPB_ICON_GOLD = "#D4AF37";
export const PPB_ICON_GOLD_BG = "rgba(212, 175, 55, 0.12)";

export function blockIconName(type: ProductPageBlockType): string {
  return PRODUCT_PAGE_BLOCK_REGISTRY[type]?.icon ?? "grid";
}
