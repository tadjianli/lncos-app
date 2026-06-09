"use client";

import { useRef, useState } from "react";
import { BeforeAfterCompare } from "@/components/commerce/BeforeAfterCompare";
import { BeforeAfterBadges } from "@/components/shared/BeforeAfterBadges";
import { Icon } from "@/components/shared/Icon";
import { useFeaturedBeforeAfter } from "@/lib/client-supabase";

export function TransformationsSection({ title = "Transformations clients" }: { title?: string }) {
  const { results, loading } = useFeaturedBeforeAfter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (!loading && results.length === 0) return null;

  return (
    <section style={{ marginTop: 8 }}>
      <div style={{ padding: "0 18px", marginBottom: 16 }}>
        <div className="rev-sec-eyebrow">
          <Icon name="camera" size={13} color="var(--gold)" /> Résultats vérifiés
        </div>
        <h3 className="rev-sec-title" style={{ marginTop: 4 }}>{title}</h3>
      </div>

      {loading ? (
        <p style={{ padding: "0 18px", fontSize: 13, color: "var(--ink-mute)" }}>Chargement…</p>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="noscroll"
            onScroll={() => {
              const el = scrollRef.current;
              if (!el) return;
              const card = 300;
              setActive(Math.min(results.length - 1, Math.round(el.scrollLeft / (card + 14))));
            }}
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              padding: "0 18px 8px",
            }}
          >
            {results.map((r) => (
              <article
                key={r.id}
                style={{
                  flex: "0 0 min(78vw, 300px)",
                  scrollSnapAlign: "start",
                  background: "linear-gradient(160deg, rgba(26,23,20,.94), rgba(14,14,14,.97))",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 22,
                  padding: 14,
                  boxShadow: "0 20px 40px -24px rgba(0,0,0,.8)",
                }}
              >
                <BeforeAfterCompare beforeUrl={r.beforeImageUrl} afterUrl={r.afterImageUrl} />
                <div style={{ marginTop: 12 }}>
                  <BeforeAfterBadges verified={r.verified} compact />
                  {r.description && (
                    <p style={{ margin: "8px 0 4px", fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.4 }}>
                      {r.description}
                    </p>
                  )}
                  <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
                    {r.durationLabel}
                    {r.authorName ? ` · ${r.authorName}` : ""}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {results.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
              {results.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Transformation ${i + 1}`}
                  onClick={() => scrollRef.current?.scrollTo({ left: i * 314, behavior: "smooth" })}
                  style={{
                    width: i === active ? 18 : 6,
                    height: 6,
                    borderRadius: 999,
                    border: "none",
                    padding: 0,
                    background: i === active ? "var(--gold)" : "rgba(255,255,255,.2)",
                    transition: "width .25s ease",
                    cursor: "pointer",
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
