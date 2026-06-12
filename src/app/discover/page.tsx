"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import { usePublicPageSections } from "@/lib/client-supabase";
import { PageSectionsView } from "@/components/page/PageSectionsView";

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
  const openSearch  = useStore((s) => s.openSearch);
  const { getVisible } = usePublicPageSections("discover");
  const sections = getVisible({ isMobile: true });

  return (
    <AppShell>
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>

        <PageSectionsView sections={sections.filter((s) => s.type !== "categories")} />

        {/* ── Search bar ─────────────────────────────────────── */}
        <div style={{ padding: "0 18px 20px" }}>
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

        <PageSectionsView sections={sections.filter((s) => s.type === "categories")} />

      </div>
    </AppShell>
  );
}
