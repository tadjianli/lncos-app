"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminAccordion, AdminAccordionStack } from "@/components/admin/AdminAccordion";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { getSupabase } from "@/lib/supabase";
import {
  OrderDetailModal,
  type AdminOrder,
  type OrderStatus,
  type OrderSavePayload,
  STATUS_META,
  PAY_META,
  STATUS_OPTIONS,
} from "@/components/admin/OrderDetailModal";
import { formatOrderRef } from "@/lib/order-ref";

function fmt(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function OrdersModule() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    window.setTimeout(() => setToast(null), 2800);
  }

  const load = useCallback(async () => {
    const sb = getSupabase();
    const { data: orderRows } = await sb
      .from("orders")
      .select(
        "id,user_id,status,payment_status,subtotal,shipping_cost,discount,promo_code,total,tracking_number,carrier,tracking_url,shipping_address,stripe_session_id,payment_provider,confirmation_email_sent_at,shipped_email_sent_at,estimated_delivery,delivered_at,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    const rows = orderRows ?? [];
    const orderIds = rows.map((o) => o.id);
    let itemsByOrder = new Map<string, AdminOrder["order_items"]>();

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
      }, new Map<string, AdminOrder["order_items"]>());
    }

    const nextOrders = rows.map((o) => ({
      ...(o as Omit<AdminOrder, "order_items">),
      order_items: itemsByOrder.get(o.id) ?? [],
    }));

    setOrders(nextOrders);
    setSelected((prev) => (prev ? nextOrders.find((o) => o.id === prev.id) ?? null : null));
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

  const updateStatus = async (id: string, payload: OrderSavePayload) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: payload.status,
          tracking_number: payload.trackingNumber,
          carrier: payload.carrier,
          tracking_url: payload.trackingUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mise à jour échouée");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: payload.status,
                tracking_number: payload.trackingNumber,
                carrier: payload.carrier,
                tracking_url: payload.trackingUrl,
              }
            : o,
        ),
      );
      setSelected((prev) =>
        prev?.id === id
          ? {
              ...prev,
              status: payload.status,
              tracking_number: payload.trackingNumber,
              carrier: payload.carrier,
              tracking_url: payload.trackingUrl,
            }
          : prev,
      );
      showToast("Commande mise à jour");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mise à jour échouée";
      console.error("[OrdersModule] status update:", err);
      showToast(message, "error");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    const ref = formatOrderRef(o.id).toLowerCase();
    const matchSearch =
      search === "" ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      ref.includes(search.toLowerCase());
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

      <AdminAccordionStack>
        <AdminAccordion title="Indicateurs">
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
        </AdminAccordion>

        <AdminAccordion title="Liste des commandes">
      <div className="adm-card adm-card-scroll" style={{ border: "none", boxShadow: "none", padding: 0 }}>
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
                const ref = formatOrderRef(o.id);
                const items = o.order_items ?? [];
                return (
                  <tr
                    key={o.id}
                    className="adm-table-row-clickable"
                    onClick={() => setSelected(o)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--adm-ink)", fontSize: 13 }}>{ref}</div>
                      {o.promo_code && (
                        <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 4 }}>
                          Promo {o.promo_code}
                        </div>
                      )}
                    </td>
                    <td>{fmt(o.created_at)}</td>
                    <td>
                      <span style={{ fontSize: 13, color: "var(--adm-ink-soft)" }}>
                        {items.length} article{items.length !== 1 ? "s" : ""}
                        {items.length === 0 ? " ⚠" : ""}
                      </span>
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
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className="adm-select"
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={(e) =>
                          updateStatus(o.id, {
                            status: e.target.value as OrderStatus,
                            trackingNumber: o.tracking_number,
                            carrier: o.carrier,
                            trackingUrl: o.tracking_url,
                          })
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_META[s].label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
        </AdminAccordion>
      </AdminAccordionStack>

      {selected && (
        <OrderDetailModal
          order={selected}
          saving={updating === selected.id}
          onClose={() => setSelected(null)}
          onSave={(payload) => {
            void updateStatus(selected.id, payload);
          }}
        />
      )}

      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}
    </div>
  );
}
