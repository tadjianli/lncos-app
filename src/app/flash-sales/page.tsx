"use client";

import { useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { FlashSaleHead } from "@/components/commerce/FlashSaleHead";
import { FlashSalesBanner } from "@/components/commerce/FlashSalesBanner";
import { FlashSalesEmptyState } from "@/components/commerce/FlashSalesEmptyState";
import { usePublicProducts } from "@/lib/client-supabase";
import { usePublicFlashSalesSettings } from "@/lib/content-pages-hooks";
import { filterFlashSaleProducts } from "@/lib/flash-sales";

export default function FlashSalesPage() {
  const { products, loading: productsLoading } = usePublicProducts();
  const { settings, loading: settingsLoading } = usePublicFlashSalesSettings();

  const flashProducts = useMemo(
    () => filterFlashSaleProducts(products),
    [products]
  );

  const hasFlashSales = flashProducts.length > 0;
  const loading = productsLoading || settingsLoading;

  return (
    <PageLayout title="Ventes Flash" backHref="/" padBottom={false}>
      {loading ? (
        <div className="flash-sales-loading" aria-busy="true" aria-label="Chargement des ventes flash">
          <div className="flash-sales-loading__bar" />
          <div className="flash-sales-loading__bar flash-sales-loading__bar--short" />
        </div>
      ) : hasFlashSales ? (
        <>
          <FlashSalesBanner
            productCount={flashProducts.length}
            settings={settings}
            compact
          />
          <div className="flash-sales-countdown-wrap">
            <FlashSaleHead title={settings.countdownLabel} />
          </div>
          <ProductGrid products={flashProducts} priorityCount={6} />
        </>
      ) : (
        <FlashSalesEmptyState settings={settings} inLayout />
      )}
    </PageLayout>
  );
}
