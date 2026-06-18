/**
 * LN COS — Catalogue produit : images, variantes, helpers
 */

import type { Product, ProductVariant } from "./data";
import { productImageUrlForSize, type ProductImageSize } from "./product-image-urls";

export type { ProductImageSize, ProductVariant };
export { productImageUrlForSize, productImageSizes } from "./product-image-urls";

export interface ProductDraft {
  product: Product;
  variants: ProductVariant[];
}

/** Ne jamais utiliser le logo comme image produit */
export function hasProductImage(
  product: Product,
  variant?: ProductVariant | null
): boolean {
  return !!(variant?.imageUrl || product.mainImageUrl || product.imageUrl);
}

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

/** Chemin boutique SEO : /produit/{slug} */
export function getProductStorefrontPath(
  product: Pick<import("./data").Product, "id" | "seoSlug" | "name"> | string,
  options?: { preview?: boolean }
): string {
  const slug =
    typeof product === "string"
      ? product
      : (product.seoSlug?.trim() || product.id || slugifyProductId(product.name));
  const base = `/produit/${encodeURIComponent(slug)}`;
  return options?.preview ? `${base}?preview=1` : base;
}

/** URL absolue pour ouvrir la fiche dans un nouvel onglet depuis l'admin */
export function getProductStorefrontUrl(
  product: Pick<Product, "id" | "seoSlug" | "name" | "active">,
  options?: { preview?: boolean; origin?: string }
): string {
  const origin =
    options?.origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${origin}${getProductStorefrontPath(product, options)}`;
}

export function openProductInStorefront(
  product: Pick<Product, "id" | "seoSlug" | "name" | "active">,
  options?: { origin?: string }
): void {
  if (typeof window === "undefined") return;
  const preview = !isProductPublishedForStorefront(product);
  const slug = product.seoSlug?.trim() || product.id || slugifyProductId(product.name);
  const url = getProductStorefrontUrl(product, { preview, origin: options?.origin });
  console.log("[openProductInStorefront]", {
    url,
    slug,
    productId: product.id,
    seoSlug: product.seoSlug ?? null,
    preview,
    active: product.active ?? true,
  });
  window.open(url, "_blank", "noopener,noreferrer");
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

/** @deprecated Retourne null — utiliser ProductImagePlaceholder côté UI */
export function productFallbackImage(_productId: string): null {
  return null;
}

/** Image affichée partout sauf galerie fiche (cartes, panier, favoris…) — null si aucune image */
export function resolveProductImage(
  product: Product,
  variant?: ProductVariant | null,
  size: ProductImageSize = "thumb"
): string | null {
  const raw =
    variant?.imageUrl ??
    product.mainImageUrl ??
    product.imageUrl ??
    null;
  return productImageUrlForSize(raw, size);
}

/** Galerie fiche produit — URLs variante gallery (800 px) */
export function buildProductGallery(
  product: Product,
  variant?: ProductVariant | null
): string[] {
  const urls: string[] = [];
  const push = (url?: string | null) => {
    const sized = productImageUrlForSize(url, "gallery");
    if (sized && !urls.includes(sized)) urls.push(sized);
  };

  push(variant?.imageUrl);
  for (const img of product.galleryImages ?? []) push(img);

  if (urls.length === 0) {
    push(product.mainImageUrl);
    push(product.imageUrl);
  }
  return urls;
}

/** URL pleine résolution (lightbox, SEO OG) — variante main 1200 px */
export function resolveProductImageFull(
  product: Product,
  variant?: ProductVariant | null
): string | null {
  return resolveProductImage(product, variant, "main");
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
