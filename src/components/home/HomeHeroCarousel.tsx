"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroCarouselSettings, HeroCarouselSlide } from "@/lib/hero-carousel";
import { isImageUrl } from "@/lib/admin-media";

const AUTOPLAY_LOG = true;
const RESUME_AFTER_MS = 5000;

function logHero(message: string, detail?: unknown) {
  if (!AUTOPLAY_LOG || typeof console === "undefined") return;
  if (detail !== undefined) {
    console.log(`[HeroCarousel] ${message}`, detail);
  } else {
    console.log(`[HeroCarousel] ${message}`);
  }
}

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
          <h2 className="hero-carousel-title">
            {slide.title}
            {slide.titleAccent ? (
              <>
                {" "}
                <span className="gold-text" style={{ fontStyle: "italic" }}>
                  {slide.titleAccent}
                </span>
              </>
            ) : null}
          </h2>
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const indexRef = useRef(0);
  const countRef = useRef(slides.length);
  const pausedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const autoplayActiveRef = useRef(false);

  const count = slides.length;
  const isCarousel = count > 1 && settings.enabled;
  const intervalMs = Math.max(4000, Math.min(5000, (settings.intervalSeconds || 5) * 1000));

  countRef.current = count;
  indexRef.current = index;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setIndex(0);
    indexRef.current = 0;
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

  const goTo = useCallback((next: number) => {
    const total = countRef.current;
    if (total <= 1) return;
    const normalized = ((next % total) + total) % total;
    if (normalized === indexRef.current) return;
    indexRef.current = normalized;
    setIndex(normalized);
    logHero("slide changed", { index: normalized, total });
  }, []);

  const goNext = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  const clearAutoplayTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const scheduleAutoplayTick = useCallback(() => {
    clearAutoplayTimer();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (
        !autoplayActiveRef.current ||
        pausedRef.current ||
        document.hidden ||
        countRef.current <= 1
      ) {
        scheduleAutoplayTick();
        return;
      }
      goNext();
      scheduleAutoplayTick();
    }, intervalMs);
  }, [clearAutoplayTimer, goNext, intervalMs]);

  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true;
    clearAutoplayTimer();
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      pausedRef.current = false;
      logHero("autoplay resumed");
      scheduleAutoplayTick();
    }, RESUME_AFTER_MS);
  }, [clearAutoplayTimer, clearResumeTimer, scheduleAutoplayTick]);

  useEffect(() => {
    const canAutoplay =
      isCarousel && settings.autoplay && !preview && !prefersReducedMotion;

    autoplayActiveRef.current = canAutoplay;
    pausedRef.current = false;
    clearAutoplayTimer();
    clearResumeTimer();

    if (!canAutoplay) return;

    logHero("autoplay started", { intervalMs, slides: countRef.current });
    scheduleAutoplayTick();

    const onVisibility = () => {
      if (document.hidden) {
        clearAutoplayTimer();
        return;
      }
      if (!pausedRef.current && autoplayActiveRef.current) {
        logHero("autoplay resumed");
        scheduleAutoplayTick();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      autoplayActiveRef.current = false;
      document.removeEventListener("visibilitychange", onVisibility);
      clearAutoplayTimer();
      clearResumeTimer();
    };
  }, [
    isCarousel,
    settings.autoplay,
    preview,
    prefersReducedMotion,
    intervalMs,
    scheduleAutoplayTick,
    clearAutoplayTimer,
    clearResumeTimer,
  ]);

  function onTouchStart(e: React.TouchEvent) {
    if (!isCarousel) return;
    pauseAutoplay();
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
    pauseAutoplay();
  }

  function handleDotClick(i: number) {
    goTo(i);
    pauseAutoplay();
  }

  function handleCta(slide: HeroCarouselSlide) {
    pauseAutoplay();
    if (slide.buttonLink.trim()) {
      navigateToLink(router, slide.buttonLink);
      return;
    }
    router.push("/boutique");
  }

  if (count === 0) return null;

  const showIndicators = isCarousel && settings.showIndicators;

  return (
    <div className="home-z hero-carousel-wrap" style={{ padding: "16px 18px 0" }}>
      <div
        className="hero-carousel"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPointerDown={isCarousel ? pauseAutoplay : undefined}
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
                onClick={() => handleDotClick(i)}
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
