/**
 * LN COS — URLs dérivées des variantes produit (main / gallery / thumb)
 * Convention : …/image-xxx-main.webp | -gallery.webp | -thumb.webp
 */

export type ProductImageSize = "main" | "gallery" | "thumb";

export type ProductImageSizeContext =
  | "card"
  | "card-grid-3"
  | "card-carousel"
  | "gallery-hero"
  | "gallery-thumb"
  | "bag"
  | "swatch"
  | "routine"
  | "og";

export const PRODUCT_IMAGE_SIZE_PX: Record<ProductImageSize, number> = {
  main: 1200,
  gallery: 800,
  thumb: 300,
};

export const PRODUCT_IMAGE_TARGET_KB: Record<ProductImageSize, number> = {
  main: 200,
  gallery: 120,
  thumb: 40,
};

const VARIANT_SUFFIX: Record<ProductImageSize, string> = {
  main: "-main",
  gallery: "-gallery",
  thumb: "-thumb",
};

const VARIANT_PATTERN = /-(main|gallery|thumb)(\.webp)$/i;

/** Dérive l'URL d'une variante à partir de l'URL canonique (-main) ou legacy. */
export function productImageUrlForSize(
  url: string | null | undefined,
  size: ProductImageSize
): string | null {
  if (!url) return null;
  if (VARIANT_PATTERN.test(url)) {
    return url.replace(VARIANT_PATTERN, `${VARIANT_SUFFIX[size]}$2`);
  }
  return url;
}

export function isLegacyProductImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return !VARIANT_PATTERN.test(url);
}

/**
 * Attribut sizes Next/Image — mobile-first LN COS (viewport max 480px).
 * Limite le téléchargement aux pixels réellement affichés.
 */
export function productImageSizes(context: ProductImageSizeContext): string {
  switch (context) {
    case "card":
      return "(max-width: 480px) 46vw, (max-width: 768px) 220px, 240px";
    case "card-grid-3":
      return "(max-width: 480px) 31vw, (max-width: 768px) 140px, 160px";
    case "card-carousel":
      return "(max-width: 480px) 158px, 164px";
    case "gallery-hero":
      return "(max-width: 480px) 100vw, (max-width: 768px) 480px, 480px";
    case "gallery-thumb":
      return "72px";
    case "bag":
      return "(max-width: 480px) 72px, 80px";
    case "swatch":
      return "56px";
    case "routine":
      return "(max-width: 480px) 48px, 56px";
    case "og":
      return "1200px";
    default:
      return "100vw";
  }
}

/** Estimation du poids chargé à l'ouverture fiche (1× gallery hero + thumbs différés). */
export function estimateProductPageLoadKb(imageCount: number): number {
  const hero = PRODUCT_IMAGE_TARGET_KB.gallery;
  const thumbs = Math.max(0, imageCount - 1) * PRODUCT_IMAGE_TARGET_KB.thumb;
  return hero + thumbs;
}
