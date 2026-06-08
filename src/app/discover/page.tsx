"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import { usePublicCategories } from "@/lib/client-supabase";

/* ─── Category accent colours / gradients ──────────────────────────── */
const CAT_META: Record<string, { icon: string; grad: string; accent: string }> = {
  visage:      { icon: "sparkle", grad: "linear-gradient(135deg,#2a1f24,#1a1014)", accent: "#F7C6D7" },
  maquillage:  { icon: "star",    grad: "linear-gradient(135deg,#1e1420,#14090f)", accent: "#E2A8C0" },
  parfums:     { icon: "flame",   grad: "linear-gradient(135deg,#1e190e,#100c04)", accent: "#D4AF37" },
  corps:       { icon: "heart",   grad: "linear-gradient(135deg,#1a2218,#0d120c)", accent: "#A8C9A0" },
  cheveux:     { icon: "sparkle", grad: "linear-gradient(135deg,#1a1a28,#0c0c18)", accent: "#A8B4F7" },
  accessoires: { icon: "bag",     grad: "linear-gradient(135deg,#1e1c16,#110f0a)", accent: "#D4AF37" },
  coffrets:    { icon: "gift",    grad: "linear-gradient(135deg,#241824,#14101a)", accent: "#E2A8C0" },
};

/* ─── Featured editorial tiles ─────────────────────────────────────── */
const EDITORIALS = [
  {
    eyebrow: "Rituel du matin",
    title: "La routine teint parfait",
    sub: "3 produits · 5 minutes",
    grad: "linear-gradient(145deg,#2a1a1f 0%,#1a0d13 100%)",
    accent: "var(--pink)",
    icon: "sparkle",
  },
  {
    eyebrow: "Nouveauté",
    title: "Sérum Or 24K",
    sub: "Édition limitée",
    grad: "linear-gradient(145deg,#231d0c 0%,#13100a 100%)",
    accent: "var(--gold)",
    icon: "flame",
  },
];

export default function DiscoverPage() {
  const openListing = useStore((s) => s.openListing);
  const openSearch  = useStore((s) => s.openSearch);
  const { categories } = usePublicCategories();

  return (
    <AppShell>
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>

        {/* ── Search hero ─────────────────────────────────────── */}
        <div
          style={{
            padding: "52px 18px 20px",
            background: "linear-gradient(180deg, rgba(212,175,55,.06) 0%, transparent 100%)",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              margin: "0 0 6px",
            }}
          >
            Boutique LN COS
          </p>
          <h2
            style={{
              margin: "0 0 18px",
              fontWeight: 700,
              fontSize: 26,
              color: "var(--ink)",
              letterSpacing: "-.02em",
            }}
          >
            Découvrez
          </h2>

          {/* Search bar */}
          <button
            onClick={openSearch}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "14px 18px",
              borderRadius: "var(--r-pill)",
              background: "var(--charcoal)",
              border: "1px solid rgba(212,175,55,.22)",
              textAlign: "left",
            }}
          >
            <Icon name="search" size={17} color="var(--gold)" />
            <span style={{ flex: 1, fontSize: 14, color: "var(--ink-mute)", fontWeight: 400 }}>
              Rechercher un produit…
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--gold)",
                background: "rgba(212,175,55,.1)",
                padding: "4px 10px",
                borderRadius: "var(--r-pill)",
                letterSpacing: ".04em",
              }}
            >
              RECHERCHE
            </span>
          </button>
        </div>

        {/* ── Editorial tiles ──────────────────────────────────── */}
        <div style={{ padding: "4px 18px 0", display: "flex", gap: 12 }}>
          {EDITORIALS.map((e, i) => (
            <button
              key={e.title}
              style={{
                flex: 1,
                padding: "18px 16px",
                borderRadius: "var(--r-lg)",
                background: e.grad,
                border: `1px solid rgba(255,255,255,.07)`,
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
                animation: `fadeUp .5s ease ${i * 0.08}s both`,
                minHeight: 110,
              }}
            >
              {/* Glow orb */}
              <div
                style={{
                  position: "absolute",
                  right: -20,
                  top: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${e.accent}22, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: `${e.accent}1A`,
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 10,
                }}
              >
                <Icon name={e.icon} size={16} color={e.accent} />
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: e.accent, marginBottom: 4 }}>
                {e.eyebrow}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.25, marginBottom: 3 }}>
                {e.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>{e.sub}</div>
            </button>
          ))}
        </div>

        {/* ── Categories ───────────────────────────────────────── */}
        <div style={{ padding: "24px 18px 0" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              margin: "0 0 14px",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Icon name="star" size={12} color="var(--gold)" fill="rgba(212,175,55,.4)" />
            Toutes les catégories
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categories.map((c, i) => {
              const meta = CAT_META[c.id] ?? { icon: "sparkle", grad: "linear-gradient(135deg,#1a1a1a,#111)", accent: "var(--gold)" };
              return (
                <button
                  key={c.id}
                  onClick={() => openListing(c)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "15px 16px",
                    borderRadius: "var(--r-md)",
                    background: meta.grad,
                    border: "1px solid rgba(255,255,255,.06)",
                    textAlign: "left",
                    animation: `fadeUp .5s ease ${i * 0.04 + 0.1}s both`,
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Subtle right glow */}
                  <div
                    style={{
                      position: "absolute",
                      right: -16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${meta.accent}18, transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />

                  <span
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      background: `${meta.accent}18`,
                      border: `1px solid ${meta.accent}28`,
                      display: "grid",
                      placeItems: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    <Icon name={meta.icon} size={22} color={meta.accent} stroke={1.5} />
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}>
                      {c.count} produit{c.count !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <Icon name="chevR" size={18} color="var(--ink-mute)" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Brand promise strip ──────────────────────────────── */}
        <div style={{ padding: "28px 18px 32px" }}>
          <div
            style={{
              padding: "20px 20px",
              borderRadius: "var(--r-lg)",
              background: "linear-gradient(135deg, rgba(212,175,55,.06) 0%, rgba(212,175,55,.02) 100%)",
              border: "1px solid rgba(212,175,55,.14)",
              display: "flex",
              gap: 0,
            }}
          >
            {[
              { icon: "sparkle", l: "100% Vegan" },
              { icon: "heart",   l: "Sans cruauté" },
              { icon: "star",    l: "Made in France" },
            ].map((b, i) => (
              <div
                key={b.l}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 7,
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,.07)" : "none",
                  padding: "0 6px",
                }}
              >
                <Icon name={b.icon} size={18} color="var(--gold)" fill="rgba(212,175,55,.3)" />
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink-soft)", textAlign: "center", lineHeight: 1.3 }}>
                  {b.l}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
