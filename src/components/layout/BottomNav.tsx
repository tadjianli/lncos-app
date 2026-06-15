"use client";
/**
 * LN COS — Bottom nav (composant unique, monté par AppShell uniquement).
 * Portal vers document.body : iOS PWA standalone ancre mal fixed dans .app-shell.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  BookOpen,
  User,
  type LucideProps,
} from "lucide-react";

const ICON_SIZE = 30;

const NAV_ITEMS = [
  { href: "/",         id: "home",       label: "Accueil"     },
  { href: "/discover", id: "categories", label: "Catégories"  },
  { href: "/boutique", id: "boutique",   label: "Boutique"    },
  { href: "/blog",     id: "blog",       label: "Blog LN COS" },
  { href: "/profile",  id: "profile",    label: "Profil"      },
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
    case "boutique":
      return <ShoppingBag {...props} data-lncos-nav-icon="shopping-bag" />;
    case "blog":
      return <BookOpen {...navIconProps(active, true)} />;
    case "profile":
      return <User {...props} />;
  }
}

export function BottomNav({ cartCount: _cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const closeOverlay = useStore((s) => s.closeOverlay);
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
              onClick={() => closeOverlay()}
            >
              <span className="bottom-nav-icon-wrap">
                <NavItemIcon id={item.id} active={active} />
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
