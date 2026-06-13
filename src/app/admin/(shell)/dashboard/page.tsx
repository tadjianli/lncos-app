"use client";

import { useDashboardKPIs } from "@/lib/admin-supabase";
import { Icon } from "@/components/shared/Icon";
import { formatOrderRef } from "@/lib/order-ref";

function fmtPrice(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

const STATUS_LABELS: Record<string, string> = {
  pending:    "En attente",
  confirmed:  "Confirmé",
  completed:  "Terminé",
  cancelled:  "Annulé",
  no_show:    "Absent",
  preparing:  "En préparation",
  shipped:    "Expédié",
  in_transit: "En transit",
  delivered:  "Livré",
};

export default function DashboardPage() {
  const { kpis } = useDashboardKPIs();

  const kpiCards = [
    { label: "Chiffre d'affaires",  value: kpis ? fmtPrice(kpis.totalRevenue)       : "—", icon: "card",     color: "#2F9E68", bg: "rgba(47,158,104,.12)"   },
    { label: "Commandes",           value: kpis ? String(kpis.totalOrders)            : "—", icon: "bag",      color: "#3B7DD8", bg: "rgba(59,125,216,.12)"   },
    { label: "Rendez-vous",         value: kpis ? String(kpis.totalAppointments)      : "—", icon: "calendar", color: "#C77A33", bg: "rgba(199,122,51,.12)"   },
    { label: "Popups actifs",       value: kpis ? String(kpis.activePopups)           : "—", icon: "sparkle",  color: "#B8902B", bg: "rgba(212,175,55,.12)"   },
  ];

  return (
    <div className="adm-content">
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Bonjour, LN COS</h1>
          <div className="adm-sub">Activité en temps réel · Supabase</div>
        </div>
      </div>

      <div className="adm-grid-4">
        {kpiCards.map((c) => (
          <div key={c.label} className="adm-card adm-stat">
            <div className="adm-stat-top">
              <span className="adm-stat-icon" style={{ background: c.bg, color: c.color }}>
                <Icon name={c.icon} size={18} color={c.color} />
              </span>
            </div>
            <div className="adm-stat-value">{c.value}</div>
            <div className="adm-stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-dash-cols">
        {/* Recent orders */}
        <div className="adm-card adm-list-card adm-card-scroll">
          <div className="adm-list-card-head">
            <div className="adm-card-title">Dernières commandes</div>
          </div>
          {!kpis ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>Chargement…</div>
          ) : kpis.recentOrders.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>Aucune commande</div>
          ) : (
            <table className="adm-table rows">
              <thead><tr><th>Réf</th><th>Statut</th><th>Total</th></tr></thead>
              <tbody>
                {kpis.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{formatOrderRef(o.id)}</td>
                    <td><span className="adm-badge">{STATUS_LABELS[o.status] ?? o.status}</span></td>
                    <td style={{ fontWeight: 700 }}>{fmtPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent appointments */}
        <div className="adm-card adm-list-card adm-card-scroll">
          <div className="adm-list-card-head">
            <div className="adm-card-title">Derniers rendez-vous</div>
          </div>
          {!kpis ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>Chargement…</div>
          ) : kpis.recentAppointments.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>Aucun rendez-vous</div>
          ) : (
            <table className="adm-table rows">
              <thead><tr><th>Cliente</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>
                {kpis.recentAppointments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.client_name}</td>
                    <td style={{ fontSize: 12, color: "var(--adm-ink-soft)" }}>
                      {new Date(a.start_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td><span className="adm-badge">{STATUS_LABELS[a.status] ?? a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
