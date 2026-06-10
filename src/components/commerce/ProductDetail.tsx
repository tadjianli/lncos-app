"use client";
/**
 * LN COS — Product detail screen (premium edition)
 * Full immersive overlay: gallery, variant pills, qty stepper,
 * expandable editorial accordions, routine carousel, sticky CTA.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { MobileBackButton } from "@/components/shared/ActionButtons";
import { HorizontalProductCarousel } from "@/components/carousels/HorizontalProductCarousel";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductReviewsSection } from "@/components/commerce/ProductReviewsSection";
import { ProductBeforeAfterSection } from "@/components/commerce/ProductBeforeAfterSection";
import {
  ProductLiveViewers,
  ProductSalesCounter,
  ProductStockAlert,
  ProductTrustBadges,
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
  normalizeCommitments,
  normalizeExtraSections,
  normalizeSectionToggles,
  visibleCommitments,
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
  const ingredientLines = useMemo(() => nonEmptyLines(p.ingredients), [p.ingredients]);
  const extraSections = useMemo(
    () => normalizeExtraSections(p.extraSections).filter((s) => s.enabled && extraSectionHasContent(s)),
    [p.extraSections]
  );
  const showDescription = sectionToggles.description && Boolean(p.desc?.trim());
  const showUsageTips = sectionToggles.usageTips && usageTips.length > 0;
  const showIngredients = sectionToggles.ingredients && ingredientLines.length > 0;
  const commitments = useMemo(
    () => visibleCommitments(normalizeCommitments(p.commitments)),
    [p.commitments]
  );
  const showCommitments = sectionToggles.commitments && commitments.length > 0;

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

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        zIndex: 80,
        animation: "sheetIn 0.42s cubic-bezier(0.22,0.68,0,1) both",
        willChange: "transform",
      }}
    >
      {/* ── Drag handle pill ── */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 36,
          height: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,.18)",
          zIndex: 40,
          pointerEvents: "none",
        }}
      />

      {/* ── Floating controls ── */}
      <div
        style={{
          position: "absolute",
          top: "var(--safe-header-top)",
          left: "max(16px, var(--safe-left))",
          right: "max(16px, var(--safe-right))",
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
        }}
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
          >
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div
        className="noscroll"
        style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", paddingBottom: 90 }}
      >

        <ProductGallery
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
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 12 }}>
            {p.cat} · {p.ml}
          </div>

          {/* Rating row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              {[0, 1, 2, 3, 4].map((s) => (
                <Icon
                  key={s}
                  name="star"
                  size={14}
                  color={s < Math.round(p.rating) ? "var(--gold)" : "var(--charcoal-3)"}
                  fill={s < Math.round(p.rating) ? "var(--gold)" : "var(--charcoal-3)"}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
              {p.rating}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>
              ({p.reviews} avis)
            </span>
          </div>

          <ProductLiveViewers productId={p.id} />
          <ProductStockAlert stock={displayStock} />

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

          {/* SKU */}
          {displaySku && (
            <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 12, letterSpacing: ".06em" }}>
              Réf. {displaySku}
            </div>
          )}

          {/* Stock indicator */}
          <div style={{ marginBottom: 22 }}>
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

            {showIngredients && (
              <AccordionSection
                title="Ingrédients"
                open={openSections.has("ingredients")}
                onToggle={() => toggleSection("ingredients")}
              >
                <BulletList items={ingredientLines} />
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    borderRadius: "var(--r-sm)",
                    background: "rgba(212,175,55,.04)",
                    border: "1px solid rgba(212,175,55,.1)",
                    fontSize: 11,
                    color: "var(--ink-mute)",
                    lineHeight: 1.5,
                  }}
                >
                  * Ingrédient d&apos;origine naturelle certifié. Liste non exhaustive.
                </div>
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

          {showCommitments && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                gap: 8,
                padding: "18px 0",
                marginBottom: 24,
                borderTop: "1px solid rgba(255,255,255,.07)",
                borderBottom: "1px solid rgba(255,255,255,.07)",
              }}
            >
              {commitments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "rgba(212,175,55,.08)",
                      border: "1px solid rgba(212,175,55,.15)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon name={c.icon} size={20} color="var(--gold)" />
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: "var(--ink-soft)",
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Delivery info ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "16px 16px",
              borderRadius: "var(--r-md)",
              background: "var(--charcoal)",
              marginBottom: 30,
              border: "1px solid rgba(255,255,255,.05)",
            }}
          >
            {[
              { i: "truck",   t: "Livraison offerte",     s: "dès 50 € · 2-3 jours ouvrés" },
              { i: "sparkle", t: "Échantillon offert",    s: "avec chaque commande" },
              { i: "clock",   t: "Retours sous 30 jours", s: "satisfait ou remboursé" },
            ].map((d) => (
              <div key={d.i} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: "rgba(212,175,55,.1)",
                    display: "grid",
                    placeItems: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <Icon
                    name={d.i as "truck" | "sparkle" | "clock"}
                    size={18}
                    color="var(--gold)"
                  />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                    {d.t}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 1 }}>
                    {d.s}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ProductReviewsSection
            productId={p.id}
            fallbackRating={p.rating}
            fallbackCount={p.reviews}
          />

          <ProductBeforeAfterSection productId={p.id} />

          {/* ── Routine associée ── */}
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
              <HorizontalProductCarousel premium>
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
              <HorizontalProductCarousel premium>
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

        </div>
      </div>

      {/* ── Sticky add bar ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
          background: "rgba(10,10,10,.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(212,175,55,.14)",
        }}
      >
        <ProductSalesCounter productId={p.id} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* Price total */}
        <div style={{ flex: "0 0 auto" }}>
          <div
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              fontWeight: 500,
              marginBottom: 2,
              letterSpacing: ".04em",
            }}
          >
            TOTAL
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-.01em",
            }}
          >
            {totalPrice} €
          </div>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          style={{
            flex: 1,
            height: 52,
            borderRadius: "var(--r-pill)",
            background: outOfStock
              ? "rgba(255,255,255,.08)"
              : added
                ? "linear-gradient(135deg,#4CAF50,#388E3C)"
                : "var(--pink-grad)",
            color: outOfStock ? "var(--ink-mute)" : added ? "#fff" : "#3a1020",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: ".02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            transition: "background 0.3s cubic-bezier(.22,.68,0,1)",
            boxShadow: outOfStock
              ? "none"
              : added
                ? "0 8px 20px -8px rgba(76,175,80,.5)"
                : "0 12px 30px -12px rgba(239,169,192,.7)",
            cursor: outOfStock ? "not-allowed" : "pointer",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            willChange: "background",
            opacity: outOfStock ? 0.7 : 1,
          }}
        >
          {outOfStock ? (
            "Rupture de stock"
          ) : added ? (
            <>
              <Icon name="check" size={18} color="#fff" stroke={2.5} />
              Ajouté !
            </>
          ) : (
            <>
              <Icon name="bag" size={18} />
              Ajouter au panier
            </>
          )}
        </button>
        </div>
        <ProductTrustBadges />
      </div>
    </div>
  );
}
