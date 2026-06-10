"use client";

import { memo, type CSSProperties, type ReactNode } from "react";

export interface HorizontalProductCarouselProps {
  children: ReactNode;
  /** Compense le padding parent pour un défilement bord à bord (sections home, fiche produit). */
  bleed?: boolean;
  /**
   * Nombre de cartes visibles — largeur = (100% − gaps) ÷ n.
   * Défaut mobile : 2 colonnes pleine largeur (Best Sellers, Nouveautés, liés).
   */
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
  visibleCards = 2,
  className = "",
  style,
}: HorizontalProductCarouselProps) {
  const cols = visibleCards > 0 ? visibleCards : 2;
  const fillClass = ` hpc--fill-${cols}`;

  return (
    <div
      className={`hpc${bleed ? " hpc--bleed" : ""}${fillClass}${className ? ` ${className}` : ""}`}
      style={{ "--hpc-visible": cols } as CSSProperties}
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
