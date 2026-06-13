"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import { Icon } from "@/components/shared/Icon";
import { GooglePreview } from "@/components/admin/GooglePreview";
import { ProductSeoPreviewModal } from "@/components/admin/ProductSeoPreviewModal";
import { SeoLengthBar } from "@/components/admin/SeoLengthBar";
import {
  computeProductSeoScore,
  countWords,
  generateSeoImageFilename,
  getGooglePreview,
  hasProductImage,
  optimizeProductSeo,
  previewProductSeoOptimization,
  seoLevelColor,
  seoLevelLabel,
  slugifySeo,
  type SeoOptimizeMode,
} from "@/lib/seo";

function getClientSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://www.lncos.fr";
}

interface ProductSeoTabProps {
  form: Product;
  onChange: <K extends keyof Product>(key: K, val: Product[K]) => void;
}

const BREAKDOWN_LABELS: Record<keyof ReturnType<typeof computeProductSeoScore>["breakdown"], string> = {
  title: "Titre SEO",
  meta: "Meta Description",
  slug: "Slug",
  alt: "Alt Image",
  description: "Description Produit",
  keyword: "Mot-clé principal",
  images: "Images",
};

function applyOptimization(
  result: NonNullable<ReturnType<typeof optimizeProductSeo>>,
  onChange: ProductSeoTabProps["onChange"]
) {
  onChange("seoKeyword", result.seoKeyword);
  onChange("seoTitle", result.seoTitle);
  onChange("metaDescription", result.metaDescription);
  onChange("imageAlt", result.imageAlt);
  onChange("seoSlug", result.seoSlug);
  onChange("desc", result.desc);
  onChange("benefits", result.benefits);
  onChange("extraSections", result.extraSections);
}

