"use client";
/**
 * LN COS — Unified AppShell
 *
 * Architecture: fixed viewport container — the only element with height.
 *   html/body  : inset 0 ; PWA standalone idem (pas de height innerHeight sur le shell)
 *   AppShell   : position fixed, remplit le viewport, max-width 480px
 *   main       : flex:1, safe-top, padding-bottom = hauteur nav si visible
 *   BottomNav  : portal document.body, fixed bottom:0 (fix iOS PWA standalone)
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
import { getRenderModeFromSearch, showNav } from "@/lib/render-mode";
import { SocialProofRotator } from "@/components/social-proof/SocialProofRotator";
import { closeProductDetailNavigation } from "@/lib/product-navigation";
import { closeOverlayWithHistory } from "@/lib/overlay-history";
import { useOverlayHistory } from "@/lib/use-product-overlay-history";
import { useOverlayRouteSync } from "@/lib/use-overlay-route-sync";

// Lazy-load overlay screens — keep initial bundle small
const ProductDetail       = lazy(() => import("@/components/commerce/ProductDetail").then(m => ({ default: m.ProductDetail })));
const ListingScreen       = lazy(() => import("@/components/commerce/ListingScreen").then(m => ({ default: m.ListingScreen })));
const SearchScreen        = lazy(() => import("@/components/commerce/SearchScreen").then(m => ({ default: m.SearchScreen })));
const LoyaltyScreen       = lazy(() => import("@/components/profile/LoyaltyScreen").then(m => ({ default: m.LoyaltyScreen })));
const NotificationsScreen = lazy(() => import("@/components/profile/NotificationsScreen").then(m => ({ default: m.NotificationsScreen })));
const OrdersScreen        = lazy(() => import("@/components/profile/OrdersScreen").then(m => ({ default: m.OrdersScreen })));
const SettingsScreen      = lazy(() => import("@/components/profile/SettingsScreen").then(m => ({ default: m.SettingsScreen })));
// z:90 — full-shell overlays (cover main + nav)
const ReelsScreen         = lazy(() => import("@/components/commerce/ReelsScreen").then(m => ({ default: m.ReelsScreen })));
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

  // When a full-shell modal is open (side menu / booking from rdv page),
  // prevent any accidental touch-scroll on the body layer.
  const isShellModal = overlay?.type === "side-menu";
  useEffect(() => {
    // Body is already overflow:hidden via globals.css — this is a no-op
    // guard kept for any future dynamic body changes.
    if (isShellModal) {
      document.body.style.touchAction = "none";
    } else {
      document.body.style.touchAction = "";
    }
    return () => { document.body.style.touchAction = ""; };
  }, [isShellModal]);

  const NAV_H = "var(--bottom-nav-h)";

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
          {overlay?.type === "product" && overlay.product && (
            <ProductDetail product={overlay.product} onClose={handleProductClose} />
          )}
          {overlay?.type === "listing" && (
            <ListingScreen category={overlay.category ?? null} onClose={handleOverlayClose} />
          )}
          {overlay?.type === "search" && (
            <SearchScreen onClose={handleOverlayClose} />
          )}
          {overlay?.type === "loyalty" && (
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
        {overlay?.type === "reels" && (
          <ReelsScreen onClose={handleOverlayClose} />
        )}
        {overlay?.type === "auth" && (
          <AuthScreen onClose={handleOverlayClose} />
        )}
      </Suspense>

      {/* ── Social proof notifications (bas gauche) ───────── */}
      <SocialProofRotator navVisible={navVisible} />

      {/* ── Toast — floats above nav ────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "absolute",
            bottom: navVisible ? `calc(${NAV_H} + 0.75rem)` : "1.25rem",
            left: "1rem",
            right: "1rem",
            zIndex: 75,
            pointerEvents: "none",
          }}
        >
          <Toast msg={toast.msg} icon={toast.icon} />
        </div>
      )}
    </div>
  );
}
