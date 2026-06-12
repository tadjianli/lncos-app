"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { OverlayState, OverlayType } from "@/lib/store";

/** Logs temporaires de diagnostic navigation produit */
export const PRODUCT_NAV_DEBUG = true;

export type ProductNavSource =
  | "home"
  | "boutique"
  | "discover"
  | "categories"
  | "search"
  | "favorites"
  | "recommendations"
  | "listing"
  | "direct"
  | "unknown";

export interface ProductReturnContext {
  pathname: string;
  search: string;
  source: ProductNavSource;
  previousOverlay: OverlayState | null;
}

export const PRODUCT_OVERLAY_HISTORY_KEY = "lncos-product-overlay";

export function logProductNav(label: string, payload: Record<string, unknown>) {
  if (!PRODUCT_NAV_DEBUG || typeof window === "undefined") return;
  console.log(`[LN COS product-nav] ${label}`, {
    ...payload,
    href: window.location.href,
    historyLength: window.history.length,
    historyState: window.history.state,
  });
}

export function detectProductSource(pathname: string, overlayType?: OverlayType | null): ProductNavSource {
  if (overlayType === "search") return "search";
  if (overlayType === "listing") return "categories";

  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/boutique")) return "boutique";
  if (pathname.startsWith("/discover")) return "discover";
  if (pathname.startsWith("/favorites")) return "favorites";
  if (pathname.startsWith("/categorie/")) return "categories";
  if (pathname.startsWith("/produit/") || pathname.startsWith("/product/")) return "direct";
  return "unknown";
}

export function fallbackHrefForSource(source: ProductNavSource): string {
  switch (source) {
    case "home":
      return "/";
    case "discover":
    case "categories":
    case "listing":
      return "/discover";
    case "favorites":
      return "/favorites";
    case "search":
      return "/boutique";
    case "direct":
    case "boutique":
    case "recommendations":
    case "unknown":
    default:
      return "/boutique";
  }
}

export function buildReturnContext(
  currentOverlay: OverlayState | null,
  opts?: { source?: ProductNavSource; fromRecommendations?: boolean }
): ProductReturnContext {
  if (typeof window === "undefined") {
    return {
      pathname: "/boutique",
      search: "",
      source: opts?.source ?? "unknown",
      previousOverlay: null,
    };
  }

  const pathname = window.location.pathname;
  const search = window.location.search;

  if (currentOverlay?.type === "product" && currentOverlay.productReturn) {
    return currentOverlay.productReturn;
  }

  const overlayType = currentOverlay?.type ?? null;
  let source = opts?.source ?? detectProductSource(pathname, overlayType);
  if (opts?.fromRecommendations) source = "recommendations";

  const previousOverlay =
    currentOverlay && currentOverlay.type !== "product" ? currentOverlay : null;

  return { pathname, search, source, previousOverlay };
}

export function pushProductOverlayHistory(productId: string) {
  if (typeof window === "undefined") return;
  const before = window.history.length;
  window.history.pushState(
    { [PRODUCT_OVERLAY_HISTORY_KEY]: true, productId },
    "",
    window.location.pathname + window.location.search + window.location.hash
  );
  logProductNav("pushState", {
    productId,
    historyBefore: before,
    historyAfter: window.history.length,
    routeSource: window.location.pathname + window.location.search,
  });
}

export function canNavigateProductBack(returnCtx: ProductReturnContext | undefined): boolean {
  if (typeof window === "undefined") return Boolean(returnCtx);
  if (window.history.length > 1) return true;
  if (returnCtx?.previousOverlay) return true;
  return Boolean(returnCtx?.pathname);
}

export type RestoreOverlayFn = (overlay: OverlayState) => void;

export function closeProductDetailNavigation(
  router: AppRouterInstance,
  returnCtx: ProductReturnContext | undefined,
  closeOverlay: () => void,
  restoreOverlay: RestoreOverlayFn
) {
  logProductNav("close-request", {
    routeDestination: returnCtx?.pathname + (returnCtx?.search ?? ""),
    routeSource: returnCtx?.source,
    previousOverlay: returnCtx?.previousOverlay?.type ?? null,
    historyBefore: typeof window !== "undefined" ? window.history.length : null,
  });

  const hasOverlayHistory =
    typeof window !== "undefined" &&
    window.history.state?.[PRODUCT_OVERLAY_HISTORY_KEY] === true;

  if (typeof window !== "undefined" && hasOverlayHistory && window.history.length > 1) {
    window.history.back();
    return;
  }

  closeOverlay();

  if (returnCtx?.previousOverlay) {
    restoreOverlay(returnCtx.previousOverlay);
    logProductNav("close-restore-overlay", {
      restored: returnCtx.previousOverlay.type,
      historyAfter: window.history.length,
    });
    return;
  }

  const target = returnCtx
    ? returnCtx.pathname + returnCtx.search
    : fallbackHrefForSource("boutique");

  const current = typeof window !== "undefined"
    ? window.location.pathname + window.location.search
    : "";

  if (target && target !== current) {
    router.push(target);
  } else if (!returnCtx || returnCtx.source === "direct" || returnCtx.source === "unknown") {
    router.push(fallbackHrefForSource(returnCtx?.source ?? "boutique"));
  }

  logProductNav("close-fallback", {
    target,
    historyAfter: typeof window !== "undefined" ? window.history.length : null,
  });
}
