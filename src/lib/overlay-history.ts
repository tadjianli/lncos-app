"use client";

import type { OverlayType } from "@/lib/store";
import { PRODUCT_OVERLAY_HISTORY_KEY } from "@/lib/product-navigation";

export const OVERLAY_HISTORY_KEY = "lncos-overlay";

const OVERLAY_BACK_TYPES: OverlayType[] = [
  "listing",
  "search",
  "loyalty",
  "notifications",
  "orders",
  "appointments",
  "settings",
  "reels",
  "auth",
  "side-menu",
];

export function shouldPushOverlayHistory(type: OverlayType): boolean {
  return OVERLAY_BACK_TYPES.includes(type);
}

/** Empile une entrée historique pour fermer l'overlay via retour iOS / Android. */
export function pushOverlayHistory(type: OverlayType) {
  if (typeof window === "undefined") return;
  window.history.pushState(
    { [OVERLAY_HISTORY_KEY]: true, overlayType: type },
    "",
    window.location.pathname + window.location.search + window.location.hash,
  );
}

export function hasOverlayHistoryState(): boolean {
  return (
    typeof window !== "undefined" &&
    window.history.state?.[OVERLAY_HISTORY_KEY] === true
  );
}

/** Ferme l'overlay via history.back() si une entrée a été empilée. */
export function closeOverlayWithHistory(closeOverlay: () => void) {
  if (typeof window !== "undefined" && hasOverlayHistoryState() && window.history.length > 1) {
    window.history.back();
    return;
  }
  closeOverlay();
}

export function isProductHistoryState(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>)[PRODUCT_OVERLAY_HISTORY_KEY] === true
  );
}

export function isOverlayHistoryState(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>)[OVERLAY_HISTORY_KEY] === true
  );
}
