"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Accueil",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M2.5 10.5L11 4l8.5 6.5V18.5a1 1 0 01-1 1h-5v-4.5h-5V19.5h-5a1 1 0 01-1-1V10.5z"
          stroke={active ? "#C9A96E" : "#5A5550"}
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.10)" : "none"}
        />
      </svg>
    ),
  },
  {
    href: "/discover",
    label: "Catégories",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" fill={active ? "rgba(201,169,110,0.10)" : "none"} />
        <rect x="12" y="2" width="8" height="8" rx="2" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" fill={active ? "rgba(201,169,110,0.10)" : "none"} />
        <rect x="2" y="12" width="8" height="8" rx="2" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" fill={active ? "rgba(201,169,110,0.10)" : "none"} />
        <rect x="12" y="12" width="8" height="8" rx="2" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" fill={active ? "rgba(201,169,110,0.10)" : "none"} />
      </svg>
    ),
  },
  {
    href: "/bag",
    label: "Panier",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M3.5 7h15l-1.8 11H5.3L3.5 7z"
          stroke={active ? "#C9A96E" : "#5A5550"}
          strokeWidth="1.35"
          strokeLinejoin="round"
          fill={active ? "rgba(201,169,110,0.10)" : "none"}
        />
        <path d="M8 7V5.5a3 3 0 016 0V7" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/ritual",
    label: "Boutique",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5l8-7 8 7V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" fill={active ? "rgba(201,169,110,0.10)" : "none"} />
        <path d="M8 20V13h6v7" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="7.5" r="3.75" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" fill={active ? "rgba(201,169,110,0.10)" : "none"} />
        <path d="M3.5 20c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5" stroke={active ? "#C9A96E" : "#5A5550"} strokeWidth="1.35" strokeLinecap="round" />
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
        background: "rgba(4,4,4,0.97)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
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
                "relative flex flex-col items-center justify-center gap-[0.22rem]",
                "min-w-[3.25rem] px-1",
                "transition-all duration-[150ms] ease-out",
                "active:scale-[0.86] active:duration-[60ms]",
                active ? "opacity-100" : "opacity-45 hover:opacity-65"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {/* Gold top-edge indicator */}
              <span
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-b-full transition-all duration-300",
                  active
                    ? "w-5 bg-[--gold] shadow-[0_0_6px_rgba(201,169,110,0.65)]"
                    : "w-0 bg-transparent"
                )}
              />

              {item.icon(active)}

              <span
                className={cn(
                  "text-[0.5rem] font-light tracking-[0.06em]",
                  "transition-colors duration-200",
                  active ? "text-[--gold]" : "text-[#5A5550]"
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
