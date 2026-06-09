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

export function isProductPublishedForStorefront(
  product: Pick<Product, "active">
): boolean {
  return product.active !== false;
}

export function getProductViewActionLabel(
  product: Pick<Product, "active">
): "Voir" | "Prévisualiser" {
  return isProductPublishedForStorefront(product) ? "Voir" : "Prévisualiser";
}

/** Chemin boutique : /product/{id} */
export function getProductStorefrontPath(
  productId: string,
  options?: { preview?: boolean }
): string {
  const base = `/product/${encodeURIComponent(productId)}`;
  return options?.preview ? `${base}?preview=1` : base;
}

/** URL absolue pour ouvrir la fiche dans un nouvel onglet depuis l'admin */
export function getProductStorefrontUrl(
  productId: string,
  options?: { preview?: boolean; origin?: string }
): string {
  const origin =
    options?.origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${origin}${getProductStorefrontPath(productId, options)}`;
}

export function openProductInStorefront(
  product: Pick<Product, "id" | "active">,
  options?: { origin?: string }
): void {
  if (typeof window === "undefined") return;
  const preview = !isProductPublishedForStorefront(product);
  window.open(
    getProductStorefrontUrl(product.id, { preview, origin: options?.origin }),
    "_blank",
    "noopener,noreferrer"
  );
}

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

/** Image affichée partout sauf galerie fiche (cartes, panier, favoris…) */
export function resolveProductImage(
  product: Product,
  variant?: ProductVariant | null
): string {
  if (variant?.imageUrl) return variant.imageUrl;
  if (product.mainImageUrl) return product.mainImageUrl;
  if (product.imageUrl) return product.imageUrl;
  return productFallbackImage(product.id);
}

/** Galerie fiche produit — miniatures uniquement (gallery_images) */
export function buildProductGallery(
  product: Product,
  variant?: ProductVariant | null
): string[] {
  const urls: string[] = [];
  const push = (url?: string | null) => {
    if (url && !urls.includes(url)) urls.push(url);
  };

  push(variant?.imageUrl);
  for (const img of product.galleryImages ?? []) push(img);

  if (urls.length === 0) {
    push(product.mainImageUrl);
    push(product.imageUrl);
  }
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
