"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ScrollRegionProps {
  /** Page AppShell ou overlay z-110 */
  variant?: "page" | "overlay";
  /** Padding horizontal sans écraser le padding-bottom scroll */
  insetX?: 16 | 18;
  /** false si ProductGrid gère déjà le clearance bottom */
  padBottom?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Zone scrollable avec clearance bottom nav (via `--app-scroll-pad-bottom` / tab-bar-layout.ts).
 * Ne jamais utiliser padding shorthand — écrase padding-bottom.
 */
export const ScrollRegion = forwardRef<HTMLDivElement, ScrollRegionProps>(function ScrollRegion(
  {
    variant = "page",
    insetX,
    padBottom = true,
    className,
    children,
  },
  ref,
) {
  const base = variant === "overlay" ? "overlay-screen-scroll" : "app-scroll-page";
  const inset =
    insetX === 18 ? "scroll-region--x18" : insetX === 16 ? "scroll-region--x16" : "";

  return (
    <div
      ref={ref}
      className={cn(
        "noscroll",
        base,
        inset,
        !padBottom && "scroll-region--no-pad-bottom",
        className
      )}
    >
      {children}
    </div>
  );
});
