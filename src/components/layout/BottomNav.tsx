"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/* ─── Nav Items ─────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  {
    href: "/",
    label: "Accueil",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 11.5L12 4l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V11.5z"
          stroke={active ? "#C9A96E" : "#666058"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.12)" : "none"}
        />
        <path
          d="M9 22V16h6v6"
          stroke={active ? "#C9A96E" : "#666058"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/discover",
    label: "Catégories",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke={active ? "#C9A96E" : "#666058"} strokeWidth="1.5" fill={active ? "rgba(201,169,110,0.12)" : "none"} />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke={active ? "#C9A96E" : "#666058"} strokeWidth="1.5" fill={active ? "rgba(201,169,110,0.12)" : "none"} />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke={active ? "#C9A96E" : "#666058"} strokeWidth="1.5" fill={active ? "rgba(201,169,110,0.12)" : "none"} />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke={active ? "#C9A96E" : "#666058"} strokeWidth="1.5" fill={active ? "rgba(201,169,110,0.12)" : "none"} />
      </svg>
    ),
  },
  {
    href: "/bag",
    label: "Panier",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7h16l-2 13H6L4 7z"
          stroke={active ? "#C9A96E" : "#666058"}
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.12)" : "none"}
        />
        <path
          d="M9 7V5.5a3 3 0 016 0V7"
          stroke={active ? "#C9A96E" : "#666058"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/ritual",
    label: "Favoris",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21C12 21 3 15.5 3 9.5a5 5 0 0110-0.9A5 5 0 0121 9.5c0 6-9 11.5-9 11.5z"
          stroke={active ? "#C9A96E" : "#666058"}
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.12)" : "none"}
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke={active ? "#C9A96E" : "#666058"}
          strokeWidth="1.5"
          fill={active ? "rgba(201,169,110,0.12)" : "none"}
        />
        <path
          d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
          stroke={active ? "#C9A96E" : "#666058"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

/* ─── Bottom Nav ────────────────────────────────────────────────────────── */

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{
        background: "rgba(5,5,5,0.97)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        borderTop: "1px solid rgba(255,255,255,0.055)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-[4.5rem] px-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-[3px]",
                "min-w-[3.5rem] h-full",
                "transition-opacity duration-[180ms]",
                "active:opacity-60 active:scale-[0.90] active:transition-none",
                active ? "opacity-100" : "opacity-40 hover:opacity-60"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {item.icon(active)}

              <span
                className={cn(
                  "text-[0.53rem] font-medium tracking-[0.04em]",
                  "transition-colors duration-[180ms]",
                  active ? "text-[#C9A96E]" : "text-[#666058]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
