"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/data";
import { useStore } from "@/lib/store";

export function ProductPageClient({ product }: { product: Product }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const openProduct = useStore((s) => s.openProduct);

  useEffect(() => {
    openProduct(product);
  }, [product, openProduct]);

  return (
    <p style={{ color: "var(--ink-mute)", fontSize: 14, textAlign: "center", padding: 24 }}>
      {preview ? "Prévisualisation" : "Chargement"} de {product.name}…
    </p>
  );
}
