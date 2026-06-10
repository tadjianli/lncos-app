"use client";
/**
 * LN COS — Product listing screen (from handoff screens-discover.jsx ListingScreen)
 */

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { SubHeader } from "@/components/shared/ActionButtons";
import { ProductCard } from "@/components/shared/ProductCard";
import { useStore } from "@/lib/store";
import { usePublicProducts } from "@/lib/client-supabase";
import type { Category } from "@/lib/store";

interface ListingScreenProps {
  category: Category | null;
  onClose: () => void;
}

const SUBS = ["Tous", "Sérums", "Crèmes", "Nettoyants", "Masques"];
const FILTERS = ["Prix ↑", "Mieux notés", "Nouveautés", "Promotions"];

export function ListingScreen({ category, onClose }: ListingScreenProps) {
  const [sub, setSub] = useState("Tous");
  const [showFilter, setShowFilter] = useState(false);

  const { products } = usePublicProducts();
  const openProduct = useStore((s) => s.openProduct);
  const addToCart   = useStore((s) => s.addToCart);
  const toggleFav   = useStore((s) => s.toggleFav);
  const favs        = useStore((s) => s.favs);

  const list = category
    ? products.filter((p) => p.cat === category.id)
    : products;

  const title = category ? category.name : "Tous les produits";

  return (
    <div className="overlay-screen" style={{ animation: "slideUp .3s cubic-bezier(.2,.8,.2,1) both" }}>
      <div style={{ flex: "0 0 auto" }}>
        <SubHeader
          title={title}
          onBack={onClose}
          safeArea
          right={
            <button
              type="button"
              onClick={() => setShowFilter((f) => !f)}
              className="mobile-screen-header__back"
              style={{ background: "transparent", border: "none" }}
              aria-label="Filtrer"
            >
              <Icon name="filter" size={20} />
            </button>
          }
        />

        {/* Sub-category chips */}
        <div
          className="noscroll"
          style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 12px" }}
        >
          {SUBS.map((s) => (
            <button
              key={s}
              onClick={() => setSub(s)}
              style={{
                flex: "0 0 auto",
                padding: "8px 16px",
                borderRadius: "var(--r-pill)",
                fontSize: 12.5,
                fontWeight: 600,
                background: sub === s ? "var(--gold-grad)" : "var(--charcoal)",
                color: sub === s ? "#1a1306" : "var(--ink-soft)",
                border: sub === s ? "none" : "1px solid rgba(255,255,255,.06)",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Filter chips */}
        {showFilter && (
          <div
            style={{
              padding: "0 16px 12px",
              display: "flex",
              gap: 8,
              animation: "fadeUp .3s ease both",
              flexWrap: "wrap",
            }}
          >
            {FILTERS.map((f) => (
              <span
                key={f}
                style={{
                  padding: "7px 13px",
                  borderRadius: "var(--r-pill)",
                  background: "var(--charcoal-2)",
                  color: "var(--ink-soft)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  border: "1px solid rgba(212,175,55,.18)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        className="noscroll"
        style={{ flex: "1 1 auto", overflowY: "auto", padding: "4px 16px 24px" }}
      >
        <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginBottom: 14 }}>
          {list.length} produit{list.length > 1 ? "s" : ""}
        </div>
        <div className="prodbento">
          {list.map((p, i) => (
            <div key={p.id + i} className="prodbento-cell" style={{ animation: `fadeUp .5s ease ${Math.min(i, 6) * 0.05}s both` }}>
              <ProductCard
                p={p}
                onOpen={openProduct}
                onFav={toggleFav}
                isFav={favs.includes(p.id)}
                onAdd={addToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
