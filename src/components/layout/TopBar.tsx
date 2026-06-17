"use client";
/**
 * LN COS — App header (exact from handoff screens-home.jsx AppHeader)
 * Hamburger menu · Logo · Cart badge
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const storeCartCount = useStore((s) => s.cartCount);
  const favs = useStore(selectFavs);
  const count = cartCount ?? storeCartCount;
  const favCount = favs.length;

  function goToBag() {
    onCartClick?.();
    router.push("/bag");
  }

  const iconBtnStyle: React.CSSProperties = {
    color: "var(--ink)",
    position: "relative",
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
  };

  const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    padding: "0 4px",
    background: "var(--primary-lncos)",
    color: "var(--primary-on)",
    borderRadius: 9,
    fontSize: 10,
    fontWeight: 700,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  };

  return (
    <div className="home-z home-topbar-pad" style={{ flex: "0 0 auto", position: "relative", zIndex: 10 }}>
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
          type="button"
          onClick={onMenuClick}
          className="touch-target"
          style={{ color: "var(--ink)" }}
          aria-label="Menu"
        >
          <Icon name="menu" size={23} />
        </button>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size={26} />
        </Link>

        {/* Favoris + Panier */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 11 }}>
          <Link href="/favorites" style={iconBtnStyle} aria-label={`Favoris (${favCount})`}>
            <Icon
              name="heart"
              size={23}
              fill={favCount > 0 ? "rgba(247,198,215,.35)" : "none"}
            />
            {favCount > 0 && <span style={badgeStyle}>{favCount}</span>}
          </Link>

          <button
            type="button"
            onClick={goToBag}
            style={iconBtnStyle}
            aria-label={`Panier (${count})`}
          >
            <Icon name="bag" size={23} />
            {count > 0 && <span className="cart-badge" style={badgeStyle}>{count}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
