"use client";
/**
 * LN COS — Search screen (from handoff screens-discover.jsx SearchScreen)
 */

import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/shared/Icon";
import { ProductCard } from "@/components/shared/ProductCard";
import { useStore } from "@/lib/store";
import { products } from "@/lib/data";

const TRENDING = ["Sérum éclat", "Rouge à lèvres", "Parfum oud", "Crème hydratante", "Coffret cadeau", "Masque argile"];
const RECENT_KEY = "lncos-recent-searches";

interface SearchScreenProps {
  onClose: () => void;
}

export function SearchScreen({ onClose }: SearchScreenProps) {
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const openProduct = useStore((s) => s.openProduct);
  const addToCart   = useStore((s) => s.addToCart);
  const toggleFav   = useStore((s) => s.toggleFav);
  const isFav       = useStore((s) => s.isFav);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setRecents(saved);
    } catch {}
  }, []);

  function saveRecent(term: string) {
    const updated = [term, ...recents.filter((r) => r !== term)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }

  function handleSearch(term: string) {
    setQ(term);
    if (term.trim()) saveRecent(term.trim());
  }

  const results = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.cat.includes(q.toLowerCase())
      )
    : [];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        zIndex: 80,
        animation: "fadeIn .2s ease both",
      }}
    >
      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "54px 16px 14px",
          flex: "0 0 auto",
        }}
      >
        <button onClick={onClose} style={{ color: "var(--ink)" }}>
          <Icon name="chevL" size={22} />
        </button>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--charcoal)",
            borderRadius: "var(--r-pill)",
            padding: "11px 16px",
            border: "1px solid rgba(212,175,55,.25)",
          }}
        >
          <Icon name="search" size={18} color="var(--ink-soft)" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher…"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--ink)",
              fontSize: 14,
            }}
          />
          {q && (
            <button onClick={() => setQ("")} style={{ color: "var(--ink-mute)" }}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "4px 16px 24px" }}>
        {!q ? (
          <>
            {/* Recent searches */}
            {recents.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--ink-soft)",
                    marginBottom: 13,
                    letterSpacing: ".04em",
                  }}
                >
                  RÉCENT
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                  {recents.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleSearch(r)}
                      style={{
                        padding: "9px 15px",
                        borderRadius: "var(--r-pill)",
                        background: "var(--charcoal)",
                        color: "var(--ink-soft)",
                        fontSize: 12.5,
                        border: "1px solid rgba(255,255,255,.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Icon name="clock" size={13} color="var(--ink-mute)" />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 13, letterSpacing: ".04em" }}>
              RECHERCHES TENDANCE
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 26 }}>
              {TRENDING.map((t) => (
                <button
                  key={t}
                  onClick={() => handleSearch(t)}
                  style={{
                    padding: "9px 15px",
                    borderRadius: "var(--r-pill)",
                    background: "var(--charcoal)",
                    color: "var(--ink-soft)",
                    fontSize: 12.5,
                    border: "1px solid rgba(255,255,255,.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon name="flame" size={13} color="var(--gold)" />
                  {t}
                </button>
              ))}
            </div>

            {/* Suggestions */}
            <div style={{ fontWeight: 600, fontSize: "var(--fs-h3)", color: "var(--ink)", marginBottom: 14 }}>
              Suggestions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {products.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  wide
                  onOpen={openProduct}
                  onFav={toggleFav}
                  isFav={isFav(p.id)}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 14 }}>
              {results.length} résultat{results.length > 1 ? "s" : ""} pour &ldquo;{q}&rdquo;
            </div>
            {results.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {results.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    wide
                    onOpen={openProduct}
                    onFav={toggleFav}
                    isFav={isFav(p.id)}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 0", color: "var(--ink-mute)", fontSize: 13 }}>
                Aucun produit trouvé
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
