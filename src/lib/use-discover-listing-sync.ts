"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { usePublicCategories } from "@/lib/client-supabase";
import { readListingCategoryIdFromUrl } from "@/lib/listing-route-sync";
import type { OverlayType } from "@/lib/store";

/** Pure helper — testable sans React. */
export function shouldOpenDiscoverListingFromUrl(input: {
  pathname: string;
  catId: string | null;
  overlayType: OverlayType | null | undefined;
  listingCategoryId: string | null | undefined;
}): boolean {
  if (input.pathname !== "/discover" || !input.catId) return false;
  if (input.overlayType && input.overlayType !== "listing") return false;
  if (input.overlayType === "listing" && input.listingCategoryId === input.catId) return false;
  return true;
}

/**
 * Ouvre l'overlay listing si /discover?cat=xxx — sync URL ↔ catégorie active.
 * Ne doit pas rouvrir le listing quand une fiche produit est empilée dessus.
 */
export function useDiscoverListingSync() {
  const pathname = usePathname();
  const overlay = useStore((s) => s.overlay);
  const openListing = useStore((s) => s.openListing);
  const { categories, loading } = usePublicCategories();

  useEffect(() => {
    if (loading) return;

    const catId = readListingCategoryIdFromUrl();
    if (
      !shouldOpenDiscoverListingFromUrl({
        pathname,
        catId,
        overlayType: overlay?.type,
        listingCategoryId: overlay?.type === "listing" ? overlay.category?.id : null,
      })
    ) {
      return;
    }

    const cat = categories.find((c) => c.id === catId);
    if (cat) openListing(cat, { fromUrl: true });
  }, [pathname, loading, categories, overlay?.type, overlay?.category?.id, openListing]);
}
