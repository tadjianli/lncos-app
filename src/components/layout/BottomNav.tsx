"use client";
/**
 * LN COS — Bottom nav (composant unique, monté par AppShell uniquement).
 * Portal vers document.body : iOS PWA standalone ancre mal fixed dans .app-shell.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  ShoppingCart,
  User,
  type LucideProps,
} from "lucide-react";

const ICON_SIZE = 38;

const NAV_ITEMS = [
  { href: "/",         id: "home",       label: "Accueil"    },
  { href: "/discover", id: "categories", label: "Catégories" },
  { href: "/bag",      id: "cart",       label: "Panier"     },
  { href: "/boutique", id: "boutique",   label: "Boutique"   },
  { href: "/profile",  id: "profile",    label: "Profil"     },
] as const;

type NavItemId = (typeof NAV_ITEMS)[number]["id"];

interface BottomNavProps {
  cartCount?: number;
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

function navIconProps(active: boolean, filledWhenActive = false): LucideProps {
  return {
    size: ICON_SIZE,
    strokeWidth: active ? 2.1 : 1.75,
    color: active ? "var(--gold)" : "var(--ink-mute)",
    fill: active && filledWhenActive ? "rgba(212,175,55,.18)" : "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className: "bottom-nav-lucide",
  };
}

function NavItemIcon({ id, active }: { id: NavItemId; active: boolean }) {
  const props = navIconProps(active);

  switch (id) {
    case "home":
      return <Home {...props} />;
    case "categories":
      return <LayoutGrid {...props} />;
    case "cart":
      return <ShoppingCart {...navIconProps(active, true)} />;
    case "boutique":
      /* Sac shopping explicite — distinct du panier (ShoppingCart) et des anciennes icônes shop/sparkle */
      return <ShoppingBag {...props} data-lncos-nav-icon="shopping-bag" />;
    case "profile":
      return <User {...props} />;
  }
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nav = (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <div className="bottom-nav-bar">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item${active ? " bottom-nav-item--active" : ""}`}
              aria-current={active ? "page" : undefined}
              aria-label={
                item.id === "cart" && cartCount > 0
                  ? `Panier, ${cartCount} article${cartCount > 1 ? "s" : ""}`
                  : undefined
              }
            >
              <span className="bottom-nav-icon-wrap">
                <NavItemIcon id={item.id} active={active} />
                {item.id === "cart" && cartCount > 0 && (
                  <span className="bottom-nav-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
