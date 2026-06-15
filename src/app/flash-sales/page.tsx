"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { PageSectionsView } from "@/components/page/PageSectionsView";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { FlashSaleHead } from "@/components/commerce/FlashSaleHead";
import { FlashSalesBanner } from "@/components/commerce/FlashSalesBanner";
import { FlashSalesEmptyState } from "@/components/commerce/FlashSalesEmptyState";
import { usePublicProducts, usePublicPageSections } from "@/lib/client-supabase";
import { usePublicFlashSalesSettings } from "@/lib/content-pages-hooks";
import { filterFlashSaleProducts } from "@/lib/flash-sales";

export default function FlashSalesPage() {
  const { products, loading: productsLoading } = usePublicProducts();
  const { settings, loading: settingsLoading } = usePublicFlashSalesSettings();
  const { getVisible, loading: sectionsLoading } = usePublicPageSections("flash-sales");

  const flashProducts = useMemo(
    () => filterFlashSaleProducts(products),
    [products]
  );

  const extraSections = useMemo(
    () =>
      getVisible({ isMobile: true }).filter(
        (s) => s.enabled && s.type !== "hero" && s.type !== "products"
      ),
    [getVisible]
  );

  const hasFlashSales = flashProducts.length > 0;
  const loading = productsLoading || settingsLoading || sectionsLoading;

  if (!settings.pageEnabled && !loading) {
    return (
      <AppShell>
        <ScrollRegion variant="page" insetX={18}>
          <FlashSalesEmptyState settings={settings} />
        </ScrollRegion>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18} padBottom={hasFlashSales}>
        {loading ? (
          <div className="flash-sales-loading" aria-busy="true" aria-label="Chargement des ventes flash">
            <div className="flash-sales-loading__bar" />
            <div className="flash-sales-loading__bar flash-sales-loading__bar--short" />
          </div>
        ) : hasFlashSales ? (
          <>
            <FlashSalesBanner productCount={flashProducts.length} settings={settings} />
            <div style={{ padding: "4px 0 10px" }}>
              <FlashSaleHead title={settings.countdownLabel} />
            </div>
            <ProductGrid products={flashProducts} priorityCount={6} />
            {extraSections.length > 0 && (
              <PageSectionsView sections={extraSections} />
            )}
          </>
        ) : (
          <>
            <FlashSalesEmptyState settings={settings} />
            {extraSections.length > 0 && (
              <PageSectionsView sections={extraSections} />
            )}
          </>
        )}
      </ScrollRegion>
    </AppShell>
  );
}
