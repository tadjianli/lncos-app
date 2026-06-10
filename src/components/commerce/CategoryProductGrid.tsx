"use client";

import { ProductCard } from "@/components/shared/ProductCard";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/data";

export function CategoryProductGrid({ products }: { products: Product[] }) {
  const openProduct = useStore((s) => s.openProduct);
  const addToCart = useStore((s) => s.addToCart);
  const toggleFav = useStore((s) => s.toggleFav);
  const favs = useStore((s) => s.favs);

  return (
    <div className="prodbento prodbento--2">
      {products.map((p, i) => (
        <div key={p.id} className="prodbento-cell">
          <ProductCard
            p={p}
            layout="grid-2"
            priority={i < 4}
            isFav={favs.includes(p.id)}
            onFav={toggleFav}
            onAdd={addToCart}
            onOpen={openProduct}
          />
        </div>
      ))}
    </div>
  );
}
