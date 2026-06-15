"use client";

import { OVERLAY_HISTORY_KEY } from "@/lib/overlay-history";

const CAT_PARAM = "cat";

export function buildDiscoverListingUrl(categoryId: string | null): string {
  if (typeof window === "undefined") return "/discover";
  const url = new URL(window.location.href);
  if (categoryId) url.searchParams.set(CAT_PARAM, categoryId);
  else url.searchParams.delete(CAT_PARAM);
  return url.pathname + url.search + url.hash;
}

/** Met à jour ?cat= sur l'entrée historique courante (sans empiler). */
export function replaceListingUrl(categoryId: string | null) {
  if (typeof window === "undefined") return;
  const next = buildDiscoverListingUrl(categoryId);
  window.history.replaceState(window.history.state, "", next);
}

/** Empile l'overlay listing avec ?cat= synchronisé. */
export function pushListingOverlayHistory(categoryId: string | null) {
  if (typeof window === "undefined") return;
  const next = buildDiscoverListingUrl(categoryId);
  window.history.pushState(
    { [OVERLAY_HISTORY_KEY]: true, overlayType: "listing", categoryId },
    "",
    next,
  );
}

export function clearListingUrlParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(CAT_PARAM)) return;
  url.searchParams.delete(CAT_PARAM);
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}

export function readListingCategoryIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(CAT_PARAM);
}
