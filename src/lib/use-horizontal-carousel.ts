"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseHorizontalCarouselOptions {
  /** Boucle fluide vers le début en fin de piste */
  loop?: boolean;
  /** Afficher le bouton retour à partir de ce ratio (0–1) */
  backThreshold?: number;
  /** Désactiver (galeries produit, sélecteurs variantes, etc.) */
  enabled?: boolean;
}

function scrollProgress(el: HTMLElement): number {
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 1) return 0;
  return el.scrollLeft / max;
}

function isAtEnd(el: HTMLElement, slack = 6): boolean {
  return el.scrollLeft + el.clientWidth >= el.scrollWidth - slack;
}

export function useHorizontalCarousel({
  loop = false,
  backThreshold = 0.7,
  enabled = true,
}: UseHorizontalCarouselOptions = {}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [showBack, setShowBack] = useState(false);
  const loopingRef = useRef(false);
  const loopTimerRef = useRef<number | null>(null);
  const scrollIdleRef = useRef<number | null>(null);

  const updateBack = useCallback(
    (el: HTMLElement) => {
      setShowBack(scrollProgress(el) >= backThreshold);
    },
    [backThreshold]
  );

  const scrollToStart = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "smooth" });
  }, []);

  const loopToStart = useCallback((el: HTMLElement) => {
    if (loopingRef.current) return;
    loopingRef.current = true;
    el.scrollTo({ left: 0, behavior: "smooth" });
    if (loopTimerRef.current != null) window.clearTimeout(loopTimerRef.current);
    loopTimerRef.current = window.setTimeout(() => {
      loopingRef.current = false;
      updateBack(el);
    }, 520);
  }, [updateBack]);

  useEffect(() => {
    if (!enabled) {
      setShowBack(false);
      return;
    }

    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      if (loopingRef.current) return;
      updateBack(el);
      if (scrollIdleRef.current != null) window.clearTimeout(scrollIdleRef.current);
      scrollIdleRef.current = window.setTimeout(() => {
        onScrollEnd();
      }, 140);
    };

    const onScrollEnd = () => {
      if (loopingRef.current) return;
      updateBack(el);
      if (loop && isAtEnd(el)) loopToStart(el);
    };

    updateBack(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEnd, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd);
      if (loopTimerRef.current != null) window.clearTimeout(loopTimerRef.current);
      if (scrollIdleRef.current != null) window.clearTimeout(scrollIdleRef.current);
    };
  }, [enabled, loop, loopToStart, updateBack]);

  return { trackRef, showBack: enabled && showBack, scrollToStart };
}
