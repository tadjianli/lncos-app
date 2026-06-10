"use client";

import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { useProducts } from "@/lib/admin-supabase";
import { computeSeoDashboardStats, seoLevelColor, seoLevelLabel } from "@/lib/seo";

export function SeoDashboardModule() {
  const { products, loading } = useProducts();
  const stats = computeSeoDashboardStats(products);

  const cards = [
    { label: "Produits optimisés (≥95)", value: stats.optimized, icon: "check", color: "#1B7F4E" },
    { label: "Sans description", value: stats.withoutDescription, icon: "info", color: "#C77A33" },
    { label: "Sans alt image", value: stats.withoutImageAlt, icon: "camera", color: "#C77A33" },
    { label: "Sans meta description", value: stats.withoutMetaDescription, icon: "tag", color: "#C2557A" },
    { label: "Sans image", value: stats.withoutImage, icon: "camera", color: "#C2557A" },
    { label: "Score SEO moyen", value: `${stats.averageScore}/100`, icon: "sparkle", color: "var(--adm-gold)" },
  ];

  return (
    <div className="adm-content">
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">SEO</h1>
          <p className="adm-sub">
            Assistant SEO e-commerce — Google Preview, scoring professionnel, sitemap &amp; schema.org
          </p>
        </div>
        <Link href="/admin/products" className="adm-btn gold" style={{ textDecoration: "none" }}>
          <Icon name="tag" size={15} /> Gérer les produits
        </Link>
      </div>

      <div className="adm-card" style={{ padding: 14, marginBottom: 16, fontSize: 12.5, color: "var(--adm-ink-soft)", lineHeight: 1.6 }}>
        <strong>Indexation automatique :</strong> sitemap.xml · robots.txt · canonical URLs · Open Graph · Twitter Cards · Schema.org Product.
        Compatible Google Search Console, Merchant Center et Rich Results.
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {cards.map((c) => (
          <div
            key={c.label}
            className="adm-card"
            style={{ flex: "1 1 160px", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}
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
            Triés par score croissant · {stats.total} produit{stats.total > 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--adm-ink-mute)" }}>Chargement…</div>
        ) : stats.needsWork.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#1B7F4E", fontWeight: 600 }}>
            Tous les produits ont un score SEO ≥ 95 — Excellent !
          </div>
        ) : (
          stats.needsWork.map((p) => (
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
                  {!p.desc?.trim() && "Description manquante · "}
                  {!p.mainImageUrl && !p.imageUrl && !(p.galleryImages?.length) && "Sans image · "}
                  {p.score < 95 && `Objectif : 95+`}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: `${seoLevelColor(p.level)}18`,
                    color: seoLevelColor(p.level),
                  }}
                >
                  {seoLevelLabel(p.level)}
                </span>
                <span style={{ fontWeight: 800, color: seoLevelColor(p.level) }}>
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
