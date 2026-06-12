"use client";
/**
 * LN COS — Search screen — premium overlay
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { MobileBackButton } from "@/components/shared/ActionButtons";
import { ProductGrid, productGridClassName } from "@/components/commerce/ProductGrid";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { useStore } from "@/lib/store";
import { usePublicProducts } from "@/lib/client-supabase";
import type { Product } from "@/lib/data";
import { SkeletonProductCard } from "@/components/shared/Skeleton";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const TRENDING = [
  "Sérum éclat",
  "Rouge à lèvres",
  "Parfum oud",
  "Crème hydratante",
  "Coffret cadeau",
  "Masque argile",
];

const CATEGORIES = [
  "Soins Visage",
  "Maquillage",
  "Parfums",
  "Corps",
  "Cheveux",
  "Coffrets",
];

const RECENT_KEY = "lncos-recent-searches";
const MAX_RECENTS = 6;
const DEBOUNCE_MS = 200;

/* ─── Highlight helper ───────────────────────────────────────────────────── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{ color: "var(--gold)", fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface SearchScreenProps {
  onClose: () => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function SearchScreen({ onClose }: SearchScreenProps) {
  const [q, setQ] = useState("");
  const [displayQ, setDisplayQ] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [results, setResults] = useState<Product[]>([]);

  const { products } = usePublicProducts();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Load recents + auto-focus */
  useEffect(() => {
    inputRef.current?.focus();
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(saved)) setRecents(saved.slice(0, MAX_RECENTS));
    } catch {}
  }, []);

  /* Save recent */
  const saveRecent = useCallback(
    (term: string) => {
      const updated = [term, ...recents.filter((r) => r !== term)].slice(0, MAX_RECENTS);
      setRecents(updated);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
    },
    [recents]
  );

  /* Remove one recent */
  function removeRecent(term: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = recents.filter((r) => r !== term);
    setRecents(updated);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
  }

  /* Clear all recents */
  function clearRecents() {
    setRecents([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  }

  /* Debounced search */
  const runSearch = useCallback((term: string) => {
    const t = term.toLowerCase().trim();
    if (!t) {
      setResults([]);
      setDisplayQ("");
      setIsSearching(false);
      return;
    }
    const found = products.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        p.cat.toLowerCase().includes(t) ||
        (p.desc && p.desc.toLowerCase().includes(t))
    );
    setResults(found);
    setDisplayQ(term.trim());
    setIsSearching(false);
  }, [products]);

  function handleInput(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim()) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        runSearch(value);
        if (value.trim()) saveRecent(value.trim());
      }, DEBOUNCE_MS);
    } else {
      setIsSearching(false);
      setResults([]);
      setDisplayQ("");
    }
  }

  function handleChipSearch(term: string) {
    setQ(term);
    runSearch(term);
    saveRecent(term);
  }

  function clearQuery() {
    setQ("");
    setDisplayQ("");
    setResults([]);
    setIsSearching(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  }

  /* Cleanup debounce */
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const hasQuery = q.trim().length > 0;

  /* ── Render ── */
  return (
    <div
      className="overlay-screen"
      style={{
        background: "rgba(8,8,8,.94)",
        backdropFilter: "blur(32px) saturate(1.2)",
        WebkitBackdropFilter: "blur(32px) saturate(1.2)",
        willChange: "transform",
      }}
    >
      {/* ── Frosted header ── */}
      <div
        className="mobile-screen-header mobile-screen-header--safe"
        style={{
          background: "rgba(10,10,10,.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          paddingBottom: 14,
          gap: 10,
        }}
      >
        <MobileBackButton onClick={onClose} />

        {/* Search pill */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--charcoal)",
            borderRadius: "var(--r-pill)",
            padding: "11px 16px",
            border: inputFocused
              ? "1px solid rgba(212,175,55,.55)"
              : "1px solid rgba(212,175,55,.25)",
            boxShadow: inputFocused
              ? "0 0 0 3px rgba(212,175,55,.08)"
              : "none",
            transition: "border-color 0.22s cubic-bezier(.22,.68,0,1), box-shadow 0.22s cubic-bezier(.22,.68,0,1)",
          }}
        >
          <Icon name="search" size={18} color="var(--ink-soft)" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Rechercher…"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--ink)",
              fontSize: 15,
              fontFamily: "inherit",
            }}
          />
          {hasQuery && (
            <button
              onClick={clearQuery}
              style={{
                color: "var(--ink-mute)",
                flexShrink: 0,
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <ScrollRegion variant="overlay" insetX={16} className="scroll-region--y4" padBottom={false}>
        {/* ── No query: discovery view ── */}
        {!hasQuery && (
          <>
            {/* Recent searches */}
            {recents.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 13,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--ink-mute)",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                    }}
                  >
                    Recherches récentes
                  </span>
                  <button
                    onClick={clearRecents}
                    style={{
                      color: "var(--ink-mute)",
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
                    }}
                  >
                    <Icon name="x" size={13} />
                    <span>Tout effacer</span>
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                  {recents.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleChipSearch(r)}
                      style={{
                        padding: "9px 14px",
                        borderRadius: "var(--r-pill)",
                        background: "var(--charcoal)",
                        color: "var(--ink-soft)",
                        fontSize: 12.5,
                        border: "1px solid rgba(255,255,255,.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        WebkitTapHighlightColor: "transparent",
                        touchAction: "manipulation",
                      }}
                    >
                      <Icon name="clock" size={13} color="var(--ink-mute)" />
                      <span>{r}</span>
                      <span
                        onClick={(e) => removeRecent(r, e)}
                        style={{
                          marginLeft: 2,
                          display: "flex",
                          alignItems: "center",
                          color: "var(--ink-mute)",
                        }}
                      >
                        <Icon name="x" size={11} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending section */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--gold)",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  marginBottom: 13,
                }}
              >
                Tendances
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                {TRENDING.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => handleChipSearch(t)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "var(--r-pill)",
                      background: i === 0
                        ? "rgba(212,175,55,.06)"
                        : "var(--charcoal)",
                      color: "var(--ink-soft)",
                      fontSize: 12.5,
                      border: i === 0
                        ? "1px solid rgba(212,175,55,.35)"
                        : "1px solid rgba(255,255,255,.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
                      position: "relative",
                    }}
                  >
                    <Icon name="flame" size={13} color="var(--gold)" />
                    <span>{t}</span>
                    {i === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -6,
                          right: 8,
                          fontSize: 9,
                          fontWeight: 700,
                          color: "var(--noir)",
                          background: "var(--gold-grad, var(--gold))",
                          padding: "2px 6px",
                          borderRadius: "var(--r-pill)",
                          letterSpacing: ".08em",
                          lineHeight: 1.4,
                        }}
                      >
                        #1
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories section */}
            <div style={{ marginBottom: 26 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--ink-mute)",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  marginBottom: 13,
                }}
              >
                Catégories
              </div>
              <div
                className="scroll-row"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 9,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleChipSearch(cat)}
                    style={{
                      flexShrink: 0,
                      padding: "9px 16px",
                      borderRadius: "var(--r-pill)",
                      background: "var(--charcoal)",
                      color: "var(--ink-soft)",
                      fontSize: 12.5,
                      border: "1px solid rgba(255,255,255,.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      whiteSpace: "nowrap",
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
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
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions grid */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: "var(--ink)",
                marginBottom: 14,
              }}
            >
              Suggestions
            </div>
            <ProductGrid products={products.slice(0, 4)} />
          </>
        )}

        {/* ── Active query: results view ── */}
        {hasQuery && (
          <>
            {/* Result count / loading label */}
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-mute)",
                marginBottom: 14,
                minHeight: 18,
                transition: "opacity .15s",
                opacity: isSearching ? 0.4 : 1,
              }}
            >
              {isSearching ? (
                "Recherche…"
              ) : (
                <>
                  <span>{results.length} résultat{results.length !== 1 ? "s" : ""} pour </span>
                  <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
                    &laquo;{displayQ || q}&raquo;
                  </span>
                </>
              )}
            </div>

            {/* Loading skeletons */}
            {isSearching && (
              <div
                className={productGridClassName()}
                style={{ animation: "pulse 1.2s ease-in-out infinite" }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="prodbento-cell">
                    <SkeletonProductCard />
                  </div>
                ))}
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <ProductGrid products={results} />
            )}

            {/* Empty state */}
            {!isSearching && results.length === 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 24px 40px",
                  textAlign: "center",
                  gap: 12,
                }}
              >
                <div style={{ color: "var(--ink-mute)", marginBottom: 4 }}>
                  <Icon name="search" size={48} color="var(--ink-mute)" />
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--ink)",
                    letterSpacing: "-.01em",
                  }}
                >
                  Aucun résultat
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-mute)",
                    lineHeight: 1.6,
                    maxWidth: 240,
                  }}
                >
                  Essayez{" "}
                  <span style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>
                    &ldquo;{q}&rdquo;
                  </span>{" "}
                  ou parcourez nos catégories
                </div>
                <button
                  onClick={() => {
                    clearQuery();
                  }}
                  style={{
                    marginTop: 8,
                    padding: "11px 22px",
                    borderRadius: "var(--r-pill)",
                    border: "1px solid rgba(212,175,55,.45)",
                    background: "transparent",
                    color: "var(--gold)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: ".04em",
                    WebkitTapHighlightColor: "transparent",
                    touchAction: "manipulation",
                  }}
                >
                  Voir les catégories
                </button>
              </div>
            )}
          </>
        )}
      </ScrollRegion>
    </div>
  );
}
