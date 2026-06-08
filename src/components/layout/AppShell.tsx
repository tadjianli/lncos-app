"use client";
/**
 * LN COS — Unified AppShell
 * All client screens render inside this single shell.
 *
 * Layer stack (z-index):
 *   0   background / ambient
 *  10   main content (screen)
 *  30   TopBar (fixed top)
 *  40   BottomNav (fixed bottom)
 *  70   Toast
 *  80   Overlay (product drawer, search)
 *  90   Modal (booking wizard, side menu)
 * 100   Transition scrim
 */

import { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { Toast } from "./Toast";
import { useStore, selectToast, selectCartCount } from "@/lib/store";
import { getRenderModeFromSearch, showNav } from "@/lib/render-mode";

interface AppShellProps {
  children: React.ReactNode;
  /** Override bottom nav visibility */
  bottomNav?: boolean;
  /** Passed-through for backward compat */
  topBar?: boolean;
  transparentTopBar?: boolean;
  cartCount?: number;
  className?: string;
}

export function AppShell({
  children,
  bottomNav = true,
  // backward-compat props ignored — nav driven by store
  topBar: _topBar,
  transparentTopBar: _transparent,
  cartCount: _cartCount,
  className: _className,
}: AppShellProps) {
  const toast = useStore(selectToast);
  const storeCartCount = useStore(selectCartCount);

  // Determine render mode from URL (only on client)
  const mode =
    typeof window !== "undefined"
      ? getRenderModeFromSearch(window.location.search)
      : "live";

  const navVisible = bottomNav && showNav(mode);

  // Lock body scroll when a modal-level overlay is open
  const overlay = useStore((s) => s.overlay);
  useEffect(() => {
    const isModal = overlay?.type === "booking" || overlay?.type === "side-menu";
    if (isModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [overlay]);

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
      {/* ── Main content ─────────────────────────────────── */}
      <main
        style={{
          flex: "1 1 auto",
          paddingBottom: navVisible
            ? "calc(5rem + env(safe-area-inset-bottom))"
            : 0,
          position: "relative",
        }}
      >
        {children}
      </main>

      {/* ── Bottom nav ───────────────────────────────────── */}
      {navVisible && <BottomNav cartCount={storeCartCount} />}

      {/* ── Toast layer (z: 70) ──────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: navVisible ? "calc(5.5rem + env(safe-area-inset-bottom))" : "1.5rem",
            width: "calc(100% - 32px)",
            maxWidth: "calc(480px - 32px)",
            zIndex: 70,
            pointerEvents: "none",
          }}
        >
          <Toast msg={toast.msg} icon={toast.icon} />
        </div>
      )}
    </div>
  );
}
