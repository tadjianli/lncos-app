"use client";
/**
 * LN COS — Product detail screen (premium edition)
 * Full immersive overlay: gallery, variant pills, qty stepper,
 * expandable editorial accordions, routine carousel, sticky CTA.
 */

import { useState, useCallback } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { ProductCard } from "@/components/shared/ProductCard";
import { useStore } from "@/lib/store";
import { products } from "@/lib/data";
import type { Product } from "@/lib/data";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

/* ─── Editorial content (per-product in prod; static for demo) ─── */

const RITUAL_STEPS = [
  "Appliquez sur peau propre et sèche, le matin et/ou le soir.",
  "Tapotez délicatement du bout des doigts jusqu'à absorption complète.",
  "Suivez d'une crème hydratante pour sceller les actifs.",
];

const COMMITMENTS = [
  { icon: "sparkle", label: "Vegan" },
  { icon: "check",   label: "Made in France" },
  { icon: "star",    label: "Dermatologiquement testé" },
];

/* Gallery: 4 mock angles (all use the same image for demo) */
const GALLERY_COUNT = 4;

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

export function ProductDetail({ product: p, onClose }: ProductDetailProps) {
  const [activeImg, setActiveImg]     = useState(0);
  const [variant, setVariant]         = useState(p.variants[0]);
  const [qty, setQty]                 = useState(1);
  const [imgZoomed, setImgZoomed]     = useState(false);
  const [added, setAdded]             = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(["description"])
  );

  const addToCart   = useStore((s) => s.addToCart);
  const toggleFav   = useStore((s) => s.toggleFav);
  const isFavFn     = useStore((s) => s.isFav);
  const openProduct = useStore((s) => s.openProduct);
  const showToast   = useStore((s) => s.showToast);

  const fav      = isFavFn(p.id);
  const lowStock = p.stock <= 20;

  const routine = products
    .filter((x) => x.cat === p.cat && x.id !== p.id)
    .slice(0, 5);

  const related = products
    .filter((x) => x.cat !== p.cat)
    .slice(0, 4);

  const handleAdd = useCallback(() => {
    if (added) return;
    addToCart(p, qty, variant);
    showToast(`${p.name} ajouté ✨`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }, [added, addToCart, p, qty, variant, showToast]);

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const totalPrice = (p.price * qty).toFixed(2);

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
          top: 52,
          left: 16,
          right: 16,
          zIndex: 30,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,.4)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.15)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            cursor: "pointer",
          }}
        >
          <Icon name="chevL" size={21} />
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          {/* Floating favourite button */}
          <button
            onClick={() => toggleFav(p.id)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: fav
                ? "rgba(247,198,215,.25)"
                : "rgba(0,0,0,.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "grid",
              placeItems: "center",
              border: fav
                ? "1px solid rgba(247,198,215,.5)"
                : "1px solid rgba(255,255,255,.15)",
              transition: "background 0.22s, border-color 0.22s",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              cursor: "pointer",
            }}
          >
            <Icon
              name="heart"
              size={20}
              color={fav ? "var(--pink)" : "#fff"}
              fill={fav ? "var(--pink)" : "none"}
            />
          </button>

          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.15)",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              cursor: "pointer",
            }}
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

        {/* ── Hero image ── */}
        <div
          onClick={() => setImgZoomed((z) => !z)}
          style={{
            height: 340,
            position: "relative",
            overflow: "hidden",
            background: "radial-gradient(120% 100% at 50% 30%, #2c2228 0%, #14100f 75%)",
            cursor: "zoom-in",
            willChange: "transform",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transition: "transform 0.35s cubic-bezier(.22,.68,0,1)",
              transform: imgZoomed ? "scale(1.06)" : "scale(1)",
              willChange: "transform",
            }}
          >
            <FadeImage
              src={`/assets/products/${p.id}.png`}
              alt={p.name}
              fill
              sizes="480px"
              style={{ objectFit: "cover" }}
              fallbackLabel={p.name}
              priority
            />
          </div>

          {/* Luxury gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,.08) 0%, transparent 35%, rgba(0,0,0,.55) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Product tag badge */}
          {p.tag && (
            <span
              style={{
                position: "absolute",
                top: 108,
                left: 16,
                padding: "5px 12px",
                borderRadius: "var(--r-pill)",
                background: ["Flash", "Édition limitée"].includes(p.tag ?? "")
                  ? "var(--gold-grad)"
                  : "var(--pink-grad)",
                color: "#3a1020",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                pointerEvents: "none",
              }}
            >
              {p.tag}
            </span>
          )}

          {/* Zoom hint */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 14,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: "var(--r-pill)",
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,.7)",
              pointerEvents: "none",
            }}
          >
            <Icon name="search" size={11} color="rgba(255,255,255,.7)" />
            Zoom
          </div>
        </div>

        {/* ── Gallery thumbnails ── */}
        <div
          className="noscroll"
          style={{
            display: "flex",
            gap: 9,
            padding: "12px 18px",
            overflowX: "auto",
            background: "var(--charcoal)",
            borderBottom: "1px solid rgba(255,255,255,.05)",
          }}
        >
          {Array.from({ length: GALLERY_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              style={{
                width: 62,
                height: 62,
                borderRadius: 12,
                flex: "0 0 62px",
                overflow: "hidden",
                position: "relative",
                background: "#181818",
                border: activeImg === i
                  ? "2px solid var(--gold)"
                  : "2px solid rgba(255,255,255,.07)",
                transition: "border-color 0.2s",
                padding: 0,
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                cursor: "pointer",
                boxShadow: activeImg === i
                  ? "0 0 0 2px rgba(212,175,55,.2)"
                  : "none",
              }}
            >
              <FadeImage
                src={`/assets/products/${p.id}.png`}
                alt={`${p.name} vue ${i + 1}`}
                fill
                sizes="62px"
                style={{
                  objectFit: "cover",
                  opacity: activeImg === i ? 1 : 0.55,
                  transition: "opacity 0.2s",
                  filter: i === 0 ? "none"
                    : i === 1 ? "hue-rotate(8deg) brightness(1.05)"
                    : i === 2 ? "saturate(0.7) brightness(1.1)"
                    : "contrast(1.08) brightness(0.95)",
                }}
              />
              {activeImg === i && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 10,
                    background: "rgba(212,175,55,.1)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </button>
          ))}

          {/* "Voir en AR" mock pill */}
          <button
            style={{
              height: 62,
              borderRadius: 12,
              flex: "0 0 auto",
              padding: "0 14px",
              background: "rgba(212,175,55,.06)",
              border: "1.5px dashed rgba(212,175,55,.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              cursor: "pointer",
            }}
          >
            <Icon name="sparkle" size={16} color="var(--gold)" />
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--gold)", letterSpacing: ".06em", whiteSpace: "nowrap" }}>
              AR
            </span>
          </button>
        </div>

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
              {p.price.toFixed(2)} €
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
                  −{Math.round((1 - p.price / p.old) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Stock indicator */}
          <div style={{ marginBottom: 22 }}>
            {lowStock ? (
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
                Plus que {p.stock} en stock
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

          {/* ── Variant selector — premium pills ── */}
          <div style={{ marginBottom: 22 }}>
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
              Contenance
            </div>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {p.variants.map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "var(--r-pill)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.22s cubic-bezier(.22,.68,0,1)",
                    willChange: "transform, box-shadow",
                    background:
                      variant === v
                        ? "var(--gold-grad)"
                        : "rgba(255,255,255,.04)",
                    color: variant === v ? "#1a1306" : "var(--ink-soft)",
                    border:
                      variant === v
                        ? "none"
                        : "1px solid rgba(255,255,255,.1)",
                    boxShadow:
                      variant === v
                        ? "0 8px 24px -10px rgba(212,175,55,.6)"
                        : "none",
                    WebkitTapHighlightColor: "transparent",
                    touchAction: "manipulation",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

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
            {/* Description */}
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

            {/* Conseils d'utilisation */}
            <AccordionSection
              title="Conseils d'utilisation"
              open={openSections.has("conseils")}
              onToggle={() => toggleSection("conseils")}
            >
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
                {RITUAL_STEPS.map((step, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", alignItems: "flex-start", gap: 13 }}
                  >
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
                    <span
                      style={{
                        fontSize: 13.5,
                        color: "var(--ink-soft)",
                        lineHeight: 1.6,
                        flex: 1,
                      }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </AccordionSection>

            {/* Ingrédients */}
            <AccordionSection
              title="Ingrédients"
              open={openSections.has("ingredients")}
              onToggle={() => toggleSection("ingredients")}
            >
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
                {p.ingredients.map((ing) => (
                  <li
                    key={ing}
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
                    {ing}
                  </li>
                ))}
              </ul>
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
          </div>

          {/* ── Engagements (brand promise — always visible) ── */}
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
            {COMMITMENTS.map((c) => (
              <div
                key={c.label}
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
                  <Icon
                    name={c.icon as "sparkle" | "check" | "star"}
                    size={20}
                    color="var(--gold)"
                  />
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
              <div className="scroll-row scroll-row--bleed noscroll" style={{ paddingBottom: 4 }}>
                {routine.map((r) => (
                  <ProductCard
                      key={r.id}
                      p={r}
                      onOpen={openProduct}
                      onFav={(id) => toggleFav(id)}
                      isFav={isFavFn(r.id)}
                      onAdd={(pr) => {
                        addToCart(pr, 1, pr.variants[0]);
                        showToast(`${pr.name} ajouté ✨`);
                      }}
                    />
                ))}
              </div>
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
              <div
                className="noscroll"
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "auto",
                  paddingBottom: 4,
                  marginLeft: -18,
                  marginRight: -18,
                  paddingLeft: 18,
                  paddingRight: 18,
                }}
              >
                {related.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openProduct(r)}
                    style={{
                      flex: "0 0 120px",
                      background: "var(--charcoal)",
                      borderRadius: "var(--r-md)",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,.05)",
                      textAlign: "left",
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{ height: 120, position: "relative", background: "#181818" }}
                    >
                      <FadeImage
                        src={`/assets/products/${r.id}.png`}
                        alt={r.name}
                        fill
                        sizes="120px"
                        style={{ objectFit: "cover" }}
                        fallbackLabel={r.name}
                      />
                    </div>
                    <div style={{ padding: "10px 10px 12px" }}>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "var(--ink)",
                          lineHeight: 1.3,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        } as React.CSSProperties}
                      >
                        {r.name}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--ink)",
                          marginTop: 6,
                        }}
                      >
                        {r.price.toFixed(2)} €
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
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
          style={{
            flex: 1,
            height: 52,
            borderRadius: "var(--r-pill)",
            background: added
              ? "linear-gradient(135deg,#4CAF50,#388E3C)"
              : "var(--pink-grad)",
            color: added ? "#fff" : "#3a1020",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: ".02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            transition: "background 0.3s cubic-bezier(.22,.68,0,1)",
            boxShadow: added
              ? "0 8px 20px -8px rgba(76,175,80,.5)"
              : "0 12px 30px -12px rgba(239,169,192,.7)",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            willChange: "background",
          }}
        >
          {added ? (
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
    </div>
  );
}