export function ProductSeoTab({ form, onChange }: ProductSeoTabProps) {
  const [showPreview, setShowPreview] = useState(false);
  const score = computeProductSeoScore(form);
  const previewStandard = useMemo(
    () => previewProductSeoOptimization(form, "standard"),
    [form]
  );
  const previewMaximal = useMemo(
    () => previewProductSeoOptimization(form, "maximal"),
    [form]
  );
  const google = getGooglePreview(form, getClientSiteUrl());
  const seoFilename = generateSeoImageFilename(form.seoKeyword || form.name);
  const descWords = countWords(form.desc);
  const hasImage = hasProductImage(form);

  function runOptimization(mode: SeoOptimizeMode) {
    if (!form.name.trim()) return;
    const result = optimizeProductSeo(form, mode);
    if (!result) return;
    applyOptimization(result, onChange);
  }

  const preview = previewMaximal;
  const canReach95 = preview ? preview.predictedScore >= 95 : false;

  return (
    <div>
      {/* Score actuel + prévisionnel */}
      <div
        className="adm-card"
        style={{
          padding: 16,
          marginBottom: 16,
          border: `1px solid ${seoLevelColor(score.level)}33`,
          background: `${seoLevelColor(score.level)}0d`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--adm-ink-mute)", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Score SEO professionnel
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: seoLevelColor(score.level) }}>{score.score}</span>
              <span style={{ fontSize: 14, color: "var(--adm-ink-mute)" }}>/ 100</span>
            </div>
          </div>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              background: seoLevelColor(score.level),
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {seoLevelLabel(score.level)}
          </div>
        </div>

        {preview && preview.predictedScore !== score.score && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 14,
              background: `${seoLevelColor(preview.predictedLevel)}14`,
              border: `1px solid ${seoLevelColor(preview.predictedLevel)}33`,
              fontSize: 12.5,
            }}
          >
            <Icon name="sparkle" size={15} color={seoLevelColor(preview.predictedLevel)} />
            <span>
              Score prévisionnel après optimisation :{" "}
              <strong style={{ color: seoLevelColor(preview.predictedLevel) }}>
                {preview.predictedScore}/100
              </strong>
              {!hasImage && (
                <span style={{ color: "var(--adm-ink-mute)", display: "block", marginTop: 4 }}>
                  Ajoutez une image produit pour dépasser 85/100 (bloc Images).
                </span>
              )}
            </span>
          </div>
        )}

        {preview && canReach95 && hasImage && score.score < 95 && (
          <div style={{ fontSize: 12, color: "#2F9E68", marginBottom: 12, fontWeight: 600 }}>
            L&apos;optimisation automatique peut atteindre {preview.predictedScore}/100 sans saisie manuelle.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
          {(Object.entries(score.breakdown) as [keyof typeof score.breakdown, number][]).map(([key, pts]) => (
            <div key={key} style={{ fontSize: 11.5, padding: "8px 10px", borderRadius: 8, background: "var(--adm-bg)" }}>
              <div style={{ color: "var(--adm-ink-mute)", marginBottom: 2 }}>{BREAKDOWN_LABELS[key]}</div>
              <div style={{ fontWeight: 800, color: "var(--adm-ink)" }}>{pts} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <button
          type="button"
          className="adm-btn gold sm"
          onClick={() => runOptimization("standard")}
          disabled={!form.name.trim()}
          title="Complète les champs SEO pour viser 95–100/100"
        >
          <Icon name="sparkle" size={14} />
          Optimiser automatiquement
        </button>
        <button
          type="button"
          className="adm-btn sm"
          onClick={() => runOptimization("maximal")}
          disabled={!form.name.trim()}
          title="Régénère tous les champs SEO manquants ou incomplets"
          style={{
            background: "linear-gradient(135deg, #1B7F4E 0%, #2F9E68 100%)",
            color: "#fff",
            border: "none",
          }}
        >
          <Icon name="bolt" size={14} />
          Optimisation SEO maximale
        </button>
        <button type="button" className="adm-btn ghost sm" onClick={() => setShowPreview(true)} disabled={!form.name.trim()}>
          <Icon name="eye" size={14} />
          Aperçu SEO
        </button>
      </div>

      {previewStandard && (
        <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginBottom: 16, lineHeight: 1.5 }}>
          Standard → <strong>{previewStandard.predictedScore}/100</strong>
          {" · "}
          Maximale → <strong>{previewMaximal?.predictedScore ?? "—"}/100</strong>
          {" · "}
          Description générée : {countWords(previewMaximal?.desc)} mots (min. 300)
        </div>
      )}

      {/* Google Preview — live */}
      <div style={{ marginBottom: 20 }}>
        <GooglePreview preview={google} />
      </div>

      {/* Fields */}
      <div className="ab-field">
        <label>Mot-clé principal</label>
        <input
          className="ab-input"
          value={form.seoKeyword ?? ""}
          onChange={(e) => onChange("seoKeyword", e.target.value)}
          placeholder="cils magnétiques réutilisables"
        />
      </div>

      <div className="ab-field">
        <label>SEO Title</label>
        <input
          className="ab-input"
          value={form.seoTitle ?? ""}
          onChange={(e) => onChange("seoTitle", e.target.value)}
          placeholder="Cils Magnétiques Réutilisables | LN COS"
        />
        <SeoLengthBar
          label="Longueur titre"
          length={(form.seoTitle ?? "").length}
          displayMax={60}
          idealMin={40}
          idealMax={60}
        />
      </div>

      <div className="ab-field">
        <label>URL Slug</label>
        <input
          className="ab-input"
          value={form.seoSlug ?? ""}
          onChange={(e) => onChange("seoSlug", slugifySeo(e.target.value))}
          placeholder="cils-magnetiques-reutilisables"
        />
      </div>

      <div className="ab-field">
        <label>Meta Description</label>
        <textarea
          className="ab-input textarea"
          rows={3}
          value={form.metaDescription ?? ""}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          placeholder="Découvrez nos cils magnétiques LN COS. Faciles à poser, réutilisables et confortables. Livraison rapide à La Réunion."
        />
        <SeoLengthBar
          label="Longueur meta"
          length={(form.metaDescription ?? "").length}
          displayMax={160}
          idealMin={140}
          idealMax={160}
        />
      </div>

      <div className="ab-field">
        <label>Alt image</label>
        <input
          className="ab-input"
          value={form.imageAlt ?? ""}
          onChange={(e) => onChange("imageAlt", e.target.value)}
          placeholder="Cils magnétiques réutilisables LN COS"
        />
      </div>

      {/* SEO Image */}
      <div className="adm-card" style={{ padding: 14, marginBottom: 18 }}>
        <div className="adm-form-section-title" style={{ marginTop: 0 }}>SEO Image</div>
        <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 8 }}>
          Nom de fichier recommandé pour l&apos;upload :
        </div>
        <code
          style={{
            display: "block",
            padding: "10px 12px",
            borderRadius: 8,
            background: "var(--adm-bg)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--adm-ink)",
            marginBottom: 10,
          }}
        >
          {seoFilename}
        </code>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {score.checks
            .filter((c) => c.id === "file-opt" || c.id === "file-kw")
            .map((check) => (
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

      {/* Description stats */}
      <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 16 }}>
        Description produit : <strong>{descWords} mots</strong>
        {" · "}
        objectif 350–500 mots (minimum 300)
        {descWords > 0 && descWords < 300 && (
          <span style={{ color: "#C2557A", display: "block", marginTop: 4 }}>
            Description trop courte — lancez l&apos;optimisation pour générer un texte complet.
          </span>
        )}
      </div>

      {/* Advanced analysis */}
      <div className="adm-form-section-title">Analyse SEO avancée</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
        {score.checks
          .filter((c) => !c.id.startsWith("file-"))
          .map((check) => (
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

      {showPreview && (
        <ProductSeoPreviewModal product={form} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
