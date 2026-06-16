"use client";
/**
 * LN COS — Floating bottom tab bar + panier FAB (portal document.body, PWA iOS).
 */

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  Home,
  LayoutGrid,
  Search,
  Heart,
  User,
  ShoppingBag,
  type LucideProps,
} from "lucide-react";

const ICON_SIZE = 28;

const TAB_ITEMS = [
  { href: "/", id: "home", label: "Accueil" },
  { href: "/discover", id: "categories", label: "Catégories" },
  { id: "search", label: "Recherche" },
  { href: "/favorites", id: "favorites", label: "Favoris" },
  { href: "/profile", id: "account", label: "Compte" },
] as const;

type TabItemId = (typeof TAB_ITEMS)[number]["id"];

interface BottomNavProps {
  cartCount?: number;
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

function navIconProps(active: boolean, filledWhenActive = false): LucideProps {
  return {
    size: ICON_SIZE,
    strokeWidth: active ? 2.15 : 1.85,
    color: active ? "var(--gold)" : "rgba(255,255,255,0.55)",
    fill: active && filledWhenActive ? "rgba(212,175,55,.22)" : "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className: "bottom-nav-lucide",
  };
}

function TabIcon({ id, active }: { id: TabItemId; active: boolean }) {
  const props = navIconProps(active);

  switch (id) {
    case "home":
      return <Home {...props} />;
    case "categories":
      return <LayoutGrid {...props} />;
    case "search":
      return <Search {...props} />;
    case "favorites":
      return <Heart {...navIconProps(active, true)} />;
    case "account":
      return <User {...props} />;
  }
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const overlay = useStore((s) => s.overlay);
  const closeOverlay = useStore((s) => s.closeOverlay);
  const openSearch = useStore((s) => s.openSearch);
  const [mounted, setMounted] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cartCount <= 0) return;
    setCartPulse(true);
    const timer = window.setTimeout(() => setCartPulse(false), 520);
    return () => window.clearTimeout(timer);
  }, [cartCount]);

  const searchActive = overlay?.type === "search";
  const cartActive = pathname === "/bag" || pathname.startsWith("/bag/");

  const tabActive = useCallback(
    (id: TabItemId) => {
      if (id === "search") return searchActive;
      const item = TAB_ITEMS.find((t) => t.id === id);
      if (!item || !("href" in item)) return false;
      if (id === "categories") {
        return isActive(pathname, item.href) || pathname.startsWith("/categorie/");
      }
      return isActive(pathname, item.href);
    },
    [pathname, searchActive]
  );

  const nav = (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <div className="bottom-nav-dock">
        <div className="bottom-nav-bar" role="tablist">
          {TAB_ITEMS.map((item) => {
            const active = tabActive(item.id);
            const content = (
              <>
                <span className="bottom-nav-icon-wrap">
                  <TabIcon id={item.id} active={active} />
                </span>
                <span className="bottom-nav-label">{item.label}</span>
              </>
            );

            if (item.id === "search") {
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  className={`bottom-nav-item${active ? " bottom-nav-item--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  aria-label="Recherche"
                  onClick={() => openSearch()}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                role="tab"
                className={`bottom-nav-item${active ? " bottom-nav-item--active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => closeOverlay()}
              >
                {content}
              </Link>
            );
          })}
        </div>

        <Link
          href="/bag"
          className={`bottom-nav-cart-fab${cartActive ? " bottom-nav-cart-fab--active" : ""}${
            cartPulse ? " bottom-nav-cart-fab--pulse" : ""
          }`}
          aria-label={
            cartCount > 0
              ? `Panier, ${cartCount} article${cartCount > 1 ? "s" : ""}`
              : "Panier"
          }
          aria-current={cartActive ? "page" : undefined}
          onClick={() => closeOverlay()}
        >
          <span className="bottom-nav-cart-fab__icon">
            <ShoppingBag
              size={28}
              strokeWidth={2}
              color="#1a1306"
              fill="rgba(26,19,6,.08)"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            />
          </span>
          {cartCount > 0 && (
            <span className="bottom-nav-cart-badge">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
