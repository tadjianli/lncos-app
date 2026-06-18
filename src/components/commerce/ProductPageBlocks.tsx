"use client";

import type { ReactNode } from "react";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductReviewsSection, ProductReviewsSummary } from "@/components/commerce/ProductReviewsSection";
import { ProductBeforeAfterSection } from "@/components/commerce/ProductBeforeAfterSection";
import {
  ProductLiveViewers,
  ProductSalesCounter,
  ProductStockAlert,
} from "@/components/social-proof/ProductSocialProof";
import { TrustBadges } from "@/components/commerce/TrustBadges";
import { VariantSwatches } from "@/components/commerce/VariantSwatches";
import { HorizontalProductCarousel } from "@/components/carousels/HorizontalProductCarousel";
import { ProductCard } from "@/components/shared/ProductCard";
import { Icon } from "@/components/shared/Icon";
import type { Product } from "@/lib/data";
import type { ProductExtraSection } from "@/lib/product-sections";
import type { ProductPageBlock, ProductPageFaqItem } from "@/lib/product-page-builder";
import type { ProductNavSource } from "@/lib/product-navigation";

export interface ProductPageRenderCtx {
  product: Product;
  galleryRef: React.RefObject<HTMLElement | null>;
  gallery: string[];
  activeImg: number;
  setGalleryIndex: (i: number) => void;
  displayPrice: number;
  displayStock: number;
  displaySku: string;
  totalPrice: number;
  outOfStock: boolean;
  lowStock: boolean;
  added: boolean;
  qty: number;
  setQty: (fn: (q: number) => number) => void;
  selectedVariantName: string;
  setSelectedVariantName: (name: string) => void;
  showVariants: boolean;
  showReference: boolean;
  showBenefits: boolean;
  showDescription: boolean;
  showUsageTips: boolean;
  benefitLines: string[];
  usageTips: string[];
  extraSections: ProductExtraSection[];
  openSections: Set<string>;
  toggleSection: (id: string) => void;
  scrollToReviews: () => void;
  isBestSeller: boolean;
  routine: Product[];
  related: Product[];
  favs: string[];
  openProduct: (p: Product, opts?: { source?: ProductNavSource; fromRecommendations?: boolean }) => void;
  toggleFav: (id: string) => void;
  addToCart: (p: Product, qty: number, variant?: string) => void;
  showToast: (msg: string) => void;
  handleAdd: () => void;
  AccordionSection: React.ComponentType<{
    title: string;
    open: boolean;
    onToggle: () => void;
    children: ReactNode;
  }>;
  StepsList: React.ComponentType<{ steps: string[] }>;
  BulletList: React.ComponentType<{ items: string[] }>;
  ExtraSectionBody: React.ComponentType<{ section: ProductExtraSection }>;
}

