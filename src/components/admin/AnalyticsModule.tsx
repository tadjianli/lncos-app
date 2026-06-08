"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { getSupabase } from "@/lib/supabase";

interface KPI {
  totalRevenue: number;
  totalOrders: number;
  totalAppointments: number;
  avgOrderValue: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  statusBreakdown: Record<string, number>;
  topProducts: Array<{ name: string; qty: number; revenue: number }>;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div style={{ flex: 1, height: 6, background: "var(--adm-surface-2)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color, transition: "width .6s" }} />
    </div>
  );
}

export function AnalyticsModule() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const sb = getSupabase();
    const [ordersRes, appointmentsRes, itemsRes] = await Promise.all([
      sb.from("orders").select("id,status,total,subtotal,created_at").order("created_at", { ascending: false }).limit(500),
      sb.from("appointments").select("id,price,status,created_at").limit(500),
      sb.from("order_items").select("name,qty,price").limit(1000),
    ]);

    const orders = ordersRes.data ?? [];
    const appointments = appointmentsRes.data ?? [];
    const items = itemsRes.data ?? [];

    const totalRevenue = orders.reduce((t, o) => t + Number(o.total), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Revenue by month (last 6 months)
    const now = new Date();
    const revenueByMonth = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const month = d.toLocaleDateString("fr-FR", { month: "short" });
      const revenue = orders
        .filter((o) => new Date(o.created_at) >= d && new Date(o.created_at) < nextMonth)
        .reduce((t, o) => t + Number(o.total), 0);
      return { month, revenue };
    });

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const o of orders) {
      statusBreakdown[o.status] = (statusBreakdown[o.status] ?? 0) + 1;
    }

    // Top products by revenue
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const item of items) {
      if (!productMap[item.name]) productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      productMap[item.name].qty += item.qty;
      productMap[item.name].revenue += Number(item.price) * item.qty;
    }
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setKpi({ totalRevenue, totalOrders: orders.length, totalAppointments: appointments.length, avgOrderValue, revenueByMonth, statusBreakdown, topProducts });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxRevenue = kpi ? Math.max(...kpi.revenueByMonth.map((m) => m.revenue), 1) : 1;
  const maxTopRev = kpi && kpi.topProducts.length > 0 ? kpi.topProducts[0].revenue : 1;

  const STATUS_COLORS: Record<string, string> = {
    preparing: "var(--tone-blue)",
    shipped: "var(--tone-orange)",
    in_transit: "var(--tone-orange)",
    delivered: "var(--tone-green)",
    cancelled: "var(--tone-pink)",
  };
  const STATUS_LABELS: Record<string, string> = {
    preparing: "En préparation",
    shipped: "Expédié",
    in_transit: "En transit",
    delivered: "Livré",
    cancelled: "Annulé",
  };

  return (
    <div className="adm-content">
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Statistiques</h1>
          <p className="adm-sub">Vue d'ensemble des performances LN COS</p>
        </div>
        <button className="adm-btn ghost" onClick={load}>
          <Icon name="sliders" size={14} /> Actualiser
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--adm-ink-mute)" }}>
          Chargement des données…
        </div>
      ) : !kpi ? null : (
        <>
          {/* KPI strip */}
          <div className="adm-grid-4">
            {[
              { label: "Chiffre d'affaires", value: `${kpi.totalRevenue.toFixed(2)} €`, icon: "sparkle", color: "var(--tone-green)", bg: "rgba(47,158,104,.12)" },
              { label: "Commandes", value: kpi.totalOrders, icon: "bag", color: "var(--tone-blue)", bg: "rgba(59,125,216,.12)" },
              { label: "Rendez-vous", value: kpi.totalAppointments, icon: "star", color: "var(--tone-pink)", bg: "rgba(194,85,122,.12)" },
              { label: "Panier moyen", value: `${kpi.avgOrderValue.toFixed(2)} €`, icon: "sliders", color: "var(--tone-gold)", bg: "var(--adm-gold-bg)" },
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Revenue chart */}
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <div className="adm-card-title">Revenus — 6 derniers mois</div>
                  <div className="adm-card-sub">En euros (commandes)</div>
                </div>
              </div>
              {kpi.totalOrders === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>
                  Aucune commande enregistrée
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                  {kpi.revenueByMonth.map((m) => {
                    const h = maxRevenue > 0 ? Math.max(6, (m.revenue / maxRevenue) * 100) : 6;
                    return (
                      <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div
                          title={`${m.revenue.toFixed(2)} €`}
                          style={{
                            width: "100%",
                            height: h,
                            borderRadius: "4px 4px 0 0",
                            background: "linear-gradient(180deg, #D4AF37, #B8902B)",
                            opacity: m.revenue > 0 ? 0.85 : 0.2,
                            transition: "height .6s",
                          }}
                        />
                        <span style={{ fontSize: 10, color: "var(--adm-ink-mute)", textTransform: "capitalize" }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status breakdown */}
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <div className="adm-card-title">Statuts des commandes</div>
                  <div className="adm-card-sub">Répartition par statut</div>
                </div>
              </div>
              {kpi.totalOrders === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>
                  Aucune commande enregistrée
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {Object.entries(kpi.statusBreakdown).map(([status, count]) => (
                    <div key={status} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 100, fontSize: 12, color: "var(--adm-ink-soft)", flexShrink: 0 }}>
                        {STATUS_LABELS[status] ?? status}
                      </span>
                      <Bar value={count} max={kpi.totalOrders} color={STATUS_COLORS[status] ?? "var(--adm-ink-mute)"} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--adm-ink)", width: 24, textAlign: "right", flexShrink: 0 }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <div className="adm-card-title">Top 5 produits</div>
                <div className="adm-card-sub">Classés par chiffre d'affaires généré</div>
              </div>
            </div>
            {kpi.topProducts.length === 0 ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>
                Aucune donnée de vente disponible
              </div>
            ) : (
              <div className="adm-bestlist">
                {kpi.topProducts.map((p, i) => (
                  <div key={p.name} className="adm-bestrow">
                    <span className="adm-rank">#{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="adm-best-name">{p.name}</div>
                      <div className="adm-best-meta">{p.qty} unité{p.qty !== 1 ? "s" : ""} vendue{p.qty !== 1 ? "s" : ""}</div>
                    </div>
                    <Bar value={p.revenue} max={maxTopRev} color="var(--adm-gold)" />
                    <span className="adm-best-rev" style={{ marginLeft: 12, minWidth: 72, textAlign: "right" }}>
                      {p.revenue.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
