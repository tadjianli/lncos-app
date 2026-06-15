"use client";
/**
 * LN COS — Overlay Router
 *
 * URL hash-based deep-linking for overlays.
 *
 * Hash format:   #overlay=<type>[&id=<value>]
 * Examples:
 *   #overlay=search
 *   #overlay=product&id=parfum-noir
 *   #overlay=listing&cat=visage
 *
 * Usage (mount once at the AppShell level):
 *   useOverlayRouter();
 *
 * Opening a deep-linked overlay:
 *   <a href="#overlay=product&id=parfum-noir">Voir le produit</a>
 *   or via JS: overlayRouter.push({ type: "product", id: "parfum-noir" })
 */

import { useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { isVipProgramEnabled } from "@/lib/feature-flags";
import type { OverlayType } from "@/lib/store";
import { products, byId } from "@/lib/data";

/* ─── Hash serialization ────────────────────────────────────────────── */

interface OverlayHashParams {
  type: OverlayType;
  id?: string;
  cat?: string;
}

function parseOverlayHash(hash: string): OverlayHashParams | null {
  if (!hash.startsWith("#overlay=")) return null;
  const qs = hash.slice(1);
  const params = new URLSearchParams(qs);
  const type = params.get("overlay") as OverlayType | null;
  if (!type) return null;
  return {
    type,
    id:  params.get("id")  ?? undefined,
    cat: params.get("cat") ?? undefined,
  };
}

function buildOverlayHash(params: OverlayHashParams): string {
  const p = new URLSearchParams({ overlay: params.type });
  if (params.id)  p.set("id",  params.id);
  if (params.cat) p.set("cat", params.cat);
  return "#" + p.toString();
}

/* ─── Hook ──────────────────────────────────────────────────────────── */

/**
 * Mount once at AppShell or layout level.
 * Bidirectionally syncs overlay Zustand state ↔ URL hash.
 */
export function useOverlayRouter() {
  const overlay       = useStore((s) => s.overlay);
  const openProduct   = useStore((s) => s.openProduct);
  const openSearch    = useStore((s) => s.openSearch);
  const openListing   = useStore((s) => s.openListing);
  const openLoyalty   = useStore((s) => s.openLoyalty);
  const openNotifications = useStore((s) => s.openNotifications);
  const openOrders    = useStore((s) => s.openOrders);
  const openAppointments = useStore((s) => s.openAppointments);
  const openSettings  = useStore((s) => s.openSettings);
  const closeOverlay  = useStore((s) => s.closeOverlay);

  /** Overlay state → URL hash (write direction) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!overlay) {
      // Remove the hash without creating a new history entry
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
      return;
    }
    const params: OverlayHashParams = { type: overlay.type };
    if (overlay.type === "product" && overlay.product) params.id  = overlay.product.id;
    if (overlay.type === "listing" && overlay.category) params.cat = (overlay.category as { id?: string }).id;
    const hash = buildOverlayHash(params);
    // pushState : le bouton retour ferme l'overlay sans perdre la page source
    window.history.pushState({ lncosOverlay: true, ...params }, "", hash);
  }, [overlay]);

  /** URL hash → overlay state (read direction, on mount + popstate) */
  const openFromHash = useCallback(
    (hash: string) => {
      const parsed = parseOverlayHash(hash);
      if (!parsed) {
        closeOverlay();
        return;
      }
      switch (parsed.type) {
        case "product": {
          const p = parsed.id ? byId(parsed.id) : null;
          if (p) openProduct(p);
          break;
        }
        case "search":        openSearch();        break;
        case "loyalty":
          if (isVipProgramEnabled()) openLoyalty();
          else closeOverlay();
          break;
        case "notifications": openNotifications(); break;
        case "orders":        openOrders();        break;
        case "appointments":  openAppointments();  break;
        case "settings":      openSettings();      break;
        case "listing": {
          // Find category by id if cat param present
          const cat = parsed.cat
            ? { id: parsed.cat, name: parsed.cat, count: 0 }
            : null;
          openListing(cat);
          break;
        }
        default:
          break;
      }
    },
    [openProduct, openSearch, openListing, openLoyalty, openNotifications, openOrders, openAppointments, openSettings, closeOverlay]
  );

  // Mount: read initial hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) openFromHash(window.location.hash);
  }, [openFromHash]);

  // Browser back/forward
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => openFromHash(window.location.hash);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [openFromHash]);
}

/* ─── Imperative router ─────────────────────────────────────────────── */

/**
 * Programmatically navigate to a deep-linked overlay URL.
 * Useful for sharing links: overlayRouter.push("product", "parfum-noir")
 */
export const overlayRouter = {
  push(type: OverlayType, id?: string, cat?: string): void {
    if (typeof window === "undefined") return;
    const hash = buildOverlayHash({ type, id, cat });
    window.history.pushState(null, "", hash);
    // Dispatch popstate so useOverlayRouter picks it up
    window.dispatchEvent(new PopStateEvent("popstate"));
  },
  replace(type: OverlayType, id?: string, cat?: string): void {
    if (typeof window === "undefined") return;
    const hash = buildOverlayHash({ type, id, cat });
    window.history.replaceState(null, "", hash);
    window.dispatchEvent(new PopStateEvent("popstate"));
  },
};
