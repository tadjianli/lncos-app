"use client";

import { memo, type CSSProperties, type ReactNode } from "react";

export interface HorizontalProductCarouselProps {
  children: ReactNode;
  /** Compense le padding parent pour un défilement bord à bord (sections home, fiche produit). */
  bleed?: boolean;
  /** Cartes fixes 170–190px — Best Sellers, produits liés (scroll horizontal). */
  premium?: boolean;
  /** Nombre de cartes visibles — largeur = (100% − gaps) ÷ n (legacy, éviter sur mobile). */
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
  premium = false,
  visibleCards,
  className = "",
  style,
}: HorizontalProductCarouselProps) {
  const fillClass =
    !premium && visibleCards && visibleCards > 0 ? ` hpc--fill-${visibleCards}` : "";
  const premiumClass = premium ? " hpc--premium" : "";

  return (
    <div
      className={`hpc${bleed ? " hpc--bleed" : ""}${premiumClass}${fillClass}${className ? ` ${className}` : ""}`}
      style={
        !premium && visibleCards && visibleCards > 0
          ? ({ "--hpc-visible": visibleCards } as CSSProperties)
          : undefined
      }
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
