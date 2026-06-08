"use client";
/**
 * LN COS — Product detail screen (premium edition)
 * Full-screen overlay with editorial content blocks, luxury variant pills,
 * routine carousel, and animated add-to-cart bar.
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

/* ─── static editorial data per product ──────────────────────────── */
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

/* ─── component ──────────────────────────────────────────────────── */
export function ProductDetail({ product: p, onClose }: ProductDetailProps) {
  const [variant, setVariant]     = useState(p.variants[0]);
  const [qty, setQty]             = useState(1);
  const [imgZoomed, setImgZoomed] = useState(false);
  const [added, setAdded]         = useState(false);

  const addToCart  = useStore((s) => s.addToCart);
  const toggleFav  = useStore((s) => s.toggleFav);
  const isFavFn    = useStore((s) => s.isFav);
  const openProduct = useStore((s) => s.openProduct);
  const showToast  = useStore((s) => s.showToast);

  const fav      = isFavFn(p.id);
  const lowStock = p.stock <= 20;

  const related = products
    .filter((x) => x.cat === p.cat && x.id !== p.id)
    .concat(products.filter((x) => x.cat !== p.cat))
    .slice(0, 4);

  /* routine = same category products (for "Complétez votre rituel") */
  const routine = products
    .filter((x) => x.cat === p.cat && x.id !== p.id)
    .slice(0, 4);

  const handleAdd = useCallback(() => {
    if (added) return;
    addToCart(p, qty, variant);
    showToast(`${p.name} ajouté ✨`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }, [added, addToCart, p, qty, variant, showToast]);

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
      {/* ── Drag handle ── */}
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
          <button
            onClick={() => toggleFav(p.id)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(10px)",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,.15)",
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
        style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", paddingBottom: 80 }}
      >
        {/* ── Hero image ── */}
        <div
          onClick={() => setImgZoomed((z) => !z)}
          style={{
            height: 360,
            position: "relative",
            overflow: "hidden",
            background:
              "radial-gradient(120% 100% at 50% 30%, #2c2228 0%, #14100f 75%)",
            cursor: "zoom-in",
            willChange: "transform",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transition: "transform 0.35s var(--ease-lux,cubic-bezier(.22,.68,0,1))",
              transform: imgZoomed ? "scale(1.05)" : "scale(1)",
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

          {/* luxury gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,.1) 0%, transparent 40%, rgba(0,0,0,.6) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* product tag badge */}
          {p.tag && (
            <span
              style={{
                position: "absolute",
                top: 110,
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
        </div>

        {/* ── Content ── */}
        <div style={{ padding: "20px 18px 0" }}>

          {/* gold decorative hairline */}
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

          {/* Rating row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "11px 0 14px",
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              {[0, 1, 2, 3, 4].map((s) => (
                <Icon
                  key={s}
                  name="star"
                  size={15}
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
              gap: 11,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>
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
                  -{Math.round((1 - p.price / p.old) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Stock badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 18,
            }}
          >
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
                  letterSpacing: ".02em",
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
              <>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#7BC99A",
                  }}
                />
                <span style={{ fontSize: 12, color: "#7BC99A", fontWeight: 600 }}>
                  En stock
                </span>
              </>
            )}
          </div>

          {/* Short description */}
          <p
            style={{
              fontSize: 13.5,
              color: "var(--ink-soft)",
              lineHeight: 1.65,
              margin: "0 0 24px",
            }}
          >
            {p.desc}
          </p>

          {/* ── Editorial: Formule block ── */}
          <div
            style={{
              background: "var(--charcoal)",
              borderRadius: "var(--r-md)",
              borderLeft: "3px solid var(--gold)",
              padding: "16px 18px",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 10,
              }}
            >
              Formule
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {p.ingredients.map((ing) => (
                <li
                  key={ing}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
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
                    }}
                  />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Editorial: Rituel d'application ── */}
          <div
            style={{
              background: "var(--charcoal)",
              borderRadius: "var(--r-md)",
              padding: "16px 18px",
              marginBottom: 14,
              border: "1px solid rgba(255,255,255,.04)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 12,
              }}
            >
              Rituel d&apos;application
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {RITUAL_STEPS.map((step, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--gold-grad)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#1a1306",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--ink-soft)",
                      lineHeight: 1.55,
                      flex: 1,
                    }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── Editorial: Engagements ── */}
          <div
            style={{
              background: "var(--charcoal)",
              borderRadius: "var(--r-md)",
              padding: "16px 18px",
              marginBottom: 22,
              border: "1px solid rgba(255,255,255,.04)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 14,
              }}
            >
              Engagements
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                gap: 8,
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
                      width: 42,
                      height: 42,
                      borderRadius: "var(--r-sm)",
                      background: "rgba(212,175,55,.1)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon name={c.icon as "sparkle" | "check" | "star"} size={20} color="var(--gold)" />
                  </span>
                  <span
                    style={{
                      fontSize: 11,
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
          </div>

          {/* ── Variant selector — premium pills ── */}
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
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
                        : "1px solid rgba(255,255,255,.08)",
                    boxShadow:
                      variant === v
                        ? "var(--glow-gold, 0 12px 30px -12px rgba(212,175,55,.55))"
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

          {/* ── Quantity stepper — luxury style ── */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: 11,
              }}
            >
              Quantité
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--charcoal-2)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--ink)",
                  border: qty > 1 ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,.08)",
                  cursor: "pointer",
                  transition: "border-color 0.22s",
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                  flexShrink: 0,
                }}
              >
                <Icon name="minus" size={16} />
              </button>
              <span
                style={{
                  minWidth: 28,
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--charcoal-2)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--ink)",
                  border: "1px solid rgba(255,255,255,.08)",
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

          {/* ── Delivery info ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 16,
              borderRadius: "var(--r-md)",
              background: "var(--charcoal)",
              marginBottom: 28,
              border: "1px solid rgba(255,255,255,.05)",
            }}
          >
            {[
              { i: "truck",   t: "Livraison offerte",      s: "dès 50 € · 2-3 jours ouvrés" },
              { i: "sparkle", t: "Échantillon offert",     s: "avec chaque commande" },
              { i: "clock",   t: "Retours sous 30 jours",  s: "satisfait ou remboursé" },
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
                  <Icon name={d.i as "truck" | "sparkle" | "clock"} size={19} color="var(--gold)" />
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

          {/* ── Routine associée section ── */}
          {routine.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              {/* eyebrow */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: 6,
                }}
              >
                Routine beauté
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 17,
                    color: "var(--ink)",
                  }}
                >
                  Complétez votre rituel
                </h3>
              </div>
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
                {routine.map((r) => (
                  <div key={r.id} style={{ flex: "0 0 150px" }}>
                    <ProductCard
                      p={r}
                      onOpen={openProduct}
                      onFav={(id) => toggleFav(id)}
                      isFav={isFavFn(r.id)}
                      onAdd={(pr) => {
                        addToCart(pr, 1, pr.variants[0]);
                        showToast(`${pr.name} ajouté ✨`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Related products ── */}
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                margin: "0 0 14px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: 17,
                  color: "var(--ink)",
                }}
              >
                Vous aimerez aussi
              </h3>
            </div>
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
                    style={{
                      height: 120,
                      position: "relative",
                      background: "#181818",
                    }}
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
                      }}
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
          borderTop: "1px solid rgba(212,175,55,.14)",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* price total */}
        <div style={{ flex: "0 0 auto" }}>
          <div
            style={{
              fontSize: 10.5,
              color: "var(--ink-mute)",
              fontWeight: 500,
              marginBottom: 2,
            }}
          >
            Total
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-.01em",
            }}
          >
            {totalPrice} €
          </div>
        </div>

        {/* add to cart button */}
        <button
          onClick={handleAdd}
          style={{
            flex: 1,
            height: 50,
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
            gap: 8,
            transition: "background 0.3s cubic-bezier(.22,.68,0,1), transform 0.15s",
            boxShadow: added
              ? "0 8px 20px -8px rgba(76,175,80,.5)"
              : "var(--glow-pink, 0 12px 30px -12px rgba(239,169,192,.7))",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            willChange: "transform",
          }}
        >
          {added ? (
            <>
              <Icon name="check" size={18} color="#fff" />
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
