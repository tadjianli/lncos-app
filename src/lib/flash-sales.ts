/**
 * LN COS — Ventes Flash
 * Seuls les produits marqués vente flash apparaissent sur /flash-sales.
 */

import type { Product } from "./data";
import { normalizeHomeVisibility } from "./product-home-visibility";

/** Dérive le flag depuis home_visibility (admin) ou tag legacy. */
export function deriveIsFlashSale(
  product: Pick<Product, "isFlashSale" | "homeVisibility" | "tag">
): boolean {
  if (product.isFlashSale === true) return true;
  if (product.isFlashSale === false) return false;
  const vis = normalizeHomeVisibility(product.homeVisibility, product.tag);
  return vis.flash === true || product.tag === "Flash";
}

export function isFlashSaleProduct(product: Product): boolean {
  return deriveIsFlashSale(product);
}

export function filterFlashSaleProducts(products: Product[]): Product[] {
  return products.filter((p) => p.active !== false && isFlashSaleProduct(p));
}

/** Enrichit un produit avec isFlashSale calculé (catalogue / mapping DB). */
export function withFlashSaleFlag(product: Product): Product {
  return {
    ...product,
    isFlashSale: deriveIsFlashSale(product),
  };
}
