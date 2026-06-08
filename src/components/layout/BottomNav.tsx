"use client";
/**
 * LN COS — Bottom nav
 * In-flow flex child of AppShell — NOT position:fixed.
 * AppShell is the fixed container; this element naturally sits at the bottom
 * of the flex column with zero layout jumps.
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
    <nav
      style={{
        /* ─── In-flow — NOT fixed ───────────────────────────── */
        flexShrink: 0,

        /* ─── Layout ────────────────────────────────────────── */
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",

        /* ─── Spacing: top pad + bottom safe-area ───────────── */
        paddingTop: 10,
        /* max(26px, safe-area) so home-bar devices get enough room */
        paddingBottom: "max(26px, env(safe-area-inset-bottom, 0px))",
        paddingLeft: 8,
        paddingRight: 8,

        /* ─── Appearance ────────────────────────────────────── */
        background: "rgba(10,10,10,.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(212,175,55,.14)",
      }}
    >
      {NAV_ITEMS.map(item => {
        const active   = pathname === item.href ||
                         (item.href !== "/" && pathname.startsWith(item.href));
        const showFill = active && (item.id === "favorites" || item.id === "cart");

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              color: active ? "var(--gold)" : "var(--ink-mute)",
              position: "relative",
              width: 58,
              transition: "color .25s",
              textDecoration: "none",
            }}
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
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 500,
                letterSpacing: ".02em",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
