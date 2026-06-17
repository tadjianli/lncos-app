"use client";
/**
 * LN COS — Unified AppShell
 *
 * Architecture: fixed viewport container — the only element with height.
 *   html/body  : inset 0 ; PWA standalone idem (pas de height innerHeight sur le shell)
 *   AppShell   : position fixed, remplit le viewport, max-width 480px
 *   main       : flex:1, safe-top, pleine hauteur (clearance nav via scroll CSS)
 *   BottomNav  : portal document.body — z-40 (z-120 sur fiche produit)
 *
 * Overlay z-index layers (all position:absolute within AppShell):
 *   70  Toast          — floats above nav
 *   80  Content overlays (product detail, listing, search, profile sub-screens)
 *       → cover `main` only (nav stays visible)
 *   90  Shell modals (side menu, booking wizard)
 *       → cover entire AppShell including nav
 */

import { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { SideMenu } from "./SideMenu";
import { Toast } from "./Toast";
import { useStore, selectToast, selectCartCount, selectOverlay } from "@/lib/store";
import { isVipProgramEnabled } from "@/lib/feature-flags";
import { getRenderModeFromSearch, showNav } from "@/lib/render-mode";
import { SocialProofRotator } from "@/components/social-proof/SocialProofRotator";
import { PopupPromo } from "@/components/marketing/PopupPromo";
import { closeProductDetailNavigation } from "@/lib/product-navigation";
import { closeOverlayWithHistory } from "@/lib/overlay-history";
import { useOverlayHistory } from "@/lib/use-product-overlay-history";
import { useOverlayRouteSync } from "@/lib/use-overlay-route-sync";
import {
  getStackedListingCategory,
  isProductOpenedOverListing,
} from "@/lib/listing-overlay-stack";
import { ProductDetail } from "@/components/commerce/ProductDetail";

// Lazy-load overlay screens — keep initial bundle small
const ListingScreen       = lazy(() => import("@/components/commerce/ListingScreen").then(m => ({ default: m.ListingScreen })));
const SearchScreen        = lazy(() => import("@/components/commerce/SearchScreen").then(m => ({ default: m.SearchScreen })));
const LoyaltyScreen       = lazy(() => import("@/components/profile/LoyaltyScreen").then(m => ({ default: m.LoyaltyScreen })));
const NotificationsScreen = lazy(() => import("@/components/profile/NotificationsScreen").then(m => ({ default: m.NotificationsScreen })));
const OrdersScreen        = lazy(() => import("@/components/profile/OrdersScreen").then(m => ({ default: m.OrdersScreen })));
const SettingsScreen      = lazy(() => import("@/components/profile/SettingsScreen").then(m => ({ default: m.SettingsScreen })));
// z:90 — full-shell overlays (cover main + nav)
const AuthScreen          = lazy(() => import("@/components/profile/AuthScreen").then(m => ({ default: m.AuthScreen })));

interface AppShellProps {
  children: React.ReactNode;
  bottomNav?: boolean;
  // legacy props — kept for backward-compat, not used
  topBar?: boolean;
  transparentTopBar?: boolean;
  cartCount?: number;
  className?: string;
}

export function AppShell({ children, bottomNav = true }: AppShellProps) {
  const router       = useRouter();
  const toast        = useStore(selectToast);
  const cartCount    = useStore(selectCartCount);
  const overlay      = useStore(selectOverlay);
  const closeOverlay = useStore(s => s.closeOverlay);
  const restoreOverlay = useStore(s => s.restoreOverlay);
  const productReturn = overlay?.type === "product" ? overlay.productReturn : undefined;

  useOverlayHistory();
  useOverlayRouteSync();

  const handleOverlayClose = useCallback(() => {
    closeOverlayWithHistory(closeOverlay);
  }, [closeOverlay]);

  const handleProductClose = useCallback(() => {
    closeProductDetailNavigation(router, productReturn, closeOverlay, restoreOverlay);
  }, [router, productReturn, closeOverlay, restoreOverlay]);

  // Trigger Zustand persist rehydration after React has finished hydrating.
  // We use skipHydration:true in store.ts so localStorage is NOT read during
  // the initial render — this prevents a server/client mismatch on persisted
  // favorites (heart icons). After this effect fires, the store reads localStorage,
  // sets _storeHydrated=true, and React does a normal update (not hydration).
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  const [mode, setMode] = useState<ReturnType<typeof getRenderModeFromSearch>>("live");

  useEffect(() => {
    setMode(getRenderModeFromSearch(window.location.search));
  }, []);

  const navVisible = bottomNav && showNav(mode);
  const stackedListingCategory = getStackedListingCategory(overlay);
  const productOverListing = isProductOpenedOverListing(overlay);
  const productOverlayOpen = overlay?.type === "product";

  useEffect(() => {
    const root = document.documentElement;
    if (productOverlayOpen) {
      root.dataset.lncosProductOverlay = "true";
    } else {
      delete root.dataset.lncosProductOverlay;
    }
    return () => {
      delete root.dataset.lncosProductOverlay;
    };
  }, [productOverlayOpen]);

  return (
    <div
      data-render-mode={mode}
      className={`app-shell${navVisible ? " app-shell--with-nav" : ""}`}
    >
      {/* ── Content area (flex:1, clips to its bounds) ─────── */}
      {/*    z:80 overlays sit here — they cover content, NOT nav */}
      <main className="app-shell-main">
        {children}

        {/* ── z:80 content overlays ─────────────────────────── */}
        <Suspense fallback={null}>
          {stackedListingCategory !== undefined && (
            <ListingScreen
              category={stackedListingCategory}
              onClose={handleOverlayClose}
              preserveUnderProduct={overlay?.type === "product"}
            />
          )}
          {overlay?.type === "product" && overlay.product && (
            <ProductDetail
              product={overlay.product}
              onClose={handleProductClose}
              enterFromListing={productOverListing}
            />
          )}
          {overlay?.type === "search" && (
            <SearchScreen onClose={handleOverlayClose} />
          )}
          {overlay?.type === "loyalty" && isVipProgramEnabled() && (
            <LoyaltyScreen onClose={handleOverlayClose} />
          )}
          {overlay?.type === "notifications" && (
            <NotificationsScreen onClose={handleOverlayClose} />
          )}
          {overlay?.type === "orders" && (
            <OrdersScreen onClose={handleOverlayClose} />
          )}
          {overlay?.type === "settings" && (
            <SettingsScreen onClose={handleOverlayClose} />
          )}
        </Suspense>
      </main>

      {/* ── BottomNav — in-flow flex child, always at bottom ── */}
      {navVisible && <BottomNav cartCount={cartCount} />}

      {/* ── z:90 shell modals — cover main + nav ──────────── */}
      {overlay?.type === "side-menu" && (
        <SideMenu onClose={handleOverlayClose} />
      )}
      <Suspense fallback={null}>
        {overlay?.type === "auth" && (
          <AuthScreen onClose={handleOverlayClose} />
        )}
      </Suspense>

      {/* Popups marketing — web + PWA iOS/Android (même bundle Next.js) */}
      {mode === "live" && !overlay && <PopupPromo />}

      {/* ── Social proof notifications (bas gauche) ───────── */}
      <SocialProofRotator navVisible={navVisible} />

      {/* ── Toast — sous le header (ne masque pas le contenu / CTA) ── */}
      {toast && (
        <div className="app-toast-host">
          <Toast msg={toast.msg} icon={toast.icon} />
        </div>
      )}
    </div>
  );
}
