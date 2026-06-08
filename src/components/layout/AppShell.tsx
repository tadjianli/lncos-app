"use client";
/**
 * LN COS — Unified AppShell
 * All client screens render inside this shell.
 *
 * z-index layers:
 *   0   background / ambient
 *  10   main content
 *  30   TopBar
 *  40   BottomNav
 *  70   Toast
 *  80   Product / Search / Listing / Profile overlays
 *  90   Side menu / Booking wizard
 */

import { useEffect, lazy, Suspense } from "react";
import { BottomNav } from "./BottomNav";
import { Toast } from "./Toast";
import { SideMenu } from "./SideMenu";
import { useStore, selectToast, selectCartCount, selectOverlay } from "@/lib/store";
import { getRenderModeFromSearch, showNav } from "@/lib/render-mode";

// Lazy-load overlay screens to keep initial bundle small
const ProductDetail       = lazy(() => import("@/components/commerce/ProductDetail").then((m) => ({ default: m.ProductDetail })));
const ListingScreen       = lazy(() => import("@/components/commerce/ListingScreen").then((m) => ({ default: m.ListingScreen })));
const SearchScreen        = lazy(() => import("@/components/commerce/SearchScreen").then((m) => ({ default: m.SearchScreen })));
const LoyaltyScreen       = lazy(() => import("@/components/profile/LoyaltyScreen").then((m) => ({ default: m.LoyaltyScreen })));
const NotificationsScreen = lazy(() => import("@/components/profile/NotificationsScreen").then((m) => ({ default: m.NotificationsScreen })));
const OrdersScreen        = lazy(() => import("@/components/profile/OrdersScreen").then((m) => ({ default: m.OrdersScreen })));

interface AppShellProps {
  children: React.ReactNode;
  bottomNav?: boolean;
  // backward-compat props
  topBar?: boolean;
  transparentTopBar?: boolean;
  cartCount?: number;
  className?: string;
}

export function AppShell({ children, bottomNav = true }: AppShellProps) {
  const toast      = useStore(selectToast);
  const storeCount = useStore(selectCartCount);
  const overlay    = useStore(selectOverlay);
  const closeOverlay = useStore((s) => s.closeOverlay);

  const mode = typeof window !== "undefined"
    ? getRenderModeFromSearch(window.location.search)
    : "live";

  const navVisible = bottomNav && showNav(mode);

  // Lock body scroll when modal overlay is open
  const isModal = overlay?.type === "booking" || overlay?.type === "side-menu";
  useEffect(() => {
    document.body.style.overflow = isModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModal]);

  return (
    <div
      data-render-mode={mode}
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        maxWidth: 480,
        marginLeft: "auto",
        marginRight: "auto",
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        isolation: "isolate",
      }}
    >
      {/* ── Main content ── */}
      <main
        style={{
          flex: "1 1 auto",
          paddingBottom: navVisible ? "calc(5rem + env(safe-area-inset-bottom))" : 0,
          position: "relative",
        }}
      >
        {children}
      </main>

      {/* ── Bottom nav (z: 40) ── */}
      {navVisible && <BottomNav cartCount={storeCount} />}

      {/* ── Toast (z: 70) ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: navVisible
              ? "calc(5.5rem + env(safe-area-inset-bottom))"
              : "1.5rem",
            width: "calc(min(480px, 100vw) - 32px)",
            zIndex: 70,
            pointerEvents: "none",
          }}
        >
          <Toast msg={toast.msg} icon={toast.icon} />
        </div>
      )}

      {/* ── Overlays (z: 80) ── */}
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

      {/* ── Side menu (z: 90) ── */}
      {overlay?.type === "side-menu" && (
        <SideMenu onClose={closeOverlay} />
      )}
    </div>
  );
}
