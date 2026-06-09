"use client";
/**
 * LN COS — Bottom nav
 * In-flow flex child of AppShell — NOT position:fixed.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/Icon";

const NAV_ITEMS = [
  { href: "/",          id: "home",       icon: "home",   label: "Accueil"    },
  { href: "/discover",  id: "categories", icon: "grid",   label: "Catégories" },
  { href: "/bag",       id: "cart",       icon: "bag",    label: "Panier"     },
  { href: "/favorites", id: "favorites",  icon: "heart",  label: "Favoris"    },
  { href: "/profile",   id: "profile",    icon: "user",   label: "Profil"     },
] as const;

interface BottomNavProps {
  cartCount?: number;
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        const showFill = active && (item.id === "favorites" || item.id === "cart");

        return (
          <Link
            key={item.href}
            href={item.href}
            className="bottom-nav-item"
            style={{ color: active ? "var(--gold)" : "var(--ink-mute)" }}
            aria-current={active ? "page" : undefined}
          >
            <span style={{ position: "relative" }}>
              <Icon
                name={item.icon}
                size={23}
                stroke={active ? 2 : 1.7}
                color={active ? "var(--gold)" : "var(--ink-mute)"}
                fill={showFill ? "rgba(212,175,55,.18)" : "none"}
              />
              {item.id === "cart" && cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    background: "var(--pink)",
                    color: "#3a1020",
                    borderRadius: 9,
                    fontSize: 10,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                    lineHeight: 1,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </span>
            <span
              className="bottom-nav-label"
              style={{ fontWeight: active ? 600 : 500 }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
