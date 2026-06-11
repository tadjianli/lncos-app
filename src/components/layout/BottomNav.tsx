"use client";
/**
 * LN COS — Bottom nav iOS premium (style Avisflo)
 * 5 onglets uniformes, icônes alignées sur --bottom-nav-icon-size.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Icon } from "@/components/shared/Icon";

const NAV_ITEMS = [
  { href: "/",         id: "home",       icon: "home", label: "Accueil"    },
  { href: "/discover", id: "categories", icon: "grid", label: "Catégories" },
  { href: "/bag",      id: "cart",       icon: "bag",  label: "Panier"     },
  { href: "/boutique", id: "boutique",   icon: "sparkles", label: "Boutique" },
  { href: "/profile",  id: "profile",    icon: "user", label: "Profil"     },
] as const;

const ICON_SIZE = 38;

interface BottomNavProps {
  cartCount?: number;
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <div className="bottom-nav-bar">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const showFill = active && (item.id === "boutique" || item.id === "cart");

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
                {item.id === "boutique" ? (
                  <Sparkles
                    size={ICON_SIZE}
                    strokeWidth={active ? 2.1 : 1.75}
                    color={active ? "var(--gold)" : "var(--ink-mute)"}
                    fill={showFill ? "rgba(212,175,55,.18)" : "none"}
                    aria-hidden
                  />
                ) : (
                  <Icon
                    name={item.icon}
                    size={ICON_SIZE}
                    stroke={active ? 2.1 : 1.75}
                    color={active ? "var(--gold)" : "var(--ink-mute)"}
                    fill={showFill ? "rgba(212,175,55,.18)" : "none"}
                  />
                )}
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
