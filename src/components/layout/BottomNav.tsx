"use client";
/**
 * LN COS — Bottom nav iOS premium (style Avisflo)
 * 5 onglets uniformes, icônes Lucide alignées sur --bottom-nav-icon-size.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  ShoppingCart,
  User,
  type LucideIcon,
} from "lucide-react";

const ICON_SIZE = 38;

const NAV_ITEMS = [
  { href: "/",         id: "home",       Icon: Home,          label: "Accueil",    filledWhenActive: false },
  { href: "/discover", id: "categories", Icon: LayoutGrid,    label: "Catégories", filledWhenActive: false },
  { href: "/bag",      id: "cart",       Icon: ShoppingCart,  label: "Panier",     filledWhenActive: true  },
  { href: "/boutique", id: "boutique",   Icon: ShoppingBag,   label: "Boutique",   filledWhenActive: true  },
  { href: "/profile",  id: "profile",    Icon: User,          label: "Profil",     filledWhenActive: false },
] as const;

interface BottomNavProps {
  cartCount?: number;
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

function NavIcon({
  Icon,
  active,
  filledWhenActive,
}: {
  Icon: LucideIcon;
  active: boolean;
  filledWhenActive: boolean;
}) {
  return (
    <Icon
      size={ICON_SIZE}
      strokeWidth={active ? 2.1 : 1.75}
      color={active ? "var(--gold)" : "var(--ink-mute)"}
      fill={active && filledWhenActive ? "rgba(212,175,55,.18)" : "none"}
      aria-hidden
    />
  );
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
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
                <NavIcon
                  Icon={item.Icon}
                  active={active}
                  filledWhenActive={item.filledWhenActive}
                />
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
}
