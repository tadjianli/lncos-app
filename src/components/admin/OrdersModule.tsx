"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { getSupabase } from "@/lib/supabase";

type OrderStatus = "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "refunded";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  variant: string | null;
}

interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  promo_code: string | null;
  total: number;
  tracking_number: string | null;
  shipping_address: ShippingAddressRow | null;
  created_at: string;
  order_items: OrderItem[];
}

interface ShippingAddressRow {
  firstName?: string;
  lastName?: string;
  address?: string;
  zip?: string;
  city?: string;
  phone?: string;
}

function formatShippingAddress(addr: ShippingAddressRow | null): string | null {
  if (!addr) return null;
  const name = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
  const line = [addr.address, [addr.zip, addr.city].filter(Boolean).join(" "), addr.phone]
    .filter(Boolean)
    .join(" · ");
  return [name, line].filter(Boolean).join(" — ");
}

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  preparing:  { label: "En préparation", color: "var(--tone-blue)",   bg: "rgba(59,125,216,.1)" },
  shipped:    { label: "Expédié",         color: "var(--tone-orange)", bg: "rgba(199,122,51,.1)" },
  in_transit: { label: "En transit",      color: "var(--tone-orange)", bg: "rgba(199,122,51,.1)" },
  delivered:  { label: "Livré",           color: "var(--tone-green)",  bg: "rgba(47,158,104,.1)" },
  cancelled:  { label: "Annulé",          color: "var(--tone-pink)",   bg: "rgba(194,85,122,.1)" },
};

const PAY_META: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  paid:     { label: "Payé",     color: "var(--tone-green)",  bg: "rgba(47,158,104,.1)" },
  pending:  { label: "En attente", color: "var(--tone-orange)", bg: "rgba(199,122,51,.1)" },
  refunded: { label: "Remboursé", color: "var(--tone-pink)",   bg: "rgba(194,85,122,.1)" },
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_OPTIONS: OrderStatus[] = ["preparing", "shipped", "in_transit", "delivered", "cancelled"];

