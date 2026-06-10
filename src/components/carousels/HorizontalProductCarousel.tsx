"use client";

import { memo, type CSSProperties, type ReactNode } from "react";

export interface HorizontalProductCarouselProps {
  children: ReactNode;
  /** Compense le padding parent pour un défilement bord à bord (sections home, fiche produit). */
  bleed?: boolean;
  /** Nombre de cartes visibles — largeur = (100% − gaps) ÷ n (ex. 3 cartes pleine largeur). */
  visibleCards?: number;
  /**
   * Carrousel premium (Best Sellers, produits liés) — cartes 170–190px,
   * scroll horizontal, lisibilité prioritaire.
   */
  premium?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Carrousel produit horizontal unique — largeur, gap, snap, momentum iOS et fades latéraux.
 */
export const HorizontalProductCarousel = memo(function HorizontalProductCarousel({
  children,
  bleed = true,
  visibleCards,
  premium = false,
  className = "",
  style,
}: HorizontalProductCarouselProps) {
  const fillClass =
    !premium && visibleCards && visibleCards > 0 ? ` hpc--fill-${visibleCards}` : "";

  return (
    <div
      className={`hpc${bleed ? " hpc--bleed" : ""}${premium ? " hpc--premium" : ""}${fillClass}${className ? ` ${className}` : ""}`}
      style={
        visibleCards && visibleCards > 0
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
