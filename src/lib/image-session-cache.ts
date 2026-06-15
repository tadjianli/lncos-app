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

export function preloadProductImages(product: Product) {
  const urls = new Set<string>();
  const main = resolveProductImage(product);
  if (main) urls.add(main);
  for (const url of buildProductGallery(product)) {
    if (url) urls.add(url);
  }
  for (const url of [...urls].slice(0, 4)) {
    void preloadImage(url);
  }
}
