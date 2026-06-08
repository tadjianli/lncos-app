"use client";
import { useState, useEffect, useCallback } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { SubHeader } from "@/components/shared/ActionButtons";
import { getSupabase } from "@/lib/supabase";

/* ─── Types ───────────────────────────────────────────────────────────── */

type OrderStatus = "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  ref: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  tracking: string | null;
}

type Tab = "en-cours" | "livrees" | "annulees";

const TABS: { id: Tab; label: string }[] = [
  { id: "en-cours", label: "En cours" },
  { id: "livrees",  label: "Livrées"  },
  { id: "annulees", label: "Annulées" },
];

const TAB_STATUSES: Record<Tab, OrderStatus[]> = {
  "en-cours": ["preparing", "shipped", "in_transit"],
  "livrees":  ["delivered"],
  "annulees": ["cancelled"],
};

/* ─── Status chip ─────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  preparing:  { bg: "rgba(59,125,216,.15)", color: "#3B7DD8", label: "En préparation" },
  shipped:    { bg: "rgba(212,175,55,.15)", color: "#D4AF37", label: "Expédiée" },
  in_transit: { bg: "rgba(199,122,51,.15)", color: "#C77A33", label: "En transit" },
  delivered:  { bg: "rgba(123,201,154,.15)", color: "#7BC99A", label: "Livrée" },
  cancelled:  { bg: "rgba(255,90,90,.13)",  color: "#FF7070", label: "Annulée" },
};

function StatusChip({ status }: { status: OrderStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "var(--r-pill)", background: c.bg, color: c.color, fontSize: 11, fontWeight: 700, letterSpacing: ".04em", flexShrink: 0 }}>
      {c.label}
    </span>
  );
}

/* ─── Delivery progress ──────────────────────────────────────────────── */

