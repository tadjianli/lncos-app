"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import { categories } from "@/lib/data";

const ICONS: Record<string, string> = {
  visage:      "sparkle",
  maquillage:  "star",
  parfums:     "flame",
  corps:       "heart",
  cheveux:     "sparkle",
  accessoires: "bag",
  coffrets:    "gift",
};

export default function DiscoverPage() {
  const openListing = useStore((s) => s.openListing);
  const openSearch  = useStore((s) => s.openSearch);

  return (
    <AppShell>
      {/* Scrollable container */}
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "58px 16px 12px",
          flex: "0 0 auto",
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 600, fontSize: "var(--fs-h2)", color: "var(--ink)" }}>
          Catégories
        </h2>
        <button onClick={openSearch} style={{ color: "var(--ink)" }}>
          <Icon name="search" size={20} />
        </button>
      </div>

      {/* List */}
      <div
        style={{
          padding: "4px 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {categories.map((c, i) => (
          <button
            key={c.id}
            onClick={() => openListing(c)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
              padding: "14px 16px",
              borderRadius: "var(--r-md)",
              background: "var(--charcoal)",
              border: "1px solid rgba(255,255,255,.05)",
              textAlign: "left",
              animation: `fadeUp .5s ease ${i * 0.05}s both`,
              width: "100%",
            }}
          >
            <span
              style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                background: "var(--pink-light)",
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
              }}
            >
              <Icon name={ICONS[c.id] || "sparkle"} size={23} color="#C77B98" stroke={1.6} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>{c.count} produits</div>
            </div>
            <Icon name="chevR" size={19} color="var(--ink-mute)" />
          </button>
        ))}
      </div>
      </div>{/* end scroll container */}
    </AppShell>
  );
}
