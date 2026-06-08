"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopBarProps {
  transparent?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  cartCount?: number;
}

export function TopBar({
  transparent = false,
  showSearch = true,
  showCart = true,
  cartCount = 0,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40",
        "flex items-center justify-between h-16 px-5",
        "transition-[background,backdrop-filter,border-color] duration-400"
      )}
      style={
        transparent
          ? {
              paddingTop: "env(safe-area-inset-top)",
            }
          : {
              background: "rgba(7,7,7,0.90)",
              backdropFilter: "blur(24px) saturate(150%)",
              WebkitBackdropFilter: "blur(24px) saturate(150%)",
              borderBottom: "1px solid rgba(255,255,255,0.038)",
              paddingTop: "env(safe-area-inset-top)",
            }
      }
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex flex-col leading-none active:opacity-70 transition-opacity duration-100"
      >
        <span
          className="text-gold-gradient font-light tracking-[0.30em] uppercase"
          style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", letterSpacing: "0.3em" }}
        >
          LN COS
        </span>
        <span className="text-[0.43rem] font-light tracking-[0.38em] uppercase text-[--cream-muted] mt-[2px] opacity-70">
          Luxury Beauty
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        {showSearch && (
          <button
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-full",
              "text-[--cream-muted] hover:text-[--cream]",
              "transition-all duration-150",
              "hover:bg-[rgba(255,255,255,0.04)]",
              "active:scale-[0.88] active:duration-[60ms]"
            )}
            aria-label="Search"
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {showCart && (
          <Link
            href="/bag"
            className={cn(
              "relative h-9 w-9 flex items-center justify-center rounded-full",
              "text-[--cream-muted] hover:text-[--cream]",
              "transition-all duration-150",
              "hover:bg-[rgba(255,255,255,0.04)]",
              "active:scale-[0.88] active:duration-[60ms]"
            )}
            aria-label={`Bag (${cartCount} items)`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2.5 6h13l-1.6 10H4.1L2.5 6z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 6V5a2.5 2.5 0 015 0v1"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>

            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 h-[1.1rem] w-[1.1rem] rounded-full bg-[--gold] text-[--obsidian] flex items-center justify-center leading-none font-medium animate-badge-pop"
                style={{ fontSize: "0.48rem" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
