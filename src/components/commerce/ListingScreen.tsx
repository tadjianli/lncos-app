"use client";
/**
 * LN COS — Product listing overlay (catégories discover)
 */

import { useMemo } from "react";
import { SubHeader } from "@/components/shared/ActionButtons";
import { CategoryProductsView } from "@/components/commerce/CategoryProductsView";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { usePublicProducts } from "@/lib/client-supabase";
import type { Category } from "@/lib/store";

interface ListingScreenProps {
  category: Category | null;
  onClose: () => void;
}

export function ListingScreen({ category, onClose }: ListingScreenProps) {
  const { products, loading, error, reload } = usePublicProducts();

  const list = useMemo(
    () => (category ? products.filter((p) => p.cat === category.id) : products),
    [products, category?.id],
  );

  const title = category ? category.name : "Tous les produits";

  const countHeader =
    !loading && !error ? (
      <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginBottom: 14 }}>
        {list.length} produit{list.length !== 1 ? "s" : ""}
      </div>
    ) : null;

  return (
    <div className="overlay-screen" style={{ animation: "slideUp .3s cubic-bezier(.2,.8,.2,1) both" }}>
      <div style={{ flex: "0 0 auto" }}>
        <SubHeader title={title} onBack={onClose} safeArea />
      </div>

      <ScrollRegion variant="overlay" insetX={16} className="scroll-region--y4" padBottom={false}>
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
          getCellStyle={(i) => ({
            animation: `fadeUp .5s ease ${Math.min(i, 6) * 0.05}s both`,
          })}
        />
      </ScrollRegion>
    </div>
  );
}
