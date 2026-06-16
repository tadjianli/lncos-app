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
  ShoppingBag,
  Heart,
  User,
  type LucideProps,
} from "lucide-react";

const ICON_SIZE = 23;

const TAB_ITEMS = [
  { href: "/", id: "home", label: "Accueil" },
  { href: "/boutique", id: "boutique", label: "Boutique" },
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
    strokeWidth: active ? 2.2 : 1.8,
    color: active ? "var(--gold-soft)" : "rgba(255,255,255,0.42)",
    fill: active && filledWhenActive ? "rgba(212,175,55,.24)" : "none",
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
    case "boutique":
      return <ShoppingBag {...navIconProps(active, true)} />;
    case "favorites":
      return <Heart {...navIconProps(active, true)} />;
    case "account":
      return <User {...props} />;
  }
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const closeOverlay = useStore((s) => s.closeOverlay);
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

  const cartActive = pathname === "/bag" || pathname.startsWith("/bag/");

  const tabActive = useCallback(
    (id: TabItemId) => {
      const item = TAB_ITEMS.find((t) => t.id === id);
      if (!item) return false;
      return isActive(pathname, item.href);
    },
    [pathname]
  );

  const nav = (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <div className="bottom-nav-dock">
        <div className="bottom-nav-bar" role="tablist">
          {TAB_ITEMS.map((item) => {
            const active = tabActive(item.id);

            return (
              <Link
                key={item.href}
                href={item.href}
                role="tab"
                className={`bottom-nav-item${active ? " bottom-nav-item--active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => closeOverlay()}
              >
                <span className="bottom-nav-icon-wrap">
                  <TabIcon id={item.id} active={active} />
                </span>
                <span className="bottom-nav-label">{item.label}</span>
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