export function OrdersModule() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    const { data: orderRows } = await sb
      .from("orders")
      .select(
        "id,user_id,status,payment_status,subtotal,shipping_cost,discount,promo_code,total,tracking_number,shipping_address,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    const rows = orderRows ?? [];
    const orderIds = rows.map((o) => o.id);
    let itemsByOrder = new Map<string, OrderItem[]>();

    if (orderIds.length > 0) {
      const { data: itemRows } = await sb
        .from("order_items")
        .select("id, order_id, name, price, qty, variant")
        .in("order_id", orderIds);

      itemsByOrder = (itemRows ?? []).reduce((map, it) => {
        const list = map.get(it.order_id) ?? [];
        list.push({
          id: it.id,
          name: it.name,
          price: Number(it.price),
          qty: it.qty,
          variant: it.variant,
        });
        map.set(it.order_id, list);
        return map;
      }, new Map<string, OrderItem[]>());
    }

    setOrders(
      rows.map((o) => ({
        ...(o as Omit<Order, "order_items">),
        order_items: itemsByOrder.get(o.id) ?? [],
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("orders-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mise à jour échouée");
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      console.error("[OrdersModule] status update:", err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = search === "" || o.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = orders.reduce((t, o) => t + Number(o.total), 0);
  const pendingCount = orders.filter((o) => o.status === "preparing" || o.status === "shipped").length;

  return (
    <div className="adm-content">
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Commandes</h1>
          <p className="adm-sub">{orders.length} commande{orders.length !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      <div className="adm-grid-3">
        {[
          { label: "Total commandes", value: orders.length, icon: "bag", bg: "rgba(59,125,216,.12)", color: "var(--tone-blue)" },
          { label: "Chiffre d'affaires", value: `${totalRevenue.toFixed(2)} €`, icon: "sparkle", bg: "rgba(47,158,104,.12)", color: "var(--tone-green)" },
          { label: "En attente", value: pendingCount, icon: "sliders", bg: "rgba(199,122,51,.12)", color: "var(--tone-orange)" },
        ].map((s) => (
          <div key={s.label} className="adm-card adm-stat">
            <div className="adm-stat-top">
              <div className="adm-stat-icon" style={{ background: s.bg }}>
                <Icon name={s.icon as "bag"} size={18} color={s.color} />
              </div>
            </div>
            <div className="adm-stat-value">{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-card adm-card-scroll">
        <div className="adm-table-toolbar">
          <div className="adm-searchbox wide">
            <Icon name="search" size={15} color="var(--adm-ink-mute)" />
            <input
              placeholder="Rechercher par ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", ...STATUS_OPTIONS] as const).map((s) => (
              <button
                key={s}
                className={`adm-tab${filter === s ? " on" : ""}`}
                onClick={() => setFilter(s)}
                style={{ fontSize: 12 }}
              >
                {s === "all" ? "Tous" : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--adm-ink-mute)" }}>
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <Icon name="bag" size={40} color="var(--adm-ink-mute)" />
            <p style={{ marginTop: 12, color: "var(--adm-ink-mute)", fontSize: 14 }}>
              {search || filter !== "all" ? "Aucune commande correspondante" : "Aucune commande pour l'instant"}
            </p>
          </div>
        ) : (
          <table className="adm-table rows">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Date</th>
                <th>Articles</th>
                <th>Montant</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const sm = STATUS_META[o.status];
                const pm = PAY_META[o.payment_status];
                const ref = "LN-" + o.id.slice(0, 6).toUpperCase();
                const items = o.order_items ?? [];
                const isOpen = expanded === o.id;
                return (
                  <Fragment key={o.id}>
                    <tr key={o.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--adm-ink)", fontSize: 13 }}>{ref}</div>
                        <div className="mono">{o.id.slice(0, 8)}…</div>
                        {o.promo_code && (
                          <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 4 }}>
                            Promo {o.promo_code}
                          </div>
                        )}
                      </td>
                      <td>{fmt(o.created_at)}</td>
                      <td>
                        <button
                          type="button"
                          className="adm-tab"
                          style={{ fontSize: 11, padding: "4px 8px" }}
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                        >
                          {items.length} article{items.length !== 1 ? "s" : ""}
                          {items.length === 0 ? " ⚠" : ""}
                        </button>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--adm-ink)" }}>{Number(o.total).toFixed(2)} €</div>
                        {Number(o.shipping_cost) > 0 && (
                          <div style={{ fontSize: 11, color: "var(--adm-ink-mute)" }}>
                            Livraison {Number(o.shipping_cost).toFixed(2)} €
                          </div>
                        )}
                        {Number(o.discount) > 0 && (
                          <div style={{ fontSize: 11, color: "var(--tone-green)" }}>
                            −{Number(o.discount).toFixed(2)} €
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="adm-badge" style={{ color: pm.color, background: pm.bg }}>{pm.label}</span>
                      </td>
                      <td>
                        <span className="adm-badge" style={{ color: sm.color, background: sm.bg }}>{sm.label}</span>
                      </td>
                      <td>
                        <select
                          className="adm-select"
                          value={o.status}
                          disabled={updating === o.id}
                          onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{STATUS_META[s].label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${o.id}-items`}>
                        <td colSpan={7} style={{ background: "var(--adm-surface-2)", padding: "12px 16px" }}>
                          {items.length === 0 ? (
                            <span style={{ color: "var(--tone-orange)", fontSize: 13 }}>
                              Aucun article enregistré — vérifier la commande Stripe
                            </span>
                          ) : (
                            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                              {formatShippingAddress(o.shipping_address) && (
                                <li style={{ fontSize: 12.5, color: "var(--adm-ink-soft)", marginBottom: 4 }}>
                                  Livraison : {formatShippingAddress(o.shipping_address)}
                                </li>
                              )}
                              {items.map((it) => (
                                <li key={it.id} style={{ fontSize: 13, color: "var(--adm-ink)" }}>
                                  {it.qty}× {it.name}
                                  {it.variant ? ` (${it.variant})` : ""} — {(Number(it.price) * it.qty).toFixed(2)} €
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
