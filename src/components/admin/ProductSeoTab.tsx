"use client";

import type { Product } from "@/lib/data";
import { Icon } from "@/components/shared/Icon";
import {
  computeProductSeoScore,
  generateSeoFieldsFromProduct,
  generateSeoSlugFromName,
  seoLevelColor,
  seoLevelLabel,
  slugifySeo,
} from "@/lib/seo";

interface ProductSeoTabProps {
  form: Product;
  onChange: <K extends keyof Product>(key: K, val: Product[K]) => void;
}

export function ProductSeoTab({ form, onChange }: ProductSeoTabProps) {
  const score = computeProductSeoScore(form);

  function fillSeoFields() {
    if (!form.name.trim()) return;
    const generated = generateSeoFieldsFromProduct(form.name);
    onChange("seoKeyword", generated.seoKeyword);
    onChange("seoTitle", generated.seoTitle);
    onChange("metaDescription", generated.metaDescription);
    onChange("imageAlt", generated.imageAlt);
    if (!form.seoSlug?.trim()) {
      onChange("seoSlug", generated.seoSlug);
    }
  }

  function generateSlug() {
    if (!form.name.trim()) return;
    onChange("seoSlug", generateSeoSlugFromName(form.name));
  }

  return (
    <div>
      <div
        className="adm-card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          border: `1px solid ${seoLevelColor(score.level)}33`,
          background: `${seoLevelColor(score.level)}0d`,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--adm-ink-mute)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Score SEO
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: seoLevelColor(score.level) }}>{score.score}</span>
            <span style={{ fontSize: 14, color: "var(--adm-ink-mute)" }}>/ 100</span>
          </div>
        </div>
        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: seoLevelColor(score.level),
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {seoLevelLabel(score.level)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <button type="button" className="adm-btn ghost sm" onClick={generateSlug} disabled={!form.name.trim()}>
          <Icon name="tag" size={14} />
          Générer le slug
        </button>
        <button type="button" className="adm-btn gold sm" onClick={fillSeoFields} disabled={!form.name.trim()}>
          <Icon name="sparkle" size={14} />
          Remplir les champs SEO
        </button>
      </div>

      {([
        { label: "Mot-clé principal", key: "seoKeyword" as const, placeholder: "palette contouring professionnelle" },
        { label: "SEO Title", key: "seoTitle" as const, placeholder: "Palette Contouring Professionnelle | LN COS" },
        { label: "URL Slug", key: "seoSlug" as const, placeholder: "palette-contouring-professionnelle" },
        { label: "Alt image", key: "imageAlt" as const, placeholder: "Palette contouring professionnelle LN COS" },
      ] as const).map(({ label, key, placeholder }) => (
        <div key={key} className="ab-field">
          <label>{label}</label>
          <input
            className="ab-input"
            value={form[key] ?? ""}
            onChange={(e) =>
              onChange(
                key,
                key === "seoSlug" ? slugifySeo(e.target.value) : e.target.value
              )
            }
            placeholder={placeholder}
          />
        </div>
      ))}

      <div className="ab-field">
        <label>Meta Description</label>
        <textarea
          className="ab-input textarea"
          rows={3}
          value={form.metaDescription ?? ""}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          placeholder="Découvrez la palette contouring professionnelle LN COS. Livraison rapide à La Réunion."
        />
        <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 4 }}>
          {(form.metaDescription ?? "").length} caractères · idéal 120–160
        </div>
      </div>

      <div className="adm-form-section-title" style={{ marginTop: 8 }}>Analyse automatique</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {score.checks.map((check) => (
          <div
            key={check.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              color: check.ok ? "#2F9E68" : "var(--adm-ink-mute)",
            }}
          >
            <Icon name={check.ok ? "check" : "x"} size={14} color={check.ok ? "#2F9E68" : "var(--adm-ink-mute)"} />
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}