function DeliveryProgress({ status }: { status: OrderStatus }) {
  const steps = ["Préparation", "Expédiée", "En livraison", "Livrée"];
  const step = status === "preparing" ? 0 : status === "shipped" ? 1 : status === "in_transit" ? 2 : 3;

  return (
    <div style={{ padding: "4px 0 2px" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {steps.map((s, i) => {
          const done   = i < step;
          const active = i === step;
          return (
            <div key={s} style={{ display: "flex", alignItems: "flex-start", flex: i < steps.length - 1 ? "1 1 auto" : "0 0 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: active ? 14 : 10, height: active ? 14 : 10, borderRadius: "50%", background: done ? "#7BC99A" : active ? "var(--gold)" : "rgba(255,255,255,.12)", boxShadow: active ? "0 0 0 4px rgba(212,175,55,.2)" : "none", flexShrink: 0, marginTop: active ? 0 : 2 }} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: done ? "#7BC99A" : active ? "var(--gold)" : "var(--ink-mute)", whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: "6px 6px 0", borderRadius: 2, background: done ? "#7BC99A" : active ? "linear-gradient(90deg,#D4AF37 30%,rgba(255,255,255,.1) 100%)" : "rgba(255,255,255,.1)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Order card ──────────────────────────────────────────────────────── */

function OrderCard({ order, expanded, onToggle }: { order: Order; expanded: boolean; onToggle: () => void }) {
  const MAX = 3;
  const visible  = order.items.slice(0, MAX);
  const overflow = order.items.length - MAX;
  const fmt = new Date(order.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ background: "var(--charcoal)", borderRadius: "var(--r-lg)", border: `1px solid ${expanded ? "rgba(212,175,55,.15)" : "rgba(255,255,255,.05)"}`, padding: 18, display: "flex", flexDirection: "column", gap: 14, transition: "border-color .25s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)", letterSpacing: ".02em" }}>#{order.ref}</p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--ink-mute)" }}>{fmt} · {order.items.length} article{order.items.length > 1 ? "s" : ""}</p>
        </div>
        <StatusChip status={order.status} />
      </div>

      {/* Thumbs + expand toggle */}
      <button onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", padding: 0, width: "100%", cursor: "pointer" }} aria-expanded={expanded}>
        <div style={{ display: "flex", gap: 8 }}>
          {visible.map((item, i) => (
            <div key={item.id + i} style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: "var(--charcoal-3)" }}>
                <FadeImage src={`/assets/products/${item.id}.png`} alt={item.name} width={52} height={52} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
              {i === visible.length - 1 && overflow > 0 && (
                <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(10,10,10,.72)", display: "grid", placeItems: "center", color: "var(--ink)", fontSize: 13, fontWeight: 700 }}>+{overflow}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ color: "var(--ink-mute)", transition: "transform .25s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          <Icon name="chevD" size={18} />
        </div>
      </button>

      {/* Progress for active orders */}
      {(order.status === "preparing" || order.status === "shipped" || order.status === "in_transit") && (
        <DeliveryProgress status={order.status} />
      )}

      {/* Delivered badge */}
      {order.status === "delivered" && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: "var(--r-sm)", background: "rgba(123,201,154,.08)" }}>
          <Icon name="check" size={14} color="#7BC99A" />
          <span style={{ fontSize: 12, color: "#7BC99A", fontWeight: 500 }}>Livrée le {fmt}</span>
        </div>
      )}

      {/* Expanded item list */}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {order.items.map((item, i) => (
            <div key={item.id + i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "var(--charcoal-3)", flexShrink: 0 }}>
                <FadeImage src={`/assets/products/${item.id}.png`} alt={item.name} width={40} height={40} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                <span style={{ display: "inline-block", marginTop: 3, padding: "1px 7px", borderRadius: "var(--r-pill)", background: "rgba(255,255,255,.07)", color: "var(--ink-soft)", fontSize: 10, fontWeight: 600 }}>Qté: {item.qty}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", flexShrink: 0 }}>{(item.price * item.qty).toFixed(2)} €</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
            <span>Total</span>
            <span style={{ color: "var(--gold)" }}>{order.total.toFixed(2)} €</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 2, gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", flexShrink: 0 }}>{order.total.toFixed(2)} €</span>
        {order.tracking && (
          <button style={{ padding: "8px 16px", borderRadius: "var(--r-pill)", border: "1px solid rgba(212,175,55,.45)", color: "var(--gold)", fontSize: 13, fontWeight: 600, background: "transparent", display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="truck" size={14} color="#D4AF37" /> Suivre
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */

export function OrdersScreen({ onClose, onBack }: { onClose?: () => void; onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("en-cours");
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({});
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isGuest,   setIsGuest]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await getSupabase().auth.getUser();
    if (!user) { setIsGuest(true); setLoading(false); return; }
    setIsGuest(false);

    const { data: orderRows } = await getSupabase()
      .from("orders")
      .select("id, status, total, tracking_number, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!orderRows?.length) { setOrders([]); setLoading(false); return; }

    const orderIds = orderRows.map((o) => o.id);
    const { data: itemRows } = await getSupabase()
      .from("order_items")
      .select("order_id, product_id, name, price, qty")
      .in("order_id", orderIds);

    const itemsByOrder: Record<string, OrderItem[]> = {};
    for (const item of itemRows ?? []) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push({ id: item.product_id, name: item.name, price: Number(item.price), qty: item.qty });
    }

    setOrders(orderRows.map((o) => ({
      id: o.id,
      ref: "LN-" + o.id.slice(0, 6).toUpperCase(),
      date: o.created_at,
      status: o.status as OrderStatus,
      total: Number(o.total),
      items: itemsByOrder[o.id] ?? [],
      tracking: o.tracking_number,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBack = onBack ?? onClose;
  const filtered = orders.filter((o) => TAB_STATUSES[activeTab].includes(o.status));

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, background: "var(--noir)", display: "flex", flexDirection: "column", animation: "overlayIn 0.38s cubic-bezier(0.22,0.68,0,1) both" }}>
      <div style={{ paddingTop: 16, flex: "0 0 auto" }}>
        <SubHeader title="Mes commandes" onBack={handleBack} right={<span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-mute)" }}>{orders.length}</span>} />
      </div>

      <div style={{ flex: "0 0 auto", display: "flex", gap: 8, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flexShrink: 0, padding: "8px 18px", borderRadius: "var(--r-pill)", background: activeTab === tab.id ? "var(--gold-grad)" : "var(--charcoal)", border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,.06)", color: activeTab === tab.id ? "#1a1306" : "var(--ink-soft)", fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 400, cursor: "pointer", boxShadow: activeTab === tab.id ? "var(--glow-gold)" : "none", transition: "all .25s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
        <div style={{ padding: "4px 18px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
          {loading ? (
            // Skeleton
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} style={{ height: 140, borderRadius: "var(--r-lg)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.05)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))
          ) : isGuest ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 72, textAlign: "center" }}>
              <div style={{ width: 82, height: 82, borderRadius: "50%", background: "linear-gradient(135deg, rgba(212,175,55,.1), rgba(212,175,55,.04))", border: "1.5px solid rgba(212,175,55,.22)", display: "grid", placeItems: "center", marginBottom: 24 }}>
                <Icon name="user" size={34} color="var(--gold)" />
              </div>
              <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700, marginBottom: 10 }}>Connexion requise</div>
              <h3 style={{ margin: "0 0 10px", fontSize: 21, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>Connectez-vous</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55, maxWidth: 230 }}>Créez un compte ou connectez-vous pour voir l'historique de vos commandes.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 72, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, textAlign: "center" }}>
              <div style={{ width: 82, height: 82, borderRadius: "50%", background: "linear-gradient(135deg, rgba(212,175,55,.1), rgba(212,175,55,.04))", border: "1.5px solid rgba(212,175,55,.22)", display: "grid", placeItems: "center", marginBottom: 24 }}>
                <Icon name="bag" size={34} color="var(--gold)" />
              </div>
              <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700, marginBottom: 10 }}>Historique vide</div>
              <h3 style={{ margin: "0 0 10px", fontSize: 21, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>Aucune commande ici</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55, maxWidth: 230 }}>Vos commandes apparaîtront ici après votre prochain achat.</p>
            </div>
          ) : (
            filtered.map((order) => (
              <OrderCard key={order.id} order={order} expanded={!!expanded[order.id]} onToggle={() => setExpanded((p) => ({ ...p, [order.id]: !p[order.id] }))} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
