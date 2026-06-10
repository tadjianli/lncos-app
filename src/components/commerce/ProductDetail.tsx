"use client";
/**
 * LN COS — Product detail screen (premium edition)
 * Full immersive overlay: gallery, variant pills, qty stepper,
 * expandable editorial accordions, routine carousel, sticky CTA.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { MobileBackButton } from "@/components/shared/ActionButtons";
import { HorizontalProductCarousel } from "@/components/carousels/HorizontalProductCarousel";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductReviewsSection, ProductReviewsSummary } from "@/components/commerce/ProductReviewsSection";
import { ProductBeforeAfterSection } from "@/components/commerce/ProductBeforeAfterSection";
import {
  ProductLiveViewers,
  ProductSalesCounter,
  ProductStockAlert,
  ProductTrustBadges,
  ProductReassuranceLines,
  ProductDeliveryTrustBlock,
} from "@/components/social-proof/ProductSocialProof";
import { VariantSwatches } from "@/components/commerce/VariantSwatches";
import { useStore } from "@/lib/store";
import { usePublicProducts } from "@/lib/client-supabase";
import {
  buildProductGallery,
  effectivePrice,
  effectiveSku,
  effectiveStock,
  findVariantByName,
  resolveProductImage,
  variantLabels,
} from "@/lib/product-catalog";
import type { Product } from "@/lib/data";
import {
  DEFAULT_SECTION_TOGGLES,
  normalizeExtraSections,
  normalizeSectionToggles,
  type ProductExtraSection,
} from "@/lib/product-sections";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

function nonEmptyLines(lines: string[] | undefined): string[] {
  return (lines ?? []).map((l) => l.trim()).filter(Boolean);
}

function StepsList({ steps }: { steps: string[] }) {
  return (
    <ol
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {steps.map((step, i) => (
        <li key={`${step}-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "var(--gold-grad)",
              display: "grid",
              placeItems: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "#1a1306",
              flexShrink: 0,
              marginTop: 1,
              boxShadow: "0 4px 12px -6px rgba(212,175,55,.6)",
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6, flex: 1 }}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 9,
      }}
    >
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            fontSize: 13,
            color: "var(--ink-soft)",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--gold)",
              flexShrink: 0,
              opacity: 0.7,
            }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ExtraSectionBody({ section }: { section: ProductExtraSection }) {
  if (section.type === "text") {
    if (!section.body.trim()) return null;
    return (
      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
        {section.body}
      </p>
    );
  }
  const items = nonEmptyLines(section.items);
  if (items.length === 0) return null;
  return section.type === "steps" ? <StepsList steps={items} /> : <BulletList items={items} />;
}

function extraSectionHasContent(section: ProductExtraSection): boolean {
  if (section.type === "text") return section.body.trim().length > 0;
  return nonEmptyLines(section.items).length > 0;
}

/* ─── AccordionSection ───────────────────────────────────────── */

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,.07)",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          background: "none",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--ink)",
            letterSpacing: ".01em",
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            color: "var(--ink-mute)",
            transition: "transform 0.28s cubic-bezier(.22,.68,0,1)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            willChange: "transform",
            flexShrink: 0,
          }}
        >
          <Icon name="chevD" size={18} />
        </span>
      </button>

      {open && (
        <div
          style={{
            paddingBottom: 18,
            animation: "fadeUp 0.25s cubic-bezier(.22,.68,0,1) both",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────── */

export function ProductDetail({ product: initialProduct, onClose }: ProductDetailProps) {
  const { products, byId } = usePublicProducts();
  const p = byId(initialProduct.id) ?? initialProduct;

  const sectionToggles = useMemo(
    () => normalizeSectionToggles(p.sectionToggles ?? DEFAULT_SECTION_TOGGLES),
    [p.sectionToggles]
  );
  const usageTips = useMemo(() => nonEmptyLines(p.usageTips), [p.usageTips]);
  const benefitLines = useMemo(() => nonEmptyLines(p.benefits), [p.benefits]);
  const extraSections = useMemo(
    () => normalizeExtraSections(p.extraSections).filter((s) => s.enabled && extraSectionHasContent(s)),
    [p.extraSections]
  );
  const showBenefits = sectionToggles.benefits && benefitLines.length > 0;
  const showDescription = sectionToggles.description && Boolean(p.desc?.trim());
  const showUsageTips = sectionToggles.usageTips && usageTips.length > 0;

  const labels = variantLabels(p);
  const [selectedVariantName, setSelectedVariantName] = useState(labels[0] ?? "");
  const selectedVariant = findVariantByName(p, selectedVariantName);

  const gallery = useMemo(
    () => buildProductGallery(p, selectedVariant),
    [p, selectedVariant]
  );

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(["description"])
  );
  const [galleryInView, setGalleryInView] = useState(true);
  const galleryRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const addToCart = useStore((s) => s.addToCart);
  const toggleFav = useStore((s) => s.toggleFav);
  const favs = useStore((s) => s.favs);
  const openProduct = useStore((s) => s.openProduct);
  const showToast = useStore((s) => s.showToast);

  const displayPrice = effectivePrice(p, selectedVariant);
  const displayStock = effectiveStock(p, selectedVariant);
  const displaySku = effectiveSku(p, selectedVariant);
  const fav = favs.includes(p.id);
  const lowStock = displayStock > 0 && displayStock <= 20;
  const outOfStock = displayStock <= 0;

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
  }, [selectedVariant?.id, p.id]);

  useEffect(() => {
    const gallery = galleryRef.current;
    const root = scrollRef.current;
    if (!gallery || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => setGalleryInView(entry.isIntersecting && entry.intersectionRatio > 0.15),
      { root, threshold: [0, 0.15, 0.5, 1] }
    );
    observer.observe(gallery);
    return () => observer.disconnect();
  }, [p.id]);

  const setGalleryIndex = useCallback((i: number) => setActiveImg(i), []);

  const routine = products
    .filter((x) => x.cat === p.cat && x.id !== p.id)
    .slice(0, 5);

  const related = products
    .filter((x) => x.cat !== p.cat)
    .slice(0, 4);

  const handleAdd = useCallback(() => {
    if (added || outOfStock) return;
    addToCart(p, qty, selectedVariantName || p.variants[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }, [added, outOfStock, addToCart, p, qty, selectedVariantName]);

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const totalPrice = (displayPrice * qty).toFixed(2);
  const isBestSeller = p.tag === "Best-seller" || p.homeVisibility?.best_seller;

  const scrollToReviews = useCallback(() => {
    const el = document.getElementById("product-reviews");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: p.name, text: p.name, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showToast("Lien copié ✨");
      }
    } catch {
      /* annulation utilisateur */
    }
  }, [p.name, showToast]);

  return (
    <div className="pd-overlay">
      <div className="pd-overlay__handle" aria-hidden />

      {/* ── Header produit — sous la barre système iOS ── */}
      <div
        className={`pd-overlay__header pd-float-controls${galleryInView ? "" : " is-hidden"}`}
      >
        <MobileBackButton onClick={onClose} floating />

        <div style={{ display: "flex", gap: 10 }}>
          {/* Floating favourite button */}
          <button
            type="button"
            onClick={() => toggleFav(p.id)}
            className="mobile-screen-header__back mobile-screen-header__back--floating"
            style={{
              background: fav ? "rgba(247,198,215,.25)" : undefined,
              border: fav ? "1px solid rgba(247,198,215,.5)" : undefined,
              transition: "background 0.22s, border-color 0.22s",
            }}
            aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Icon
              name="heart"
              size={20}
              color={fav ? "var(--pink)" : "#fff"}
              fill={fav ? "var(--pink)" : "none"}
            />
          </button>

          <button
            type="button"
            className="mobile-screen-header__back mobile-screen-header__back--floating"
            aria-label="Partager"
            onClick={handleShare}
          >
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div ref={scrollRef} className="pd-overlay__scroll noscroll">

        <ProductGallery
          sectionRef={galleryRef}
          images={gallery}
          activeIndex={activeImg}
          onActiveIndexChange={setGalleryIndex}
          alt={p.name}
          tag={p.tag}
        />

        {/* ── Product info ── */}
        <div style={{ padding: "20px 18px 0" }}>

          {/* Gold decorative hairline */}
          <div
            style={{
              width: 32,
              height: 2,
              borderRadius: 999,
              background: "var(--gold-grad)",
              marginBottom: 12,
            }}
          />

          <h1
            style={{
              margin: "0 0 4px",
              fontWeight: 700,
              fontSize: 25,
              color: "var(--ink)",
              lineHeight: 1.15,
            }}
          >
            {p.name}
          </h1>

          {/* Category + vol */}
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 10 }}>
            {p.cat} · {p.ml}
          </div>

          {isBestSeller && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 12,
                padding: "4px 11px",
                borderRadius: "var(--r-pill)",
                background: "rgba(212,175,55,.12)",
                border: "1px solid rgba(212,175,55,.28)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}
            >
              <Icon name="star" size={11} color="var(--gold)" fill="var(--gold)" />
              Best-seller
            </span>
          )}

          {/* Price row */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)" }}>
              {displayPrice.toFixed(2)} €
            </span>
            {p.old && (
              <>
                <span
                  style={{
                    fontSize: 16,
                    color: "var(--ink-mute)",
                    textDecoration: "line-through",
                  }}
                >
                  {p.old.toFixed(2)} €
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "var(--pink)",
                    background: "rgba(247,198,215,.12)",
                    padding: "3px 9px",
                    borderRadius: "var(--r-pill)",
                  }}
                >
                  −{Math.round((1 - displayPrice / p.old) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Stock indicator */}
          <div style={{ marginBottom: 14 }}>
            {outOfStock ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: "var(--r-pill)",
                  background: "rgba(194,85,122,.12)",
                  border: "1px solid rgba(194,85,122,.25)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--pink)",
                }}
              >
                Rupture de stock
              </span>
            ) : lowStock ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: "var(--r-pill)",
                  background: "rgba(212,175,55,.12)",
                  border: "1px solid rgba(212,175,55,.22)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--gold)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    flexShrink: 0,
                  }}
                />
                Plus que {displayStock} en stock
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: "var(--r-pill)",
                  background: "rgba(123,201,154,.08)",
                  border: "1px solid rgba(123,201,154,.2)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#7BC99A",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#7BC99A",
                    flexShrink: 0,
                  }}
                />
                En stock
              </span>
            )}
          </div>

          <ProductReassuranceLines />
          <ProductStockAlert stock={displayStock} />

          <ProductReviewsSummary
            productId={p.id}
            fallbackRating={p.rating}
            fallbackCount={p.reviews}
            onViewReviews={scrollToReviews}
          />

          {displaySku && (
            <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 14, letterSpacing: ".06em" }}>
              Réf. {displaySku}
            </div>
          )}

          <ProductLiveViewers productId={p.id} />

          <VariantSwatches
            product={p}
            selectedName={selectedVariantName}
            onSelect={setSelectedVariantName}
          />

          {/* ── Quantity stepper ── */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                marginBottom: 11,
              }}
            >
              Quantité
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--charcoal)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--ink)",
                  border: qty > 1
                    ? "1.5px solid var(--gold)"
                    : "1px solid rgba(255,255,255,.1)",
                  cursor: "pointer",
                  transition: "border-color 0.22s, background 0.22s",
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                  flexShrink: 0,
                }}
              >
                <Icon name="minus" size={16} />
              </button>
              <span
                style={{
                  minWidth: 32,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--charcoal)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--ink)",
                  border: "1px solid rgba(255,255,255,.1)",
                  cursor: "pointer",
                  transition: "border-color 0.22s",
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                  flexShrink: 0,
                }}
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
          </div>

          {showBenefits && (
            <div className="pd-benefits" aria-label="Bénéfices produit">
              {benefitLines.map((line) => (
                <div key={line} className="pd-benefits-item">
                  <Icon name="check" size={14} color="var(--pink)" stroke={2.5} />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Expandable editorial sections ── */}
          <div
            style={{
              marginBottom: 24,
              borderTop: "1px solid rgba(255,255,255,.07)",
            }}
          >
            {showDescription && (
              <AccordionSection
                title="Description"
                open={openSections.has("description")}
                onToggle={() => toggleSection("description")}
              >
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--ink-soft)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {p.desc}
                </p>
                {p.ml && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 12,
                      padding: "5px 12px",
                      borderRadius: "var(--r-pill)",
                      background: "rgba(212,175,55,.07)",
                      border: "1px solid rgba(212,175,55,.18)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--gold)",
                    }}
                  >
                    <Icon name="info" size={13} color="var(--gold)" />
                    {p.ml}
                  </div>
                )}
              </AccordionSection>
            )}

            {showUsageTips && (
              <AccordionSection
                title="Conseils d'utilisation"
                open={openSections.has("conseils")}
                onToggle={() => toggleSection("conseils")}
              >
                <StepsList steps={usageTips} />
              </AccordionSection>
            )}

            {extraSections.map((section) => (
              <AccordionSection
                key={section.id}
                title={section.title.trim() || "Informations"}
                open={openSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
              >
                <ExtraSectionBody section={section} />
              </AccordionSection>
            ))}
          </div>

          {/* ── Routine associée (cross-sell avant avis) ── */}
          {routine.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: 5,
                }}
              >
                Routine beauté
              </div>
              <h3
                style={{
                  margin: "0 0 14px",
                  fontWeight: 700,
                  fontSize: 17,
                  color: "var(--ink)",
                }}
              >
                Complétez votre rituel
              </h3>
              <HorizontalProductCarousel fillColumns={2} bleed={false}>
                {routine.map((r) => (
                  <ProductCard
                    key={r.id}
                    p={r}
                    onOpen={openProduct}
                    onFav={(id) => toggleFav(id)}
                    isFav={favs.includes(r.id)}
                    onAdd={(pr) => {
                      addToCart(pr, 1, pr.variants[0]);
                      showToast(`${pr.name} ajouté ✨`);
                    }}
                  />
                ))}
              </HorizontalProductCarousel>
            </div>
          )}

          {/* ── Vous aimerez aussi ── */}
          {related.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <h3
                style={{
                  margin: "0 0 14px",
                  fontWeight: 600,
                  fontSize: 17,
                  color: "var(--ink)",
                }}
              >
                Vous aimerez aussi
              </h3>
              <HorizontalProductCarousel fillColumns={2} bleed={false}>
                {related.map((r) => (
                  <ProductCard
                    key={r.id}
                    p={r}
                    onOpen={openProduct}
                    onFav={(id) => toggleFav(id)}
                    isFav={favs.includes(r.id)}
                    onAdd={(pr) => {
                      addToCart(pr, 1, pr.variants[0]);
                      showToast(`${pr.name} ajouté ✨`);
                    }}
                  />
                ))}
              </HorizontalProductCarousel>
            </div>
          )}

          <ProductDeliveryTrustBlock />

          <ProductBeforeAfterSection productId={p.id} />

          <ProductReviewsSection
            productId={p.id}
            fallbackRating={p.rating}
            fallbackCount={p.reviews}
            sectionId="product-reviews"
          />

        </div>
      </div>

      {/* ── Sticky add bar ── */}
      <div className="bottom-action-bar">
        <ProductSalesCounter productId={p.id} />
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={`pd-cta-btn${outOfStock ? " pd-cta-btn--disabled" : added ? " pd-cta-btn--success" : " pd-cta-btn--pink"}`}
        >
          {outOfStock ? (
            "Rupture de stock"
          ) : added ? (
            <>
              <Icon name="check" size={16} color="#fff" stroke={2.5} />
              Ajouté au panier !
            </>
          ) : (
            <>
              <Icon name="bag" size={16} />
              Ajouter au panier
              <span style={{ opacity: 0.55, fontWeight: 600 }}>•</span>
              {totalPrice} €
            </>
          )}
        </button>
        <ProductTrustBadges />
      </div>
    </div>
  );
}
