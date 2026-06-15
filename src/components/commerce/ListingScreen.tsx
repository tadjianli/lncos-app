"use client";
/**
 * LN COS — Product listing overlay (catégories discover)
 */

import { useEffect, useMemo, useRef } from "react";
import { SubHeader } from "@/components/shared/ActionButtons";
import { CategoryProductsView } from "@/components/commerce/CategoryProductsView";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { usePublicProducts } from "@/lib/client-supabase";
import { productsInCategory } from "@/lib/category-product-counts";
import type { Category } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ListingScreenProps {
  category: Category | null;
  onClose: () => void;
  /** Listing conservé sous la fiche produit — pas de re-animation au retour */
  preserveUnderProduct?: boolean;
}

export function ListingScreen({
  category,
  onClose,
  preserveUnderProduct = false,
}: ListingScreenProps) {
  const { products, loading, error, reload } = usePublicProducts();
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasStackedUnderProductRef = useRef(false);
  const prevCategoryIdRef = useRef(category?.id);

  const list = useMemo(
    () => productsInCategory(products, category?.id),
    [products, category?.id],
  );

  const title = category ? category.name : "Tous les produits";

  useEffect(() => {
    if (preserveUnderProduct) {
      wasStackedUnderProductRef.current = true;
      return;
    }
    if (prevCategoryIdRef.current !== category?.id) {
      scrollRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      prevCategoryIdRef.current = category?.id;
    }
  }, [category?.id, preserveUnderProduct]);

  const restoredFromProduct =
    wasStackedUnderProductRef.current && !preserveUnderProduct;

  const countHeader =
    !error || list.length > 0 ? (
      <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginBottom: 14 }}>
        {loading && list.length === 0
          ? "Chargement…"
          : `${list.length} produit${list.length !== 1 ? "s" : ""}`}
      </div>
    ) : null;

  return (
    <div
      className={cn(
        "overlay-screen",
        preserveUnderProduct && "overlay-screen--under-product",
        restoredFromProduct && "overlay-screen--restored",
      )}
      aria-hidden={preserveUnderProduct || undefined}
    >
      <div style={{ flex: "0 0 auto" }}>
        <SubHeader title={title} onBack={onClose} safeArea />
      </div>

      <ScrollRegion
        ref={scrollRef}
        variant="overlay"
        insetX={16}
        className="scroll-region--y4"
        padBottom={false}
      >
        <CategoryProductsView
          products={list}
          loading={loading}
          error={error}
          onRetry={() => void reload()}
          emptyTitle="Aucun produit disponible"
          emptyMessage={
            category
              ? `Aucun article dans « ${category.name} » pour le moment.`
              : "Aucun produit disponible pour le moment."
          }
          header={countHeader}
        />
      </ScrollRegion>
    </div>
  );
}
