"use client";
/**
 * LN COS — Client orders screen (from handoff app.jsx OrdersClientScreen)
 */

import { Icon } from "@/components/shared/Icon";
import { SubHeader } from "@/components/shared/ActionButtons";

const ORDERS = [
  { n: "LN-2480", d: "4 juin 2026",  st: "Expédiée", c: "var(--gold)",  total: "104,70 €", items: 3 },
  { n: "LN-2461", d: "28 mai 2026",  st: "Livrée",   c: "#7BC99A",      total: "49,90 €",  items: 1 },
  { n: "LN-2433", d: "15 mai 2026",  st: "Livrée",   c: "#7BC99A",      total: "79,90 €",  items: 2 },
];

interface OrdersScreenProps {
  onClose: () => void;
}

export function OrdersScreen({ onClose }: OrdersScreenProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        zIndex: 80,
        animation: "slideUp .3s cubic-bezier(.2,.8,.2,1) both",
      }}
    >
      <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
        <SubHeader title="Mes commandes" onBack={onClose} />
      </div>

      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "4px 16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ORDERS.map((o, i) => (
            <div
              key={o.n}
              style={{
                padding: 16,
                borderRadius: "var(--r-md)",
                background: "var(--charcoal)",
                border: "1px solid rgba(255,255,255,.05)",
                animation: `fadeUp .4s ease ${i * 0.05}s both`,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>#{o.n}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}>
                    {o.d} · {o.items} article{o.items > 1 ? "s" : ""}
                  </div>
                </div>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--r-pill)",
                    background: o.c + "24",
                    color: o.c,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {o.st}
                </span>
              </div>

              {/* Item thumbnails */}
              <div style={{ display: "flex", gap: 8, marginBottom: 13 }}>
                {Array.from({ length: o.items }).map((_, k) => (
                  <div
                    key={k}
                    className="ph"
                    data-label=""
                    style={{ width: 48, height: 48, borderRadius: 11 }}
                  />
                ))}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{o.total}</span>
                <div style={{ display: "flex", gap: 9 }}>
                  <button
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--r-pill)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink-soft)",
                      border: "1px solid rgba(255,255,255,.1)",
                    }}
                  >
                    Suivre
                  </button>
                  <button
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--r-pill)",
                      fontSize: 12,
                      fontWeight: 700,
                      background: "var(--pink-grad)",
                      color: "#3a1020",
                    }}
                  >
                    Racheter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
