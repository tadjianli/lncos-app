"use client";

import { useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { Icon } from "@/components/shared/Icon";
import { usePublicProducts } from "@/lib/client-supabase";

export default function PromotionsPage() {
  const { products, loading } = usePublicProducts();

  const promoProducts = useMemo(
    () =>
      products.filter(
        (p) => p.active !== false && p.old != null && p.old > p.price
      ),
    [products]
  );

  return (
    <PageLayout title="Promotions" backHref="/" padBottom={promoProducts.length > 0}>
      <p className="page-layout__eyebrow">Boutique</p>
      <p className="info-page__lead" style={{ marginTop: 0 }}>
        Offres et prix remisés du moment chez LN COS.
      </p>

      {loading ? (
        <div className="flash-sales-loading" aria-busy="true">
          <div className="flash-sales-loading__bar" />
        </div>
      ) : promoProducts.length > 0 ? (
        <ProductGrid products={promoProducts} priorityCount={4} />
      ) : (
        <div className="hub-empty">
          <Icon name="sparkle" size={32} color="var(--gold)" />
          <p>Aucune promotion en cours pour le moment.</p>
        </div>
      )}
    </PageLayout>
  );
}
