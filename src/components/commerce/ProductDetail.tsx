"use client";
/**
 * LN COS — Product detail screen (from handoff screens-product.jsx)
 * Renders as a full-screen overlay with slide-up animation.
 */

import { useState, useCallback } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { PinkBtn } from "@/components/shared/ActionButtons";
import { useStore } from "@/lib/store";
import { products } from "@/lib/data";
import type { Product } from "@/lib/data";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetail({ product: p, onClose }: ProductDetailProps) {
  const [variant, setVariant] = useState(p.variants[0]);
  const [qty, setQty] = useState(1);

  const addToCart = useStore((s) => s.addToCart);
  const toggleFav = useStore((s) => s.toggleFav);
  const isFavFn = useStore((s) => s.isFav);
  const openProduct = useStore((s) => s.openProduct);
  const fav = isFavFn(p.id);
  const lowStock = p.stock <= 20;

  const related = products
    .filter((x) => x.cat === p.cat && x.id !== p.id)
    .concat(products.filter((x) => x.cat !== p.cat))
    .slice(0, 4);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        zIndex: 80,
        /* Spring-like sheet entry — lux ease with slight overshoot feel */
        animation: "sheetIn 0.42s cubic-bezier(0.22, 0.68, 0, 1) both",
      }}
    >
      {/* Floating controls */}
      <div
        style={{
          position: "absolute",
          top: 56,
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
            background: "rgba(0,0,0,.5)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.1)",
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
              background: "rgba(0,0,0,.5)",
              backdropFilter: "blur(8px)",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <Icon name="heart" size={20} color={fav ? "var(--pink)" : "#fff"} fill={fav ? "var(--pink)" : "none"} />
          </button>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(0,0,0,.5)",
              backdropFilter: "blur(8px)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", paddingBottom: 100 }}>
        {/* Gallery */}
        <div
          style={{
            height: 360,
            position: "relative",
            overflow: "hidden",
            background: "radial-gradient(120% 100% at 50% 30%, #2c2228 0%, #14100f 75%)",
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

        {/* Content */}
        <div style={{ padding: "20px 18px 0" }}>
          <h1
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 25,
              color: "var(--ink)",
              lineHeight: 1.15,
            }}
          >
            {p.name}
          </h1>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "11px 0 14px" }}>
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
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{p.rating}</span>
            <span style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>({p.reviews} avis)</span>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 11, marginBottom: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>
              {p.price.toFixed(2)} €
            </span>
            {p.old && (
              <>
                <span style={{ fontSize: 16, color: "var(--ink-mute)", textDecoration: "line-through" }}>
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

          {/* Stock */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: lowStock ? "var(--gold)" : "#7BC99A",
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: lowStock ? "var(--gold)" : "#7BC99A",
                fontWeight: 600,
              }}
            >
              {lowStock ? `Plus que ${p.stock} en stock` : "En stock"}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 22px" }}>
            {p.desc}
          </p>

          {/* Variants */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 11 }}>
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
                    background: variant === v ? "rgba(212,175,55,.12)" : "var(--charcoal)",
                    color: variant === v ? "var(--gold)" : "var(--ink-soft)",
                    border: variant === v
                      ? "1.5px solid var(--gold)"
                      : "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: 11,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Icon name="sparkle" size={16} color="var(--gold)" /> Ingrédients clés
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {p.ingredients.map((ing) => (
                <span
                  key={ing}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "var(--r-pill)",
                    background: "var(--pink-light)",
                    color: "#9C5A74",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 16,
              borderRadius: "var(--r-md)",
              background: "var(--charcoal)",
              marginBottom: 24,
              border: "1px solid rgba(255,255,255,.05)",
            }}
          >
            {[
              { i: "truck",   t: "Livraison offerte",   s: "dès 50 € · 2-3 jours ouvrés" },
              { i: "sparkle", t: "Échantillon offert",  s: "avec chaque commande" },
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
                  <Icon name={d.i} size={19} color="var(--gold)" />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{d.t}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 1 }}>{d.s}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Related */}
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                margin: "0 0 14px",
              }}
            >
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: "var(--fs-h3)", color: "var(--ink)" }}>
                Vous aimerez aussi
              </h3>
            </div>
            <div
              className="noscroll"
              style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}
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
                  }}
                >
                  <div style={{ height: 120, position: "relative", background: "#181818" }}>
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
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginTop: 6 }}>
                      {r.price.toFixed(2)} €
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky add bar */}
      <div
        style={{
          flex: "0 0 auto",
          padding: "12px 16px 26px",
          background: "rgba(10,10,10,.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(212,175,55,.14)",
          display: "flex",
          gap: 11,
          alignItems: "center",
        }}
      >
        {/* Qty controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--charcoal)",
            borderRadius: "var(--r-pill)",
            padding: 4,
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              color: "var(--ink)",
            }}
          >
            <Icon name="minus" size={16} />
          </button>
          <span
            style={{
              minWidth: 22,
              textAlign: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--ink)",
            }}
          >
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              color: "var(--ink)",
            }}
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
        <PinkBtn
          icon="bag"
          onClick={() => addToCart(p, qty, variant)}
          style={{ flex: 1 }}
        >
          Ajouter au panier
        </PinkBtn>
      </div>
    </div>
  );
}
