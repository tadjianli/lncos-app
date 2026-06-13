"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroCarouselSettings, HeroCarouselSlide } from "@/lib/hero-carousel";
import { isImageUrl } from "@/lib/admin-media";

export interface HomeHeroCarouselProps {
  slides: HeroCarouselSlide[];
  settings: HeroCarouselSettings;
  /** Désactive les actions CTA (aperçu admin). */
  preview?: boolean;
}

function navigateToLink(router: ReturnType<typeof useRouter>, link: string) {
  const trimmed = link.trim();
  if (!trimmed) return;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    window.location.href = trimmed;
    return;
  }
  router.push(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}

interface SlideContentProps {
  slide: HeroCarouselSlide;
  isActive: boolean;
  priority?: boolean;
  preview?: boolean;
  onCta?: () => void;
}

function SlideContent({ slide, isActive, priority, preview, onCta }: SlideContentProps) {
  const bgImage = isImageUrl(slide.imageUrl) ? slide.imageUrl! : null;

  return (
    <article
      className={`hero-carousel-slide${isActive ? " is-active" : ""}`}
      aria-hidden={!isActive}
      data-position={slide.position}
    >
      <div className="hero-carousel-media">
        {bgImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImage}
            alt={slide.imageAlt || slide.title || "Bannière LN COS"}
            className="hero-carousel-img"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding={priority ? "sync" : "async"}
          />
        ) : (
          <div className="hero-carousel-img hero-carousel-img-fallback" aria-hidden />
        )}
      </div>

      <div className="hero-carousel-overlay" aria-hidden />
      <div className="hero-carousel-glow" aria-hidden />

      <div className="hero-carousel-body">
        {slide.subtitle ? (
          <p className="hero-carousel-eyebrow">{slide.subtitle}</p>
        ) : null}
        {slide.title ? (
          <h2 className="hero-carousel-title">{slide.title}</h2>
        ) : null}
        {slide.buttonText ? (
          <button
            type="button"
            className="hero-carousel-cta"
            onClick={preview ? undefined : onCta}
            tabIndex={isActive ? 0 : -1}
          >
            {slide.buttonText}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function HomeHeroCarousel({ slides, settings, preview }: HomeHeroCarouselProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  const count = slides.length;
  const isCarousel = count > 1 && settings.enabled;
  const intervalMs = Math.max(2000, (settings.intervalSeconds || 5) * 1000);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [slides.map((s) => s.id).join(",")]);

  useEffect(() => {
    const first = slides[0]?.imageUrl;
    if (!first || typeof document === "undefined") return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = first;
    document.head.appendChild(link);
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [slides[0]?.imageUrl]);

  const goTo = useCallback(
    (next: number) => {
      if (count <= 1) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!isCarousel || !settings.autoplay || preview || reducedMotion.current) return;
    const id = window.setInterval(goNext, intervalMs);
    return () => window.clearInterval(id);
  }, [isCarousel, settings.autoplay, preview, intervalMs, goNext]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || !isCarousel) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goNext();
    else goPrev();
  }

  function handleCta(slide: HeroCarouselSlide) {
    if (slide.buttonLink.trim()) {
      navigateToLink(router, slide.buttonLink);
      return;
    }
    router.push("/boutique");
  }

  if (count === 0) return null;

  const showControls = isCarousel;
  const showArrows = showControls && settings.showArrows;
  const showIndicators = showControls && settings.showIndicators;

  return (
    <div className="home-z hero-carousel-wrap" style={{ padding: "16px 18px 0" }}>
      <div
        className="hero-carousel"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role={isCarousel ? "region" : undefined}
        aria-roledescription={isCarousel ? "carousel" : undefined}
        aria-label={isCarousel ? "Bannière d'accueil" : undefined}
      >
        {slides.map((slide, i) => (
          <SlideContent
            key={slide.id}
            slide={slide}
            isActive={i === index || !isCarousel}
            priority={i === 0}
            preview={preview}
            onCta={() => handleCta(slide)}
          />
        ))}

        {showArrows && (
          <>
            <button
              type="button"
              className="hero-carousel-arrow hero-carousel-arrow-prev"
              aria-label="Slide précédente"
              onClick={goPrev}
            >
              ‹
            </button>
            <button
              type="button"
              className="hero-carousel-arrow hero-carousel-arrow-next"
              aria-label="Slide suivante"
              onClick={goNext}
            >
              ›
            </button>
          </>
        )}

        {showIndicators && (
          <div className="hero-carousel-indicators" role="tablist" aria-label="Slides">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                className={`hero-carousel-dot${i === index ? " is-active" : ""}`}
                aria-selected={i === index}
                aria-label={`Slide ${slide.position}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Affichage d'une slide unique (sans contrôles carousel). */
export function HomeHeroSingleSlide(props: Omit<HomeHeroCarouselProps, "settings"> & {
  slide: HeroCarouselSlide;
}) {
  const { slide, preview } = props;
  const router = useRouter();

  return (
    <div className="home-z hero-carousel-wrap" style={{ padding: "16px 18px 0" }}>
      <div className="hero-carousel hero-carousel-single">
        <SlideContent
          slide={slide}
          isActive
          priority
          preview={preview}
          onCta={() => {
            if (slide.buttonLink.trim()) {
              navigateToLink(router, slide.buttonLink);
            } else {
              router.push("/boutique");
            }
          }}
        />
      </div>
    </div>
  );
}
