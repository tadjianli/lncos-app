"use client";
import { useState } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { SubHeader } from "@/components/shared/ActionButtons";

/* ─── Types ───────────────────────────────────────────────────────────── */

type OrderStatus = "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  name: string;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  tracking?: string;
  eta?: string;
  deliveredOn?: string;
}

/* ─── Mock data ───────────────────────────────────────────────────────── */

const ORDERS: Order[] = [
  {
    id: "LN-2480",
    date: "4 juin 2026",
    status: "shipped",
    total: 104.70,
    items: [
      { id: "parfum-noir", name: "Parfum Nuit d'Or", price: 79.90 },
      { id: "rouge-mat", name: "Rouge à Lèvres Mat", price: 24.80 },
    ],
    tracking: "EN24-FR-8847261",
    eta: "Livraison prévue demain",
  },
  {
    id: "LN-2461",
    date: "28 mai 2026",
    status: "delivered",
    total: 49.90,
    items: [{ id: "serum-eclat", name: "Sérum Éclat Parfait", price: 49.90 }],
    deliveredOn: "30 mai 2026",
  },
  {
    id: "LN-2433",
    date: "15 mai 2026",
    status: "delivered",
    total: 79.90,
    items: [
      { id: "masque-argile", name: "Masque Argile Rose", price: 34.90 },
      { id: "huile-demaq", name: "Huile Démaquillante", price: 45.00 },
    ],
    deliveredOn: "17 mai 2026",
  },
];

/* ─── Tab config ──────────────────────────────────────────────────────── */

type Tab = "en-cours" | "livrees" | "annulees";

const TABS: { id: Tab; label: string }[] = [
  { id: "en-cours", label: "En cours" },
  { id: "livrees", label: "Livrées" },
  { id: "annulees", label: "Annulées" },
];

const TAB_STATUSES: Record<Tab, OrderStatus[]> = {
  "en-cours": ["shipped"],
  "livrees": ["delivered"],
  "annulees": ["cancelled"],
};

/* ─── Status chip ─────────────────────────────────────────────────────── */

function StatusChip({ status }: { status: OrderStatus }) {
  const configs = {
    shipped:   { bg: "rgba(212,175,55,.15)",  color: "#D4AF37",  label: "Expédiée" },
    delivered: { bg: "rgba(123,201,154,.15)", color: "#7BC99A",  label: "Livrée"   },
    cancelled: { bg: "rgba(255,90,90,.13)",   color: "#FF7070",  label: "Annulée"  },
  };
  const c = configs[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "var(--r-pill)",
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".04em",
        flexShrink: 0,
      }}
    >
      {c.label}
    </span>
  );
}

/* ─── Delivery progress bar (shipped only) ───────────────────────────── */

function DeliveryProgress({ eta }: { eta?: string }) {
  const steps = ["Confirmée", "Expédiée", "Livrée"];
  const currentStep = 1; // "Expédiée"

  return (
    <div style={{ padding: "4px 0 2px" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {steps.map((step, i) => {
          const done   = i < currentStep;
          const active = i === currentStep;

          return (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "flex-start",
                flex: i < steps.length - 1 ? "1 1 auto" : "0 0 auto",
              }}
            >
              {/* Dot + label */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: active ? 14 : 10,
                    height: active ? 14 : 10,
                    borderRadius: "50%",
                    background: done ? "#7BC99A" : active ? "var(--gold)" : "rgba(255,255,255,.12)",
                    boxShadow: active ? "0 0 0 4px rgba(212,175,55,.2)" : "none",
                    animation: active ? "goldPulse 1.8s ease-in-out infinite" : "none",
                    transition: "all .3s var(--ease-lux)",
                    flexShrink: 0,
                    marginTop: active ? 0 : 2,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 400,
                    color: done ? "#7BC99A" : active ? "var(--gold)" : "var(--ink-mute)",
                    whiteSpace: "nowrap",
                    letterSpacing: ".02em",
                  }}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    margin: "6px 6px 0",
                    borderRadius: 2,
                    background: done
                      ? "#7BC99A"
                      : active
                      ? "linear-gradient(90deg,#D4AF37 30%,rgba(255,255,255,.1) 100%)"
                      : "rgba(255,255,255,.1)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {eta && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 12,
            fontStyle: "italic",
            color: "var(--gold)",
            fontWeight: 500,
          }}
        >
          {eta}
        </p>
      )}
    </div>
  );
}

/* ─── Thumbnail strip ─────────────────────────────────────────────────── */

