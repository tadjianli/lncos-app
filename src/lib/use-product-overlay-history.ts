"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  isOverlayHistoryState,
  isProductHistoryState,
} from "@/lib/overlay-history";
import { clearListingUrlParam } from "@/lib/listing-route-sync";
import { requestProductExitAnimation } from "@/lib/product-exit-animation";

/**
 * Ferme les overlays sur retour navigateur (swipe-back iOS, bouton retour, popstate).
 */
export function useOverlayHistory() {
  useEffect(() => {
    const onPopState = () => {
      const { overlay, closeOverlay, restoreOverlay } = useStore.getState();
      if (!overlay) return;

      const state = window.history.state;

      if (overlay.type === "product") {
        if (isProductHistoryState(state)) return;

        const ret = overlay.productReturn;
        const finishClose = () => {
          closeOverlay();
          if (ret?.previousOverlay) {
            restoreOverlay(ret.previousOverlay);
          }
        };

        if (requestProductExitAnimation(finishClose)) return;
        finishClose();
        return;
      }

      if (isOverlayHistoryState(state)) return;

      closeOverlay();
      clearListingUrlParam();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}

/** @deprecated Utiliser useOverlayHistory */
export const useProductOverlayHistory = useOverlayHistory;
