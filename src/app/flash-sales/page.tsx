"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { FlashSaleHead } from "@/components/commerce/FlashSaleHead";
import { FlashSalesBanner } from "@/components/commerce/FlashSalesBanner";
import { FlashSalesEmptyState } from "@/components/commerce/FlashSalesEmptyState";
import { usePublicProducts } from "@/lib/client-supabase";
import { filterFlashSaleProducts } from "@/lib/flash-sales";

export default function FlashSalesPage() {
  const { products, loading } = usePublicProducts();

  const flashProducts = useMemo(
    () => filterFlashSaleProducts(products),
    [products]
  );

  const hasFlashSales = flashProducts.length > 0;

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
            <FlashSalesBanner productCount={flashProducts.length} />
            <div style={{ padding: "4px 0 10px" }}>
              <FlashSaleHead title="Se termine dans" />
            </div>
            <ProductGrid products={flashProducts} priorityCount={6} />
          </>
        ) : (
          <FlashSalesEmptyState />
        )}
      </ScrollRegion>
    </AppShell>
  );
}
