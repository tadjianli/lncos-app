"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import type { OverlayType } from "@/lib/store";

/** Overlays fermés automatiquement lors d'un changement d'onglet / route. */
const ROUTE_RESET_OVERLAYS: OverlayType[] = [
  "product",
  "listing",
  "search",
  "loyalty",
  "notifications",
  "orders",
  "appointments",
  "settings",
];

/**
 * Évite la superposition « Mon panier » + overlay listing (BUG #3).
 * Ferme les overlays z-80 quand la pathname change (bottom nav, Link, etc.).
 */
export function useOverlayRouteSync() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current === pathname) return;

    const { overlay, closeOverlay } = useStore.getState();
    if (overlay && ROUTE_RESET_OVERLAYS.includes(overlay.type)) {
      closeOverlay();
    }

    prevPath.current = pathname;
  }, [pathname]);
}
