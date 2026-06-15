"use client";
/**
 * LN COS — SectionRenderer
 *
 * Maps a `HomeSection` config record to the appropriate homepage UI component.
 * This is the render half of the section registry pattern.
 *
 * The schema half lives in src/lib/section-registry.ts (App Builder metadata).
 *
 * All visual components (HeroSection, TrustStrip, etc.) are imported from page.tsx
 * via re-exports from src/components/home/sections/. For now we accept them as
 * render props to avoid a full extract — the API is stable for future extraction.
 *
 * Usage in page.tsx:
 *   <SectionRenderer
 *     key={section.id}
 *     section={section}
 *     products={productsBySource}
 *     index={i}
 *     onAdd={handleAdd}
 *     onFav={handleFav}
 *     onOpen={handleOpen}
 *     isFav={isFav}
 *     onListing={openListing}
 *   />
 */

import type { HomeSection, ProductSource } from "@/lib/home-sections";
import type { Product } from "@/lib/data";

/* ─── Props ─────────────────────────────────────────────────────────── */

export interface SectionCallbacks {
  onAdd: (p: Product) => void;
  onFav: (id: string) => void;
  onOpen: (p: Product) => void;
  isFav: (id: string) => boolean;
  onListing: (cat: unknown) => void;
}

export interface SectionRendererProps extends SectionCallbacks {
  section: HomeSection;
  /** Pre-resolved product lists keyed by source */
  products: Partial<Record<ProductSource, Product[]>>;
  /** Render index — used for stagger delays */
  index: number;
  /**
   * Render slot injected by the parent component.
   * Each case in the switch below calls the appropriate render prop.
   */
  renderHero:        () => React.ReactNode;
  renderTrust:       () => React.ReactNode;
  renderProducts:    (source: ProductSource, title: string, variant: string) => React.ReactNode;
  renderRoutine:     () => React.ReactNode;
  renderPromo:       () => React.ReactNode;
  renderBento:       () => React.ReactNode;
  renderQuote:       () => React.ReactNode;
  renderNewsletter:  () => React.ReactNode;
}

/* ─── Renderer ──────────────────────────────────────────────────────── */

/**
 * SectionRenderer is intentionally thin — it delegates all rendering to the
 * injected render props so the parent (page.tsx) controls the actual components.
 * This keeps the registry decoupled from the concrete UI implementations while
 * still providing a single dispatch point for the App Builder to hook into.
 */
export function SectionRenderer({
  section,
  renderHero,
  renderTrust,
  renderProducts,
  renderRoutine,
  renderPromo,
  renderBento,
  renderQuote,
  renderNewsletter,
}: SectionRendererProps): React.ReactNode {
  if (!section.enabled) return null;

  switch (section.type) {
    case "hero":
      return renderHero();
    case "trust":
      return renderTrust();
    case "products":
      return renderProducts(
        (section.source ?? "flash") as ProductSource,
        section.title,
        section.variant ?? "carousel"
      );
    case "routine":
      return renderRoutine();
    case "promo":
      return renderPromo();
    case "bento":
      return renderBento();
    case "quote":
      return renderQuote();
    case "newsletter":
      return renderNewsletter();
    default:
      // Unknown section type — log in dev, render nothing in prod
      if (process.env.NODE_ENV === "development") {
        console.warn(`[SectionRenderer] Unknown section type: ${(section as HomeSection).type}`);
      }
      return null;
  }
}
