"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2 9.5L10 3l8 6.5V17a1 1 0 01-1 1H3a1 1 0 01-1-1V9.5z"
          stroke={active ? "#C9A96E" : "#6B6355"}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.12)" : "none"}
        />
      </svg>
    ),
  },
  {
    href: "/discover",
    label: "Discover",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="6" stroke={active ? "#C9A96E" : "#6B6355"} strokeWidth="1.25" />
        <path
          d="M14 14l3 3"
          stroke={active ? "#C9A96E" : "#6B6355"}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M7 9h4M9 7v4"
          stroke={active ? "#C9A96E" : "#6B6355"}
          strokeWidth="1"
          strokeLinecap="round"
          opacity={active ? "0.5" : "0"}
        />
      </svg>
    ),
  },
  {
    href: "/bag",
    label: "Bag",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 6h14l-1.5 10H4.5L3 6z"
          stroke={active ? "#C9A96E" : "#6B6355"}
          strokeWidth="1.25"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.12)" : "none"}
        />
        <path
          d="M7 6V5a3 3 0 016 0v1"
          stroke={active ? "#C9A96E" : "#6B6355"}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/ritual",
    label: "Ritual",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" stroke={active ? "#C9A96E" : "#6B6355"} strokeWidth="1.25" />
        <path
          d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"
          stroke={active ? "#C9A96E" : "#6B6355"}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "You",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="7"
          r="3.5"
          stroke={active ? "#C9A96E" : "#6B6355"}
          strokeWidth="1.25"
          fill={active ? "rgba(201,169,110,0.12)" : "none"}
        />
        <path
          d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"
          stroke={active ? "#C9A96E" : "#6B6355"}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{
        background: "linear-gradient(to top, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0.92) 100%)",
        boxShadow: "var(--shadow-nav)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[3rem] py-1 transition-all duration-200 active:scale-90",
                active ? "opacity-100" : "opacity-60 hover:opacity-80"
              )}
              aria-label={item.label}
            >
              {item.icon(active)}
              <span
                className={cn(
                  "text-[0.55rem] font-light tracking-[0.12em] uppercase transition-colors duration-200",
                  active ? "text-[--gold]" : "text-[--cream-muted]"
                )}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[--gold] opacity-60" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