function FaqBlock({ items }: { items: ProductPageFaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="ppb-faq" style={{ marginBottom: 24 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 500, color: "var(--ink-soft)" }}>
        Questions fréquentes
      </h3>
      {items.map((item, i) => (
        <details
          key={`${item.question}-${i}`}
          className="ppb-faq-item"
          style={{
            borderBottom: "1px solid rgba(255,255,255,.07)",
            padding: "12px 0",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink)",
              listStyle: "none",
            }}
          >
            {item.question}
          </summary>
          <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6 }}>
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export function ProductPageBlockView({
  block,
  ctx,
  padded,
}: {
  block: ProductPageBlock;
  ctx: ProductPageRenderCtx;
  padded?: boolean;
}) {
  const p = ctx.product;
  const s = block.settings;
  const wrap = (node: ReactNode) =>
    padded ? <div style={{ padding: "0 18px" }}>{node}</div> : node;

  switch (block.type) {
    case "gallery":
      return (
        <ProductGallery
          sectionRef={ctx.galleryRef}
          images={ctx.gallery}
          activeIndex={ctx.activeImg}
          onActiveIndexChange={ctx.setGalleryIndex}
          alt={p.name}
          tag={s.showTag !== false ? p.tag : null}
        />
      );

    case "product_info":
      return wrap(
        <div className="pd-product-info">
          <h1 className="pd-product-info__title">{p.name}</h1>
          {s.showCategory !== false && (
            <div className="pd-product-info__meta">
              {p.cat} · {p.ml}
            </div>
          )}
          {s.showBestSeller !== false && ctx.isBestSeller && (
            <span className="pd-product-info__badge">Best-seller</span>
          )}
          <div className="pd-product-info__prices">
            <span className="pd-product-info__price">
              {ctx.displayPrice.toFixed(2)} €
            </span>
            {p.old && (
              <>
                <span className="pd-product-info__price-old">
                  {p.old.toFixed(2)} €
                </span>
                <span className="pd-product-info__discount">
                  −{Math.round((1 - ctx.displayPrice / p.old) * 100)}%
                </span>
              </>
            )}
          </div>
          {s.showStock !== false && (
            <div style={{ marginBottom: 14 }}>
              {ctx.outOfStock ? (
                <span className="pd-stock-badge pd-stock-badge--out">Rupture de stock</span>
              ) : ctx.lowStock ? (
                <span className="pd-stock-badge pd-stock-badge--low">
                  Plus que {ctx.displayStock} en stock
                </span>
              ) : (
                <span className="pd-stock-badge pd-stock-badge--ok">En stock</span>
              )}
            </div>
          )}
        </div>
      );

    case "stock_alert":
      return wrap(<ProductStockAlert stock={ctx.displayStock} />);

    case "reviews_summary":
      return wrap(
        <ProductReviewsSummary
          productId={p.id}
          fallbackRating={p.rating}
          fallbackCount={p.reviews}
          onViewReviews={ctx.scrollToReviews}
        />
      );

    case "reference":
      if (!ctx.showReference) return null;
      return wrap(
        <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 14, letterSpacing: ".06em" }}>
          Réf. {ctx.displaySku}
        </div>
      );

    case "live_viewers":
      return wrap(<ProductLiveViewers productId={p.id} />);

    case "variants":
      if (!ctx.showVariants) return null;
      return wrap(
        <VariantSwatches
          product={p}
          selectedName={ctx.selectedVariantName}
          onSelect={ctx.setSelectedVariantName}
        />
      );

    case "quantity":
      return wrap(
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--ink-mute)",
              marginBottom: 10,
            }}
          >
            {s.label ?? "Quantité"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              onClick={() => ctx.setQty((q) => Math.max(1, q - 1))}
              className="pd-qty-btn"
              aria-label="Diminuer"
            >
              <Icon name="minus" size={16} />
            </button>
            <span className="pd-qty-value">{ctx.qty}</span>
            <button
              type="button"
              onClick={() => ctx.setQty((q) => q + 1)}
              className="pd-qty-btn"
              aria-label="Augmenter"
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
      );

    case "benefits":
      if (!ctx.showBenefits) return null;
      return wrap(
        <div className="pd-benefits" aria-label="Bénéfices produit">
          {ctx.benefitLines.map((line) => (
            <div key={line} className="pd-benefits-item">
              <Icon name="check" size={14} color="var(--ink-mute)" stroke={2.2} />
              <span>{line}</span>
            </div>
          ))}
        </div>
      );

    case "description":
      if (!ctx.showDescription) return null;
      return wrap(
        <div style={{ marginBottom: 24, borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <ctx.AccordionSection
            title="Description"
            open={ctx.openSections.has("description")}
            onToggle={() => ctx.toggleSection("description")}
          >
            <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7, margin: 0 }}>
              {p.desc}
            </p>
          </ctx.AccordionSection>
        </div>
      );

    case "usage_tips":
      if (!ctx.showUsageTips && ctx.extraSections.length === 0) return null;
      return wrap(
        <div style={{ marginBottom: 24, borderTop: "1px solid rgba(255,255,255,.07)" }}>
          {ctx.showUsageTips && (
            <ctx.AccordionSection
              title="Conseils d'utilisation"
              open={ctx.openSections.has("conseils")}
              onToggle={() => ctx.toggleSection("conseils")}
            >
              <ctx.StepsList steps={ctx.usageTips} />
            </ctx.AccordionSection>
          )}
          {ctx.extraSections.map((section) => (
            <ctx.AccordionSection
              key={section.id}
              title={section.title.trim() || "Informations"}
              open={ctx.openSections.has(section.id)}
              onToggle={() => ctx.toggleSection(section.id)}
            >
              <ctx.ExtraSectionBody section={section} />
            </ctx.AccordionSection>
          ))}
        </div>
      );

    case "video": {
      const url = s.videoUrl?.trim() || p.videoUrl?.trim();
      if (!url) return null;
      return wrap(
        <div className="ppb-video" style={{ marginBottom: 24 }}>
          <video
            src={url}
            controls
            playsInline
            autoPlay={s.autoplay === true}
            style={{ width: "100%", borderRadius: 14, maxHeight: 280, background: "#000" }}
          />
        </div>
      );
    }

    case "faq":
      return wrap(<FaqBlock items={s.items ?? []} />);

    case "custom": {
      const title = s.title?.trim() || block.title;
      const body = s.body?.trim();
      if (!title && !body) return null;
      return wrap(
        <div style={{ marginBottom: 24, borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <ctx.AccordionSection
            title={title}
            open={ctx.openSections.has(block.id)}
            onToggle={() => ctx.toggleSection(block.id)}
          >
            {body ? (
              <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                {body}
              </p>
            ) : null}
          </ctx.AccordionSection>
        </div>
      );
    }

    case "routine":
      if (ctx.routine.length === 0) return null;
      return wrap(
        <div style={{ marginBottom: 30 }}>
          <div className="ppd-section-label">Routine beauté</div>
          <h3 style={{ margin: "0 0 14px", fontWeight: 500, fontSize: 16, color: "var(--ink)" }}>
            {s.title ?? "Complétez votre rituel"}
          </h3>
          <HorizontalProductCarousel fillColumns={2} bleed={false}>
            {ctx.routine.map((r) => (
              <ProductCard
                key={r.id}
                p={r}
                onOpen={ctx.openProduct}
                onFav={ctx.toggleFav}
                isFav={ctx.favs.includes(r.id)}
                onAdd={(pr) => {
                  ctx.addToCart(pr, 1, pr.variants[0]);
                  ctx.showToast(`${pr.name} ajouté ✨`);
                }}
              />
            ))}
          </HorizontalProductCarousel>
        </div>
      );

    case "before_after":
      return wrap(<ProductBeforeAfterSection productId={p.id} sectionTitle={s.title} />);

    case "reviews":
      return wrap(
        <ProductReviewsSection
          productId={p.id}
          fallbackRating={p.rating}
          fallbackCount={p.reviews}
          sectionId="product-reviews"
        />
      );

    case "recommendations": {
      const max = s.maxItems ?? 8;
      const items = ctx.related.slice(0, max);
      if (items.length === 0) return null;
      return wrap(
        <div style={{ marginBottom: 8, marginTop: 24 }}>
          <h3 style={{ margin: "0 0 14px", fontWeight: 500, fontSize: 16, color: "var(--ink-soft)" }}>
            {s.title ?? "Vous aimerez aussi"}
          </h3>
          <HorizontalProductCarousel fillColumns={2} bleed={false}>
            {items.map((r) => (
              <ProductCard
                key={r.id}
                p={r}
                onOpen={(pr) => ctx.openProduct(pr, { fromRecommendations: true })}
                onFav={ctx.toggleFav}
                isFav={ctx.favs.includes(r.id)}
                onAdd={(pr) => {
                  ctx.addToCart(pr, 1, pr.variants[0]);
                  ctx.showToast(`${pr.name} ajouté ✨`);
                }}
              />
            ))}
          </HorizontalProductCarousel>
        </div>
      );
    }

    case "sales_counter":
      return <ProductSalesCounter productId={p.id} />;

    case "add_to_cart":
      return (
        <div className="lncos-sticky-cta-wrap">
          <button
            type="button"
            onClick={ctx.handleAdd}
            disabled={ctx.outOfStock}
            className={`lncos-cta lncos-cta--sticky-cart pd-cta-btn${ctx.outOfStock ? " lncos-cta--disabled pd-cta-btn--disabled" : ctx.added ? " lncos-cta--success pd-cta-btn--success" : " lncos-cta--pink pd-cta-btn--pink"}`}
          >
            {ctx.outOfStock ? (
              "Rupture de stock"
            ) : ctx.added ? (
              <>
                <Icon name="check" size={17} color="#fff" stroke={2.5} />
                Ajouté au panier !
              </>
            ) : (
              <>
                <Icon name="bag" size={17} />
                {s.ctaLabel?.trim() || "Ajouter au panier"}
                {s.showPrice !== false && (
                  <>
                    <span style={{ opacity: 0.55, fontWeight: 600 }}>•</span>
                    {ctx.totalPrice} €
                  </>
                )}
              </>
            )}
          </button>
        </div>
      );

    case "trust_badges":
      return <TrustBadges />;

    default:
      return null;
  }
}

export function ProductPageStickyBlockView({
  block,
  ctx,
}: {
  block: ProductPageBlock;
  ctx: ProductPageRenderCtx;
}) {
  return <ProductPageBlockView block={block} ctx={ctx} padded={false} />;
}
