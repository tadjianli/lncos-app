"use client";

import { useCallback, useMemo } from "react";
import { HorizontalScrollRow } from "@/components/carousels/HorizontalScrollRow";
import { BlogRecommendedProductCard } from "@/components/blog/BlogRecommendedProductCard";
import { Icon } from "@/components/shared/Icon";
import { resolveLinkedProducts } from "@/lib/blog-products";
import { usePublicProducts } from "@/lib/client-supabase";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/data";

interface BeautyVideoProductsProps {
  productIds: string[];
}

export function BeautyVideoProducts({ productIds }: BeautyVideoProductsProps) {
  const { byId, loading } = usePublicProducts();
  const addToCart = useStore((s) => s.addToCart);

  const products = useMemo(
    () => resolveLinkedProducts(productIds, byId),
    [productIds, byId]
  );

  const handleAdd = useCallback(
    (product: Product) => {
      addToCart(product, 1);
    },
    [addToCart]
  );

  if (!loading && products.length === 0) return null;

  return (
    <section className="beauty-video-products" aria-labelledby="beauty-video-products-title">
      <h2 id="beauty-video-products-title" className="beauty-video-products__title">
        <Icon name="bag" size={18} color="var(--gold)" />
        Produits utilisés dans cette vidéo
      </h2>

      {loading ? (
        <div className="flash-sales-loading" aria-busy="true">
          <div className="flash-sales-loading__bar" />
        </div>
      ) : (
        <HorizontalScrollRow
          className="beauty-video-products__hsc"
          trackClassName="beauty-video-products__track"
        >
          {products.map((product) => (
            <BlogRecommendedProductCard key={product.id} product={product} onAdd={handleAdd} />
          ))}
        </HorizontalScrollRow>
      )}
    </section>
  );
}
