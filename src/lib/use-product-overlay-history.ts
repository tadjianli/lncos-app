"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  logProductNav,
  PRODUCT_OVERLAY_HISTORY_KEY,
} from "@/lib/product-navigation";

/**
 * Ferme la fiche produit sur retour navigateur (back iOS / Android / desktop).
 */
export function useProductOverlayHistory() {
  useEffect(() => {
    const onPopState = () => {
      const { overlay, closeOverlay, restoreOverlay } = useStore.getState();
      if (overlay?.type !== "product") return;

      const stillOnProductEntry =
        window.history.state?.[PRODUCT_OVERLAY_HISTORY_KEY] === true;

      if (stillOnProductEntry) return;

      const ret = overlay.productReturn;
      closeOverlay();

      logProductNav("popstate", {
        routeSource: ret?.pathname + (ret?.search ?? ""),
        previousOverlay: ret?.previousOverlay?.type ?? null,
        historyAfter: window.history.length,
      });

      if (ret?.previousOverlay) {
        restoreOverlay(ret.previousOverlay);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
