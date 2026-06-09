"use client";

import { memo, type CSSProperties, type ReactNode } from "react";

export interface HorizontalProductCarouselProps {
  children: ReactNode;
  /** Compense le padding parent pour un défilement bord à bord (sections home, fiche produit). */
  bleed?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Carrousel produit horizontal unique — largeur, gap, snap, momentum iOS et fades latéraux.
 */
export const HorizontalProductCarousel = memo(function HorizontalProductCarousel({
  children,
  bleed = true,
  className = "",
  style,
}: HorizontalProductCarouselProps) {
  return (
    <div className={`hpc${bleed ? " hpc--bleed" : ""}${className ? ` ${className}` : ""}`}>
      <div className="hpc__fade hpc__fade--left" aria-hidden />
      <div className="hpc__track noscroll" style={style}>
        {children}
        <span className="hpc__end" aria-hidden />
      </div>
      <div className="hpc__fade hpc__fade--right" aria-hidden />
    </div>
  );
});
