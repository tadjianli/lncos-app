"use client";
/**
 * LN COS — Unified AppShell
 *
 * Architecture: fixed viewport container — the only element with height.
 *   html/body  : height 100dvh, overflow hidden (no document scroll)
 *   AppShell   : position fixed, top→left→right→bottom 0, max-width 480px,
 *                centered via left:50% + translateX(-50%)
 *                → flex column, clips at exact viewport height
 *   main       : flex:1 1 auto, min-height:0, overflow hidden
 *                → individual screens own their internal scroll
 *   BottomNav  : flex-shrink:0, in-flow at the bottom of the column
 *                → NEVER jumps, NEVER decoupled from content
 *
 * Overlay z-index layers (all position:absolute within AppShell):
 *   70  Toast          — floats above nav
 *   80  Content overlays (product detail, listing, search, profile sub-screens)
 *       → cover `main` only (nav stays visible)
 *   90  Shell modals (side menu, booking wizard)
 *       → cover entire AppShell including nav
 */

import { useEffect, lazy, Suspense } from "react";
import { BottomNav } from "./BottomNav";
import { SideMenu } from "./SideMenu";
import { Toast } from "./Toast";
import { useStore, selectToast, selectCartCount, selectOverlay } from "@/lib/store";
import { getRenderModeFromSearch, showNav } from "@/lib/render-mode";

// Lazy-load overlay screens — keep initial bundle small
const ProductDetail       = lazy(() => import("@/components/commerce/ProductDetail").then(m => ({ default: m.ProductDetail })));
const ListingScreen       = lazy(() => import("@/components/commerce/ListingScreen").then(m => ({ default: m.ListingScreen })));
const SearchScreen        = lazy(() => import("@/components/commerce/SearchScreen").then(m => ({ default: m.SearchScreen })));
const LoyaltyScreen       = lazy(() => import("@/components/profile/LoyaltyScreen").then(m => ({ default: m.LoyaltyScreen })));
const NotificationsScreen = lazy(() => import("@/components/profile/NotificationsScreen").then(m => ({ default: m.NotificationsScreen })));
const OrdersScreen        = lazy(() => import("@/components/profile/OrdersScreen").then(m => ({ default: m.OrdersScreen })));
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
  const toast        = useStore(selectToast);
  const cartCount    = useStore(selectCartCount);
  const overlay      = useStore(selectOverlay);
  const closeOverlay = useStore(s => s.closeOverlay);

  // Trigger Zustand persist rehydration after React has finished hydrating.
  // We use skipHydration:true in store.ts so localStorage is NOT read during
  // the initial render — this prevents a server/client mismatch on persisted
  // favorites (heart icons). After this effect fires, the store reads localStorage,
  // sets _storeHydrated=true, and React does a normal update (not hydration).
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  const mode = typeof window !== "undefined"
    ? getRenderModeFromSearch(window.location.search)
    : "live";

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

  // Nav height constant used for Toast positioning
  // 10px top + 26px bottom padding + ~34px icon+label ≈ 70px; safe-area adds more
  const NAV_H = "calc(4.5rem + env(safe-area-inset-bottom, 0px))";

  return (
    <div
      data-render-mode={mode}
      style={{
        /* ─── Fixed viewport container ─────────────────────── */
        position: "fixed",
        top: 0,
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,

        /* ─── Flex column: content → nav ───────────────────── */
        display: "flex",
        flexDirection: "column",

        /* ─── Appearance ────────────────────────────────────── */
        background: "var(--noir)",

        /* ─── Clip children to viewport bounds ─────────────── */
        overflow: "hidden",

        /* ─── Stacking context ──────────────────────────────── */
        isolation: "isolate",
      }}
    >
      {/* ── Content area (flex:1, clips to its bounds) ─────── */}
      {/*    z:80 overlays sit here — they cover content, NOT nav */}
      <main
        style={{
          flex: "1 1 auto",
          minHeight: 0,          // allow flex child to shrink below content size
          position: "relative",  // contains absolute overlays
          overflow: "hidden",    // clips z:80 overlays to content area
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}

        {/* ── z:80 content overlays ─────────────────────────── */}
        <Suspense fallback={null}>
          {overlay?.type === "product" && overlay.product && (
            <ProductDetail product={overlay.product} onClose={closeOverlay} />
          )}
          {overlay?.type === "listing" && (
            <ListingScreen category={overlay.category ?? null} onClose={closeOverlay} />
          )}
          {overlay?.type === "search" && (
            <SearchScreen onClose={closeOverlay} />
          )}
          {overlay?.type === "loyalty" && (
            <LoyaltyScreen onClose={closeOverlay} />
          )}
          {overlay?.type === "notifications" && (
            <NotificationsScreen onClose={closeOverlay} />
          )}
          {overlay?.type === "orders" && (
            <OrdersScreen onClose={closeOverlay} />
          )}
        </Suspense>
      </main>

      {/* ── BottomNav — in-flow flex child, always at bottom ── */}
      {navVisible && <BottomNav cartCount={cartCount} />}

      {/* ── z:90 shell modals — cover main + nav ──────────── */}
      {overlay?.type === "side-menu" && (
        <SideMenu onClose={closeOverlay} />
      )}
      <Suspense fallback={null}>
        {overlay?.type === "reels" && (
          <ReelsScreen onClose={closeOverlay} />
        )}
        {overlay?.type === "auth" && (
          <AuthScreen onClose={closeOverlay} />
        )}
      </Suspense>

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
