"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { getSupabase } from "@/lib/supabase";

interface Customer {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function initial(name: string | null, email: string | null) {
  const src = name ?? email ?? "?";
  return src[0]?.toUpperCase() ?? "?";
}

export function CustomersModule() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("profiles")
      .select("id,email,full_name,phone,is_admin,created_at")
      .eq("is_admin", false)
      .order("created_at", { ascending: false });
    setCustomers((data ?? []) as Customer[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.full_name ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q)
    );
  });

  const PALETTE = ["#C2557A", "#3B7DD8", "#2F9E68", "#C77A33", "#B8902B", "#7C756B"];
  const getColor = (id: string) => PALETTE[id.charCodeAt(0) % PALETTE.length];

  return (
    <div className="adm-content">
      {/* Header */}
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Clients</h1>
          <p className="adm-sub">{customers.length} client{customers.length !== 1 ? "s" : ""} inscrit{customers.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="adm-grid-3">
        {[
          { label: "Total clients", value: customers.length, icon: "user", color: "var(--tone-blue)", bg: "rgba(59,125,216,.12)" },
          { label: "Ce mois-ci", value: customers.filter((c) => new Date(c.created_at).getMonth() === new Date().getMonth()).length, icon: "star", color: "var(--tone-green)", bg: "rgba(47,158,104,.12)" },
          { label: "Avec téléphone", value: customers.filter((c) => c.phone).length, icon: "sparkle", color: "var(--tone-gold)", bg: "var(--adm-gold-bg)" },
        ].map((s) => (
          <div key={s.label} className="adm-card adm-stat">
            <div className="adm-stat-top">
              <div className="adm-stat-icon" style={{ background: s.bg }}>
                <Icon name={s.icon as "user"} size={18} color={s.color} />
              </div>
            </div>
            <div className="adm-stat-value">{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="adm-table-toolbar">
          <div className="adm-searchbox wide">
            <Icon name="search" size={15} color="var(--adm-ink-mute)" />
            <input
              placeholder="Rechercher par nom ou email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--adm-ink-mute)" }}>
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <Icon name="user" size={40} color="var(--adm-ink-mute)" />
            <p style={{ marginTop: 12, color: "var(--adm-ink-mute)", fontSize: 14 }}>
              {search ? "Aucun client correspondant" : "Aucun client inscrit pour l'instant"}
            </p>
          </div>
        ) : (
          <table className="adm-table rows">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="adm-prodcell">
                      <div
                        className="adm-mini-av"
                        style={{ background: getColor(c.id), color: "#fff", width: 32, height: 32, fontSize: 13 }}
                      >
                        {initial(c.full_name, c.email)}
                      </div>
                      <div>
                        <div className="adm-prod-name">{c.full_name ?? "Sans nom"}</div>
                        <div className="adm-prod-id">{c.id.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--adm-ink-soft)" }}>{c.email ?? "—"}</td>
                  <td style={{ color: "var(--adm-ink-soft)" }}>{c.phone ?? "—"}</td>
                  <td style={{ color: "var(--adm-ink-mute)", fontSize: 12 }}>{fmt(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
