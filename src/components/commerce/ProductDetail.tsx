"use client";
/**
 * LN COS — Product detail screen (premium edition)
 * Full immersive overlay: gallery, variant pills, qty stepper,
 * expandable editorial accordions, routine carousel, sticky CTA.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Icon } from "@/components/shared/Icon";
import { MobileBackButton } from "@/components/shared/ActionButtons";
import { useStore } from "@/lib/store";
import { canNavigateProductBack } from "@/lib/product-navigation";
import { usePublicProducts } from "@/lib/client-supabase";
import {
  buildProductGallery,
  effectivePrice,
  effectiveSku,
  effectiveStock,
  findVariantByName,
  variantLabels,
} from "@/lib/product-catalog";
import {
  DEFAULT_SECTION_TOGGLES,
  normalizeExtraSections,
  normalizeSectionToggles,
  type ProductExtraSection,
} from "@/lib/product-sections";
import type { Product } from "@/lib/data";
import {
  blocksByZone,
  useProductPageLayoutPublic,
} from "@/lib/product-page-builder";
import {
  ProductPageBlockView,
  ProductPageStickyBlockView,
  type ProductPageRenderCtx,
} from "@/components/commerce/ProductPageBlocks";

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
  const showVariants = sectionToggles.variants && labels.length > 0;
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
  const productReturn = useStore((s) =>
    s.overlay?.type === "product" ? s.overlay.productReturn : undefined
  );
  const showBackButton = canNavigateProductBack(productReturn);
  const showToast = useStore((s) => s.showToast);

  const { blocks: layoutBlocks } = useProductPageLayoutPublic();
  const mainBlocks = useMemo(() => blocksByZone(layoutBlocks, "main"), [layoutBlocks]);
  const stickyBlocks = useMemo(() => blocksByZone(layoutBlocks, "sticky"), [layoutBlocks]);
  const galleryBlocks = useMemo(
    () => mainBlocks.filter((b) => b.type === "gallery"),
    [mainBlocks]
  );
  const contentBlocks = useMemo(
    () => mainBlocks.filter((b) => b.type !== "gallery"),
    [mainBlocks]
  );

  const displayPrice = effectivePrice(p, selectedVariant);
  const displayStock = effectiveStock(p, selectedVariant);
  const displaySku = effectiveSku(p, selectedVariant);
  const showReference = sectionToggles.reference && Boolean(displaySku);
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

  const renderCtx = useMemo((): ProductPageRenderCtx => ({
    product: p,
    galleryRef,
    gallery,
    activeImg,
    setGalleryIndex,
    displayPrice,
    displayStock,
    displaySku,
    totalPrice: Number(totalPrice),
    outOfStock,
    lowStock,
    added,
    qty,
    setQty,
    selectedVariantName,
    setSelectedVariantName,
    showVariants,
    showReference,
    showBenefits,
    showDescription,
    showUsageTips,
    benefitLines,
    usageTips,
    extraSections,
    openSections,
    toggleSection,
    scrollToReviews,
    isBestSeller: Boolean(isBestSeller),
    routine,
    related,
    favs,
    openProduct,
    toggleFav,
    addToCart,
    showToast,
    handleAdd,
    AccordionSection,
    StepsList,
    BulletList,
    ExtraSectionBody,
  }), [
    p, gallery, activeImg, setGalleryIndex, displayPrice, displayStock, displaySku,
    totalPrice, outOfStock, lowStock, added, qty, selectedVariantName, showVariants,
    showReference, showBenefits, showDescription, showUsageTips, benefitLines, usageTips,
    extraSections, openSections, scrollToReviews, isBestSeller, routine, related, favs,
    openProduct, toggleFav, addToCart, showToast, handleAdd,
  ]);

  return (
    <div className="pd-overlay">
      <div className="pd-overlay__handle" aria-hidden />

      {/* ── Header produit — retour toujours visible ; actions droite au scroll ── */}
      <div className="pd-overlay__header pd-float-controls">
        {showBackButton && (
          <MobileBackButton onClick={onClose} floating aria-label="Retour" />
        )}

        <div
          className={`pd-float-actions${galleryInView ? "" : " is-hidden"}`}
          style={{ display: "flex", gap: 10, marginLeft: "auto" }}
        >
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
      <div ref={scrollRef} className="pd-overlay__scroll noscroll">
        {galleryBlocks.map((block) => (
          <ProductPageBlockView key={block.id} block={block} ctx={renderCtx} padded={false} />
        ))}
        <div style={{ padding: "0 18px" }}>
          {contentBlocks.map((block) => (
            <ProductPageBlockView key={block.id} block={block} ctx={renderCtx} padded />
          ))}
        </div>
      </div>

      {/* ── Sticky CTA + réassurance (layout global) ── */}
      {stickyBlocks.length > 0 && (
        <div className="bottom-action-bar bottom-action-bar--product">
          {stickyBlocks.map((block) => (
            <ProductPageStickyBlockView key={block.id} block={block} ctx={renderCtx} />
          ))}
        </div>
      )}
    </div>
  );
}
