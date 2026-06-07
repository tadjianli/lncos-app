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
        "fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 flex items-center justify-between h-16 px-5",
        "transition-all duration-300"
      )}
      style={
        transparent
          ? undefined
          : {
              background: "rgba(8,8,8,0.88)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }
      }
    >
      {/* Logo */}
      <Link href="/" className="flex flex-col leading-none">
        <span
          className="text-gold-gradient font-light tracking-[0.28em] uppercase"
          style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem" }}
        >
          LN COS
        </span>
        <span className="text-[0.45rem] font-light tracking-[0.35em] uppercase text-[--cream-muted] mt-px">
          Luxury Beauty
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {showSearch && (
          <button
            className="h-9 w-9 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] active:scale-90"
            aria-label="Search"
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <circle cx="7.5" cy="7.5" r="5.25" stroke="#A89F8E" strokeWidth="1.25" />
              <path d="M11.5 11.5L15 15" stroke="#A89F8E" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {showCart && (
          <Link
            href="/bag"
            className="relative h-9 w-9 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] active:scale-90"
            aria-label={`Bag (${cartCount} items)`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 5.5h14L14.5 15H3.5L2 5.5z"
                stroke="#A89F8E"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
              <path
                d="M6 5.5V4.5a3 3 0 016 0v1"
                stroke="#A89F8E"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[--gold] text-[--obsidian] text-[0.5rem] font-medium flex items-center justify-center leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
