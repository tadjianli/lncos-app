"use client";
/**
 * LN COS — Galerie produit (Shopify-style)
 * Hero 1:1 pleine largeur · miniatures carrées · zoom lightbox · swipe mobile
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FadeImage } from "@/components/shared/FadeImage";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { Icon } from "@/components/shared/Icon";
import { productImageSizes, productImageUrlForSize } from "@/lib/product-image-urls";

const MARKETING_TAGS = new Set(["Best-seller", "Nouveau", "Nouveauté", "Flash"]);

function galleryTagAttrs(tag: string) {
  const isMarketing = MARKETING_TAGS.has(tag);
  const isFlash = tag === "Flash" || tag === "Édition limitée";
  return {
    "data-marketing": isMarketing ? "1" : "0",
    "data-flash": isFlash ? "1" : "0",
  } as const;
}

interface ProductGalleryProps {
  images: string[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  alt: string;
  tag?: string | null;
  /** Ref sur la section galerie (IntersectionObserver boutons flottants) */
  sectionRef?: React.Ref<HTMLElement>;
}

function GalleryHeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <FadeImage
      src={src}
      alt={alt}
      fill
      sizes={productImageSizes("gallery-hero")}
      className="pd-gallery-hero-img"
      fallbackLabel={alt}
      priority
      loading="eager"
    />
  );
}

export function ProductGallery({
  images,
  activeIndex,
  onActiveIndexChange,
  alt,
  tag,
  sectionRef,
}: ProductGalleryProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomThumb, setZoomThumb] = useState<number | null>(null);
  const touchStartX = useRef(0);
  const suppressClickRef = useRef(false);
  const heroSrc = images[activeIndex] ?? images[0];
  const lightboxSrc = heroSrc ? (productImageUrlForSize(heroSrc, "main") ?? heroSrc) : null;

  useEffect(() => {
    if (activeIndex >= images.length) onActiveIndexChange(0);
  }, [activeIndex, images.length, onActiveIndexChange]);

  useEffect(() => {
    if (!heroSrc || typeof document === "undefined") return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = heroSrc;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [heroSrc]);

  useEffect(() => {
    if (!zoomOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [zoomOpen]);

  const goPrev = useCallback(() => {
    onActiveIndexChange(Math.max(0, activeIndex - 1));
  }, [activeIndex, onActiveIndexChange]);

  const goNext = useCallback(() => {
    onActiveIndexChange(Math.min(images.length - 1, activeIndex + 1));
  }, [activeIndex, images.length, onActiveIndexChange]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const endX = e.changedTouches[0]?.clientX ?? 0;
    const dx = endX - touchStartX.current;
    if (Math.abs(dx) < 44) return;
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 400);
    if (dx < 0) goNext();
    else goPrev();
  }

  function handleHeroClick() {
    if (suppressClickRef.current) return;
    setZoomOpen(true);
  }

  function handleLightboxKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") setZoomOpen(false);
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  }

  function selectThumb(i: number) {
    onActiveIndexChange(i);
    setZoomThumb(i);
    window.setTimeout(() => setZoomThumb(null), 280);
  }

  if (!heroSrc) {
    return (
      <section ref={sectionRef} className="pd-gallery" aria-label="Galerie produit">
        <div className="pd-gallery-hero" style={{ cursor: "default" }}>
          <div className="pd-gallery-hero-inner">
            <ProductImagePlaceholder label={alt} className="prod-img-placeholder--hero" />
          </div>
          {tag && (
            <span className="pd-gallery-tag" {...galleryTagAttrs(tag)}>
              {tag}
            </span>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      <section ref={sectionRef} className="pd-gallery" aria-label="Galerie produit">
        <button
          type="button"
          className="pd-gallery-hero"
          onClick={handleHeroClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Agrandir l'image"
        >
          <div className="pd-gallery-hero-inner">
            <GalleryHeroImage src={heroSrc} alt={alt} />
          </div>

          <div className="pd-gallery-hero-overlay" aria-hidden />

          {tag && (
            <span className="pd-gallery-tag" {...galleryTagAttrs(tag)}>
              {tag}
            </span>
          )}

          {images.length > 1 && (
            <span className="pd-gallery-counter" aria-live="polite">
              {activeIndex + 1} / {images.length}
            </span>
          )}

          <span className="pd-gallery-zoom-hint">
            <Icon name="search" size={11} color="rgba(255,255,255,.75)" />
            Zoom
          </span>
        </button>

        {images.length > 1 && (
          <div className="pd-gallery-thumbs noscroll" role="tablist" aria-label="Vues du produit">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                role="tab"
                aria-selected={activeIndex === i}
                aria-label={`Vue ${i + 1}`}
                className={`pd-gallery-thumb${activeIndex === i ? " is-active" : ""}${zoomThumb === i ? " is-zooming" : ""}`}
                onClick={() => selectThumb(i)}
              >
                <FadeImage
                  src={src}
                  alt={`${alt} — vue ${i + 1}`}
                  fill
                  sizes={productImageSizes("gallery-thumb")}
                  className="pd-gallery-thumb-img"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {zoomOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pd-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Zoom image produit"
            onKeyDown={handleLightboxKey}
            tabIndex={-1}
            ref={(el) => el?.focus()}
          >
            <button
              type="button"
              className="pd-lightbox-close"
              onClick={() => setZoomOpen(false)}
              aria-label="Fermer"
            >
              <Icon name="x" size={22} color="#fff" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="pd-lightbox-nav pd-lightbox-nav--prev"
                  onClick={goPrev}
                  disabled={activeIndex <= 0}
                  aria-label="Image précédente"
                >
                  <Icon name="chevL" size={24} color="#fff" />
                </button>
                <button
                  type="button"
                  className="pd-lightbox-nav pd-lightbox-nav--next"
                  onClick={goNext}
                  disabled={activeIndex >= images.length - 1}
                  aria-label="Image suivante"
                >
                  <Icon name="chevR" size={24} color="#fff" />
                </button>
              </>
            )}

            <div
              className="pd-lightbox-stage"
              onClick={() => setZoomOpen(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={lightboxSrc ?? heroSrc}
                src={lightboxSrc ?? heroSrc}
                alt={alt}
                className="pd-lightbox-img"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {images.length > 1 && (
              <div className="pd-lightbox-dots">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={`pd-lightbox-dot${activeIndex === i ? " is-active" : ""}`}
                    onClick={() => onActiveIndexChange(i)}
                    aria-label={`Vue ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
