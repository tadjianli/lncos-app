"use client";

import { memo, type CSSProperties, type ReactNode } from "react";
import { CarouselBackToStart } from "@/components/carousels/CarouselBackToStart";
import { useHorizontalCarousel } from "@/lib/use-horizontal-carousel";

export interface HorizontalScrollRowProps {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  style?: CSSProperties;
  /** Carrousel éditorial : boucle + bouton retour */
  enhanceScroll?: boolean;
}

/**
 * Piste horizontale générique (UGC, catégories, filtres).
 * Ne pas utiliser pour la galerie produit ni les pills variantes.
 */
export const HorizontalScrollRow = memo(function HorizontalScrollRow({
  children,
  className = "",
  trackClassName = "",
  style,
  enhanceScroll = true,
}: HorizontalScrollRowProps) {
  const { trackRef, showBack, scrollToStart } = useHorizontalCarousel({
    enabled: enhanceScroll,
  });

  return (
    <div className={`hsc${className ? ` ${className}` : ""}`}>
      <div
        ref={trackRef}
        className={`hsc__track noscroll${trackClassName ? ` ${trackClassName}` : ""}`}
        style={style}
      >
        {children}
      </div>
      {showBack && <CarouselBackToStart onClick={scrollToStart} />}
    </div>
  );
});
