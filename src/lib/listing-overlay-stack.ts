import type { OverlayState } from "@/lib/store";
import type { Category } from "@/lib/store";

/** Catégorie listing à garder montée sous une fiche produit (évite flash images au retour). */
export function getStackedListingCategory(
  overlay: OverlayState | null,
): Category | null | undefined {
  if (!overlay) return undefined;
  if (overlay.type === "listing") return overlay.category ?? null;
  if (
    overlay.type === "product" &&
    overlay.productReturn?.previousOverlay?.type === "listing"
  ) {
    return overlay.productReturn.previousOverlay.category ?? null;
  }
  return undefined;
}

export function isProductOpenedOverListing(overlay: OverlayState | null): boolean {
  return (
    overlay?.type === "product" &&
    overlay.productReturn?.previousOverlay?.type === "listing"
  );
}