function ThumbnailStrip({ items }: { items: OrderItem[] }) {
  const MAX_VISIBLE = 3;
  const visible  = items.slice(0, MAX_VISIBLE);
  const overflow = items.length - MAX_VISIBLE;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {visible.map((item, i) => {
        const isLast = i === visible.length - 1 && overflow > 0;
        return (
          <div key={item.id} style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 10,
                overflow: "hidden",
                background: "var(--charcoal-3)",
              }}
            >
              <FadeImage
                src={`/assets/products/${item.id}.png`}
                alt={item.name}
                width={52}
                height={52}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
            {isLast && overflow > 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  background: "rgba(10,10,10,.72)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--ink)",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                +{overflow}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Expanded item list ──────────────────────────────────────────────── */

function ItemList({ items }: { items: OrderItem[] }) {
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const shipping = 0;
  const total    = subtotal + shipping;

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,.07)",
        paddingTop: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {items.map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              overflow: "hidden",
              background: "var(--charcoal-3)",
              flexShrink: 0,
            }}
          >
            <FadeImage
              src={`/assets/products/${item.id}.png`}
              alt={item.name}
              width={40}
              height={40}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: 3,
                padding: "1px 7px",
                borderRadius: "var(--r-pill)",
                background: "rgba(255,255,255,.07)",
                color: "var(--ink-soft)",
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              Qté: 1
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", flexShrink: 0 }}>
            {item.price.toFixed(2)} €
          </span>
        </div>
      ))}

      {/* Price breakdown */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,.07)",
          paddingTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-mute)" }}>
          <span>Sous-total</span>
          <span style={{ color: "var(--ink-soft)" }}>{subtotal.toFixed(2)} €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-mute)" }}>
          <span>Livraison</span>
          <span style={{ color: "#7BC99A" }}>Offerte</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--ink)",
            paddingTop: 6,
            borderTop: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <span>Total</span>
          <span style={{ color: "var(--gold)" }}>{total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Order card ──────────────────────────────────────────────────────── */

function OrderCard({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--charcoal)",
        borderRadius: "var(--r-lg)",
        border: `1px solid ${expanded ? "rgba(212,175,55,.15)" : "rgba(255,255,255,.05)"}`,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color .25s var(--ease-lux)",
        willChange: "transform",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)", letterSpacing: ".02em" }}>
            #{order.id}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--ink-mute)" }}>
            {order.date} · {order.items.length} article{order.items.length > 1 ? "s" : ""}
          </p>
        </div>
        <StatusChip status={order.status} />
      </div>

      {/* Thumbnails + expand toggle */}
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
          cursor: "pointer",
          background: "none",
          border: "none",
          padding: 0,
          width: "100%",
        }}
        aria-expanded={expanded}
      >
        <ThumbnailStrip items={order.items} />
        <div
          style={{
            color: "var(--ink-mute)",
            transition: "transform .25s var(--ease-lux)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            willChange: "transform",
          }}
        >
          <Icon name="chevDown" size={18} />
        </div>
      </button>

      {/* Delivery progress (shipped) */}
      {order.status === "shipped" && <DeliveryProgress eta={order.eta} />}

      {/* Delivered info */}
      {order.status === "delivered" && order.deliveredOn && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 12px",
            borderRadius: "var(--r-sm)",
            background: "rgba(123,201,154,.08)",
          }}
        >
          <Icon name="check" size={14} color="#7BC99A" />
          <span style={{ fontSize: 12, color: "#7BC99A", fontWeight: 500 }}>
            Livrée le {order.deliveredOn}
          </span>
        </div>
      )}

      {/* Expandable details */}
      {expanded && <ItemList items={order.items} />}

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 2,
          gap: 10,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", flexShrink: 0 }}>
          {order.total.toFixed(2)} €
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {order.status === "shipped" && (
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "var(--r-pill)",
                border: "1px solid rgba(212,175,55,.45)",
                color: "var(--gold)",
                fontSize: 13,
                fontWeight: 600,
                background: "transparent",
                letterSpacing: ".02em",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexShrink: 0,
              }}
            >
              <Icon name="truck" size={14} color="#D4AF37" />
              Suivre
            </button>
          )}
          <button
            style={{
              padding: "8px 18px",
              borderRadius: "var(--r-pill)",
              background: "var(--pink-grad)",
              color: "#3a1020",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              letterSpacing: ".02em",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              boxShadow: "0 6px 20px -8px rgba(239,169,192,.6)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <Icon name="bolt" size={13} />
            Racheter
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */

interface OrdersScreenProps {
  onClose?: () => void;
  onBack?: () => void;
}

export function OrdersScreen({ onClose, onBack }: OrdersScreenProps) {
  const [activeTab, setActiveTab]   = useState<Tab>("en-cours");
  const [expanded,  setExpanded]    = useState<Record<string, boolean>>({});

  const handleBack = onBack ?? onClose;

  const filteredOrders = ORDERS.filter((o) =>
    TAB_STATUSES[activeTab].includes(o.status)
  );

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        animation: "overlayIn 0.38s cubic-bezier(0.22,0.68,0,1) both",
        willChange: "transform",
      }}
    >
      {/* Keyframe for gold pulsing dot */}
      <style>{`
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(212,175,55,.2); }
          50%       { box-shadow: 0 0 0 7px rgba(212,175,55,.08); }
        }
      `}</style>

      {/* Header */}
      <div style={{ paddingTop: 16, flex: "0 0 auto" }}>
        <SubHeader
          title="Mes commandes"
          onBack={handleBack}
          right={
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ink-mute)",
                letterSpacing: ".04em",
              }}
            >
              {ORDERS.length}
            </span>
          }
        />
      </div>

      {/* Tab bar */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          gap: 8,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 12,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: "8px 18px",
                borderRadius: "var(--r-pill)",
                background: isActive ? "var(--gold-grad)" : "var(--charcoal)",
                border: isActive ? "none" : "1px solid rgba(255,255,255,.06)",
                color: isActive ? "#1a1306" : "var(--ink-soft)",
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                letterSpacing: ".02em",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                boxShadow: isActive ? "var(--glow-gold)" : "none",
                transition: "all .25s var(--ease-lux)",
                willChange: "transform",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scroll container */}
      <div
        className="noscroll"
        style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}
      >
        <div
          style={{
            padding: "4px 18px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {filteredOrders.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                paddingTop: 60,
                color: "var(--ink-mute)",
              }}
            >
              <Icon name="bag" size={40} color="var(--charcoal-3)" />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                Aucune commande dans cette catégorie
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={!!expanded[order.id]}
                onToggle={() => toggleExpand(order.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
