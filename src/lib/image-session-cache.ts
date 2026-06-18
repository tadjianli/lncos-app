import type { Product } from "./data";
import { buildProductGallery, resolveProductImage } from "./product-catalog";

const loaded = new Set<string>();
const errored = new Set<string>();
const inflight = new Map<string, Promise<void>>();

export function getImageSessionState(url: string): "loaded" | "error" | null {
  if (!url) return null;
  if (loaded.has(url)) return "loaded";
  if (errored.has(url)) return "error";
  return null;
}

export function markImageLoaded(url: string) {
  if (!url) return;
  loaded.add(url);
  errored.delete(url);
}

export function markImageError(url: string) {
  if (!url) return;
  errored.add(url);
}

/** Précharge une image (cache navigateur + session). */
export function preloadImage(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  const cached = getImageSessionState(url);
  if (cached === "loaded") return Promise.resolve();

  const pending = inflight.get(url);
  if (pending) return pending;

  const promise = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      markImageLoaded(url);
      inflight.delete(url);
      resolve();
    };
    img.onerror = () => {
      markImageError(url);
      inflight.delete(url);
      resolve();
    };
    img.src = url;
  });

  inflight.set(url, promise);
  return promise;
}

/**
 * Précharge uniquement le strict nécessaire à l'ouverture fiche :
 * hero galerie (800 px) — pas les miniatures ni les images suivantes.
 */
export function preloadProductImages(product: Product) {
  const gallery = buildProductGallery(product);
  const hero = gallery[0];
  if (hero) void preloadImage(hero);
}

/** Précharge la miniature pour les cartes / listing. */
export function preloadProductThumb(product: Product) {
  const thumb = resolveProductImage(product, null, "thumb");
  if (thumb) void preloadImage(thumb);
}
