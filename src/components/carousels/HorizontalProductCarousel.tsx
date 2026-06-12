"use client";

import { memo, type CSSProperties, type ReactNode } from "react";
import { CarouselBackToStart } from "@/components/carousels/CarouselBackToStart";
import { useHorizontalCarousel } from "@/lib/use-horizontal-carousel";

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
  /** Boucle fin → début + bouton « Retour au début » après 70 % */
  enhanceScroll?: boolean;
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
  enhanceScroll = true,
  className = "",
  style,
}: HorizontalProductCarouselProps) {
  const cols = fillColumns ?? (visibleCards && visibleCards > 0 ? (visibleCards as 2 | 3) : undefined);
  const fillClass = cols ? ` hpc--fill-${cols}` : "";
  const premiumClass = !cols && premium ? " hpc--premium" : "";

  const { trackRef, showBack, scrollToStart } = useHorizontalCarousel({
    enabled: enhanceScroll,
  });

  return (
    <div
      className={`hpc${bleed ? " hpc--bleed" : ""}${premiumClass}${fillClass}${className ? ` ${className}` : ""}`}
      style={cols ? ({ "--hpc-visible": cols } as CSSProperties) : undefined}
    >
      <div className="hpc__fade hpc__fade--left" aria-hidden />
      <div ref={trackRef} className="hpc__track noscroll" style={style}>
        {children}
        <span className="hpc__end" aria-hidden />
      </div>
      {showBack && <CarouselBackToStart onClick={scrollToStart} />}
      <div className="hpc__fade hpc__fade--right" aria-hidden />
    </div>
  );
});
