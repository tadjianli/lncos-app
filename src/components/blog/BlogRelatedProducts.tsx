"use client";

import { useCallback, useMemo } from "react";
import { HorizontalProductCarousel } from "@/components/carousels/HorizontalProductCarousel";
import { BlogRecommendedProductCard } from "@/components/blog/BlogRecommendedProductCard";
import { usePublicProducts } from "@/lib/client-supabase";
import { resolveLinkedProducts } from "@/lib/blog-products";
import type { Product } from "@/lib/data";
import { useStore } from "@/lib/store";

interface BlogRelatedProductsProps {
  productIds: string[];
}

export function BlogRelatedProducts({ productIds }: BlogRelatedProductsProps) {
  const { byId, loading } = usePublicProducts();
  const addToCart = useStore((s) => s.addToCart);

  const products = useMemo(
    () => resolveLinkedProducts(productIds, byId),
    [productIds, byId]
  );

  const handleAdd = useCallback(
    (p: Product) => {
      addToCart(p);
    },
    [addToCart]
  );

  if (!loading && products.length === 0) return null;

  return (
    <section className="blog-related" aria-labelledby="blog-related-title">
      <h2 id="blog-related-title" className="blog-article-section__title">
        Produits recommandés
      </h2>

      {loading ? (
        <div className="flash-sales-loading" aria-busy="true">
          <div className="flash-sales-loading__bar" />
        </div>
      ) : (
        <HorizontalProductCarousel premium bleed={false} className="blog-related__carousel">
          {products.map((p) => (
            <BlogRecommendedProductCard key={p.id} product={p} onAdd={handleAdd} />
          ))}
        </HorizontalProductCarousel>
      )}
    </section>
  );
}
