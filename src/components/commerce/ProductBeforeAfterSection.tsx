"use client";

import { useRef, useState } from "react";
import { BeforeAfterCompare } from "@/components/commerce/BeforeAfterCompare";
import { Icon } from "@/components/shared/Icon";
import { useProductBeforeAfter } from "@/lib/client-supabase";
import type { PublicBeforeAfterResult } from "@/lib/before-after";

function ResultCard({ item }: { item: PublicBeforeAfterResult }) {
  return (
    <article
      style={{
        flex: "0 0 min(88vw, 320px)",
        scrollSnapAlign: "center",
        padding: "0 4px",
      }}
    >
      <BeforeAfterCompare beforeUrl={item.beforeImageUrl} afterUrl={item.afterImageUrl} />
      {(item.title || item.description || item.authorName || item.rating) && (
        <div style={{ marginTop: 14 }}>
          {item.title && (
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--ink)", lineHeight: 1.35 }}>
              {item.title}
            </p>
          )}
          {item.description && (
            <p style={{ margin: item.title ? "0 0 6px" : "0 0 6px", fontSize: 14, fontWeight: item.title ? 500 : 600, color: item.title ? "var(--ink-soft)" : "var(--ink)", lineHeight: 1.4 }}>
              {item.description}
            </p>
          )}
          {(item.authorName || item.rating) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {item.authorName && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{item.authorName}</span>
              )}
              {item.rating != null && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--gold)" }}>
                  <Icon name="star" size={12} color="var(--gold)" fill="var(--gold)" />
                  {item.rating}/5
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function ProductBeforeAfterSection({
  productId,
  sectionTitle,
}: {
  productId: string;
  sectionTitle?: string;
}) {
  const { results, loading } = useProductBeforeAfter(productId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (!loading && results.length === 0) return null;

  return (
    <section style={{ marginTop: 32, marginBottom: 8 }}>
      <div style={{ marginBottom: 16 }}>
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
          Preuve sociale
        </div>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>
          {sectionTitle?.trim() || "Résultats réels"}
        </h3>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--ink-mute)" }}>Chargement…</p>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="noscroll"
            onScroll={() => {
              const el = scrollRef.current;
              if (!el) return;
              const w = el.clientWidth || 1;
              setActive(Math.round(el.scrollLeft / w));
            }}
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              overscrollBehaviorX: "contain",
              scrollSnapType: "x mandatory",
              marginLeft: -18,
              marginRight: -18,
              paddingLeft: 18,
              paddingRight: 18,
              paddingBottom: 8,
            }}
          >
            {results.map((r) => (
              <ResultCard key={r.id} item={r} />
            ))}
          </div>
          {results.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
              {results.map((r, i) => (
                <span
                  key={r.id}
                  style={{
                    width: i === active ? 18 : 6,
                    height: 6,
                    borderRadius: 999,
                    background: i === active ? "var(--gold)" : "rgba(255,255,255,.2)",
                    transition: "width .25s ease",
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
