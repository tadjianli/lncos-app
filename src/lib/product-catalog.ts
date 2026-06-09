/**
 * LN COS — Catalogue produit : images, variantes, helpers
 */

import type { Product, ProductVariant } from "./data";

export type { ProductVariant };

export interface ProductDraft {
  product: Product;
  variants: ProductVariant[];
}

const LOCAL_IMG = (id: string) => `/assets/products/${id}.png`;

export function slugifyProductId(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `produit-${Date.now()}`;
}

export function productFallbackImage(productId: string): string {
  return LOCAL_IMG(productId);
}

export function resolveProductImage(
  product: Product,
  variant?: ProductVariant | null
): string {
  if (variant?.imageUrl) return variant.imageUrl;
  if (product.mainImageUrl) return product.mainImageUrl;
  if (product.imageUrl) return product.imageUrl;
  return productFallbackImage(product.id);
}

export function buildProductGallery(
  product: Product,
  variant?: ProductVariant | null
): string[] {
  const urls: string[] = [];
  const push = (url?: string | null) => {
    if (url && !urls.includes(url)) urls.push(url);
  };

  push(variant?.imageUrl);
  push(product.mainImageUrl);
  push(product.imageUrl);
  for (const img of product.galleryImages ?? []) push(img);

  if (urls.length === 0) urls.push(productFallbackImage(product.id));
  return urls;
}

export function hasRichVariants(product: Product): boolean {
  return (product.productVariants?.length ?? 0) > 0;
}

export function effectivePrice(product: Product, variant?: ProductVariant | null): number {
  return variant?.price ?? product.price;
}

export function effectiveStock(product: Product, variant?: ProductVariant | null): number {
  if (variant) return variant.stock;
  if (hasRichVariants(product)) {
    return product.productVariants!.reduce((sum, v) => sum + v.stock, 0);
  }
  return product.stock;
}

export function effectiveSku(product: Product, variant?: ProductVariant | null): string {
  return variant?.sku || product.id.toUpperCase();
}

export function variantLabels(product: Product): string[] {
  if (hasRichVariants(product)) {
    return product.productVariants!.map((v) => v.name);
  }
  return product.variants;
}

export function findVariantByName(product: Product, name: string): ProductVariant | null {
  return product.productVariants?.find((v) => v.name === name) ?? null;
}

export function newVariantDraft(productId: string, position: number): ProductVariant {
  return {
    id: `new-${Date.now()}-${position}`,
    productId,
    name: "",
    price: 0,
    stock: 0,
    sku: "",
    imageUrl: null,
    position,
  };
}
