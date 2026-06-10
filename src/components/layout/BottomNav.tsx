"use client";
/**
 * LN COS — Bottom nav iOS premium
 * Barre compacte + bouton panier central flottant (72px).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/Icon";

const LEFT_ITEMS = [
  { href: "/",         id: "home",       icon: "home", label: "Accueil"     },
  { href: "/discover", id: "categories", icon: "grid", label: "Catégories"  },
] as const;

const RIGHT_ITEMS = [
  { href: "/boutique", id: "boutique", icon: "shop", label: "Boutique" },
  { href: "/profile",  id: "profile",  icon: "user", label: "Profil"   },
] as const;

const CART = { href: "/bag", id: "cart", icon: "bag", label: "Panier" } as const;

const ICON_SIZE = 31;

interface BottomNavProps {
  cartCount?: number;
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

function NavTab({
  href,
  id,
  icon,
  label,
  active,
}: {
  href: string;
  id: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  const showFill = active && id === "boutique";

  return (
    <Link
      href={href}
      className={`bottom-nav-item${active ? " bottom-nav-item--active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="bottom-nav-icon-wrap">
        <Icon
          name={icon}
          size={ICON_SIZE}
          stroke={active ? 2.1 : 1.75}
          color={active ? "var(--gold)" : "var(--ink-mute)"}
          fill={showFill ? "rgba(212,175,55,.18)" : "none"}
        />
      </span>
      <span className="bottom-nav-label">{label}</span>
    </Link>
  );
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const cartActive = isActive(pathname, CART.href);

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <div className="bottom-nav-bar">
        <div className="bottom-nav-group">
          {LEFT_ITEMS.map((item) => (
            <NavTab
              key={item.href}
              {...item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>

        <div className="bottom-nav-cart-slot">
          <span
            className={`bottom-nav-label bottom-nav-cart-bar-label${cartActive ? " bottom-nav-item--active" : ""}`}
          >
            {CART.label}
          </span>
        </div>

        <div className="bottom-nav-group">
          {RIGHT_ITEMS.map((item) => (
            <NavTab
              key={item.href}
              {...item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>
      </div>

      <Link
        href={CART.href}
        className={`bottom-nav-cart${cartActive ? " bottom-nav-cart--active" : ""}`}
        aria-current={cartActive ? "page" : undefined}
        aria-label={cartCount > 0 ? `Panier, ${cartCount} article${cartCount > 1 ? "s" : ""}` : "Panier"}
      >
        <Icon
          name={CART.icon}
          size={32}
          stroke={2}
          color={cartActive ? "var(--noir)" : "#1a1408"}
          fill={cartActive ? "rgba(26,20,8,.12)" : "none"}
        />
        {cartCount > 0 && (
          <span className="bottom-nav-cart-badge">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>
    </nav>
  );
}
