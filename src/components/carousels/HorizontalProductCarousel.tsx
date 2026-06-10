"use client";

import { memo, type CSSProperties, type ReactNode } from "react";

export interface HorizontalProductCarouselProps {
  children: ReactNode;
  /** Compense le padding parent pour un défilement bord à bord (sections home, fiche produit). */
  bleed?: boolean;
  /** 2 ou 3 cartes remplissent 100% de la largeur utile (mobile grid-cols équivalent). */
  fillColumns?: 2 | 3;
  /** Cartes fixes 170–190px — scroll horizontal (produits liés longue liste). */
  premium?: boolean;
  /** @deprecated Préférer fillColumns={2} */
  visibleCards?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Carrousel produit horizontal unique — largeur, gap, snap, momentum iOS et fades latéraux.
 */
export const HorizontalProductCarousel = memo(function HorizontalProductCarousel({
  children,
  bleed = true,
  fillColumns,
  premium = false,
  visibleCards,
  className = "",
  style,
}: HorizontalProductCarouselProps) {
  const cols = fillColumns ?? (visibleCards && visibleCards > 0 ? (visibleCards as 2 | 3) : undefined);
  const fillClass = cols ? ` hpc--fill-${cols}` : "";
  const premiumClass = !cols && premium ? " hpc--premium" : "";

  return (
    <div
      className={`hpc${bleed ? " hpc--bleed" : ""}${premiumClass}${fillClass}${className ? ` ${className}` : ""}`}
      style={cols ? ({ "--hpc-visible": cols } as CSSProperties) : undefined}
    >
      <div className="hpc__fade hpc__fade--left" aria-hidden />
      <div className="hpc__track noscroll" style={style}>
        {children}
        <span className="hpc__end" aria-hidden />
      </div>
      <div className="hpc__fade hpc__fade--right" aria-hidden />
    </div>
  );
});
