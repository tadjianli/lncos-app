"use client";

import type { CSSProperties, ReactNode } from "react";
import { ProductCard } from "@/components/shared/ProductCard";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/data";

export type ProductGridVariant = "default" | "category";

export interface ProductGridProps {
  products: Product[];
  /** Grille catégorie SEO — 2 col verrouillées */
  variant?: ProductGridVariant;
  className?: string;
  /** Marge sous la grille : nav + safe-area iOS + 24px (défaut true) */
  bottomClearance?: boolean;
  /** Images prioritaires pour les N premières cartes */
  priorityCount?: number;
  cellClassName?: string;
  getCellStyle?: (index: number) => CSSProperties | undefined;
  empty?: ReactNode;
}

/** Classes grille 2 col — réutilisable (skeletons, etc.) */
export function productGridClassName(
  variant: ProductGridVariant = "default",
  bottomClearance = true
): string {
  return cn(
    "product-grid prodbento prodbento--2",
    variant === "category" && "prodbento--cat-lock",
    bottomClearance && "product-grid--clear-bottom"
  );
}

export function ProductGrid({
  products,
  variant = "default",
  className,
  bottomClearance = true,
  priorityCount = 4,
  cellClassName,
  getCellStyle,
  empty,
}: ProductGridProps) {
  const openProduct = useStore((s) => s.openProduct);
  const addToCart = useStore((s) => s.addToCart);
  const toggleFav = useStore((s) => s.toggleFav);
  const favs = useStore((s) => s.favs);

  if (products.length === 0) {
    return empty ? <>{empty}</> : null;
  }

  return (
    <div className={cn(productGridClassName(variant, bottomClearance), className)}>
      {products.map((p, i) => (
        <div
          key={p.id}
          className={cn("prodbento-cell", cellClassName)}
          style={getCellStyle?.(i)}
        >
          <ProductCard
            p={p}
            layout="grid-2"
            priority={i < priorityCount}
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
