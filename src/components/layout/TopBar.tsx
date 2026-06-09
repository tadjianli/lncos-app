"use client";
/**
 * LN COS — App header (exact from handoff screens-home.jsx AppHeader)
 * Hamburger menu · Logo · Cart badge
 */

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";
import { useStore, selectFavs } from "@/lib/store";

interface TopBarProps {
  cartCount?: number;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onCartClick?: () => void;
}

export function TopBar({
  cartCount,
  onMenuClick,
  onSearchClick: _onSearchClick,
  onCartClick,
}: TopBarProps) {
  const storeCartCount = useStore((s) => s.cartCount);
  const favs = useStore(selectFavs);
  const count = cartCount ?? storeCartCount;
  const favCount = favs.length;

  return (
    <div className="home-z" style={{ padding: "4px 18px 0", flex: "0 0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 44,
        }}
      >
        {/* Menu */}
        <button
          onClick={onMenuClick}
          style={{
            color: "var(--ink)",
            display: "grid",
            placeItems: "center",
            width: 30,
            height: 30,
          }}
          aria-label="Menu"
        >
          <Icon name="menu" size={23} />
        </button>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size={26} />
        </Link>

        {/* Favoris + Panier */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link
            href="/favorites"
            style={{
              color: "var(--ink)",
              position: "relative",
              width: 30,
              height: 30,
              display: "grid",
              placeItems: "center",
            }}
            aria-label={`Favoris (${favCount})`}
          >
            <Icon
              name="heart"
              size={23}
              fill={favCount > 0 ? "rgba(247,198,215,.35)" : "none"}
            />
            {favCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -4,
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
                }}
              >
                {favCount}
              </span>
            )}
          </Link>

          {onCartClick ? (
            <button
              onClick={onCartClick}
              style={{
                color: "var(--ink)",
                position: "relative",
                width: 30,
                height: 30,
                display: "grid",
                placeItems: "center",
              }}
              aria-label={`Panier (${count})`}
            >
              <Icon name="bag" size={23} />
              {count > 0 && (
                <span
                  className="cart-badge"
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -4,
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
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/bag"
              style={{
                color: "var(--ink)",
                position: "relative",
                width: 30,
                height: 30,
                display: "grid",
                placeItems: "center",
              }}
              aria-label={`Panier (${count})`}
            >
              <Icon name="bag" size={23} />
              {count > 0 && (
                <span
                  className="cart-badge"
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -4,
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
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
