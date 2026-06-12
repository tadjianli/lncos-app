"use client";

import { ProductGrid } from "@/components/commerce/ProductGrid";
import type { Product } from "@/lib/data";

export function CategoryProductGrid({ products }: { products: Product[] }) {
  return <ProductGrid products={products} variant="category" />;
}
