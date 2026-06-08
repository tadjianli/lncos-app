"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";

interface TopBarProps {
  cartCount?: number;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onCartClick?: () => void;
}

export function TopBar({
  cartCount = 0,
  onMenuClick,
  onSearchClick,
  onCartClick,
}: TopBarProps) {
  return (
    <div
      className="home-z"
      style={{ padding: "4px 18px 0", flex: "0 0 auto" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 44,
        }}
      >
        {/* Menu button */}
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

        {/* Cart button */}
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
          aria-label={`Panier (${cartCount})`}
        >
          <Icon name="bag" size={23} />
          {cartCount > 0 && (
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
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
