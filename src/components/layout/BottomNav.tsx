"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M2.5 10.5L11 4l8.5 6.5V18.5a1 1 0 01-1 1h-5v-4.5h-5V19.5h-5a1 1 0 01-1-1V10.5z"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.10)" : "none"}
        />
      </svg>
    ),
  },
  {
    href: "/discover",
    label: "Discover",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle
          cx="10" cy="10" r="6.5"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
        />
        <path
          d="M15 15l4 4"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/bag",
    label: "Bag",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M3.5 7h15l-1.8 11H5.3L3.5 7z"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.10)" : "none"}
        />
        <path
          d="M8 7V5.5a3 3 0 016 0V7"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/ritual",
    label: "Ritual",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle
          cx="11" cy="11" r="3.25"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
        />
        <path
          d="M11 3v2.5M11 16.5V19M3 11h2.5M16.5 11H19M5.64 5.64l1.77 1.77M14.59 14.59l1.77 1.77M5.64 16.36l1.77-1.77M14.59 7.41l1.77-1.77"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "You",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle
          cx="11" cy="7.5"
          r="3.75"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
          fill={active ? "rgba(201,169,110,0.10)" : "none"}
        />
        <path
          d="M3.5 20c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5"
          stroke={active ? "#C9A96E" : "#635C50"}
          strokeWidth="1.2"
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
        background: "linear-gradient(to top, rgba(6,6,6,0.99) 0%, rgba(8,8,8,0.96) 100%)",
        boxShadow: "var(--shadow-nav)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        borderTop: "1px solid rgba(255,255,255,0.042)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch justify-around h-[4.25rem]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-[0.2rem]",
                "min-w-[3.5rem] px-2",
                "transition-all duration-[160ms] ease-out",
                "active:scale-[0.88] active:duration-[60ms]",
                active ? "opacity-100" : "opacity-50 hover:opacity-72"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {/* Top indicator pill */}
              <span
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-b-full",
                  "transition-all duration-300 ease-out",
                  active
                    ? "w-5 bg-[--gold] shadow-[0_0_6px_rgba(201,169,110,0.6)]"
                    : "w-0 bg-transparent"
                )}
              />

              {item.icon(active)}

              <span
                className={cn(
                  "text-[0.52rem] font-light tracking-[0.1em] uppercase",
                  "transition-colors duration-200",
                  active ? "text-[--gold]" : "text-[--cream-muted]"
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
