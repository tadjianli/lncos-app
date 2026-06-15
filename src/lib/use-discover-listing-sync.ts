"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { usePublicCategories } from "@/lib/client-supabase";
import { readListingCategoryIdFromUrl } from "@/lib/listing-route-sync";

/**
 * Ouvre l'overlay listing si /discover?cat=xxx — sync URL ↔ catégorie active.
 */
export function useDiscoverListingSync() {
  const pathname = usePathname();
  const overlay = useStore((s) => s.overlay);
  const openListing = useStore((s) => s.openListing);
  const { categories, loading } = usePublicCategories();

  useEffect(() => {
    if (pathname !== "/discover" || loading) return;

    const catId = readListingCategoryIdFromUrl();
    if (!catId) return;

    if (overlay?.type === "listing" && overlay.category?.id === catId) return;

    const cat = categories.find((c) => c.id === catId);
    if (cat) openListing(cat, { fromUrl: true });
  }, [pathname, loading, categories, overlay?.type, overlay?.category?.id, openListing]);
}
