"use client";

import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { useProducts } from "@/lib/admin-supabase";
import { computeSeoDashboardStats, seoLevelColor } from "@/lib/seo";

export function SeoDashboardModule() {
  const { products, loading } = useProducts();
  const stats = computeSeoDashboardStats(products);

  const cards = [
    { label: "Produits optimisés (≥70)", value: stats.optimized, icon: "check", color: "#2F9E68" },
    { label: "Sans description", value: stats.withoutDescription, icon: "info", color: "#C77A33" },
    { label: "Sans alt image", value: stats.withoutImageAlt, icon: "camera", color: "#C77A33" },
    { label: "Sans meta description", value: stats.withoutMetaDescription, icon: "tag", color: "#C2557A" },
    { label: "Score SEO moyen", value: `${stats.averageScore}/100`, icon: "sparkle", color: "var(--adm-gold)" },
  ];

  return (
    <div className="adm-content">
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">SEO</h1>
          <p className="adm-sub">Référencement naturel de la boutique — sans API payante</p>
        </div>
        <Link href="/admin/products" className="adm-btn gold" style={{ textDecoration: "none" }}>
          <Icon name="tag" size={15} /> Gérer les produits
        </Link>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {cards.map((c) => (
          <div
            key={c.label}
            className="adm-card"
            style={{ flex: "1 1 180px", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.color}18`, display: "grid", placeItems: "center" }}>
              <Icon name={c.icon as "check"} size={18} color={c.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--adm-ink)" }}>{loading ? "…" : c.value}</div>
              <div style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card adm-list-card">
        <div className="adm-list-card-head">
          <div style={{ fontSize: 14, fontWeight: 700 }}>Produits à corriger</div>
          <div style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>
            {stats.total} produit{stats.total > 1 ? "s" : ""} au total
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--adm-ink-mute)" }}>Chargement…</div>
        ) : stats.needsWork.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#2F9E68", fontWeight: 600 }}>
            Tous les produits ont un score SEO satisfaisant.
          </div>
        ) : (
          stats.needsWork.slice(0, 20).map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 20px",
                borderBottom: "1px solid var(--adm-border-2)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 2 }}>
                  {!p.metaDescription?.trim() && "Meta manquante · "}
                  {!p.imageAlt?.trim() && "Alt manquant · "}
                  {!p.seoTitle?.trim() && "Titre SEO manquant"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span
                  style={{
                    fontWeight: 800,
                    color: seoLevelColor(p.score >= 70 ? "good" : p.score >= 40 ? "medium" : "poor"),
                  }}
                >
                  {p.score}/100
                </span>
                <Link href="/admin/products" className="adm-btn ghost sm" style={{ textDecoration: "none" }}>
                  Corriger
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
