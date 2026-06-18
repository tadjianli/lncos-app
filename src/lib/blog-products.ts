/**
 * LN COS — Résolution produits liés aux articles blog (catalogue temps réel)
 */

import type { Product } from "./data";
import type { BlogArticle } from "./contracts/blog";
import { resolveProductImage } from "./product-catalog";
import { getProductSeoPath } from "./seo";

export type ProductLookup = (id: string) => Product | null;

export function resolveLinkedProducts(
  productIds: string[],
  byId: ProductLookup
): Product[] {
  return productIds.map((id) => byId(id)).filter((p): p is Product => Boolean(p));
}

/** Couverture personnalisée, sinon image principale du 1er produit lié */
export function resolveArticleCoverUrl(
  article: Pick<BlogArticle, "coverUrl" | "relatedProductIds">,
  byId: ProductLookup
): string | null {
  const custom = article.coverUrl?.trim();
  if (custom) return custom;

  for (const id of article.relatedProductIds) {
    const product = byId(id);
    if (!product) continue;
    const img = resolveProductImage(product, null, "thumb");
    if (img) return img;
  }
  return null;
}

export function getProductStockLabel(product: Product): string {
  if (product.stock <= 0) return "Rupture de stock";
  if (product.stock <= 5) return "Stock limité";
  return "En stock";
}

export function getProductStorePath(product: Product): string {
  return getProductSeoPath(product);
}
