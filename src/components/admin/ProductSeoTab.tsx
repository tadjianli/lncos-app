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
  seoLevelColor,
  seoLevelLabel,
  slugifySeo,
  type SeoLevel,
} from "@/lib/seo";
import type { ProductSeoAnalysisResult } from "@/lib/seo-claude";
import { buildProductSchemaOrg } from "@/lib/seo-schema";
import { useLegalSettings } from "@/lib/legal-settings-db";
import { useProductReviews } from "@/lib/client-supabase";

function getClientSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://www.lncos.fr";
}

interface ProductSeoTabProps {
  form: Product;
  onChange: <K extends keyof Product>(key: K, val: Product[K]) => void;
  categoryName?: string;
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

function scoreToLevel(s: number): SeoLevel {
  if (s >= 95) return "excellent";
  if (s >= 80) return "good";
  if (s >= 50) return "medium";
  return "poor";
}

function applySeoPatch(
  patch: Partial<Product>,
  onChange: ProductSeoTabProps["onChange"],
) {
  if (patch.seoKeyword !== undefined) onChange("seoKeyword", patch.seoKeyword);
  if (patch.seoSecondaryKeywords !== undefined) onChange("seoSecondaryKeywords", patch.seoSecondaryKeywords);
  if (patch.seoTitle !== undefined) onChange("seoTitle", patch.seoTitle);
  if (patch.metaDescription !== undefined) onChange("metaDescription", patch.metaDescription);
  if (patch.imageAlt !== undefined) onChange("imageAlt", patch.imageAlt);
  if (patch.seoSlug !== undefined) onChange("seoSlug", patch.seoSlug);
}

export function ProductSeoTab({ form, onChange, categoryName }: ProductSeoTabProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductSeoAnalysisResult | null>(null);
  const [predictedScore, setPredictedScore] = useState<number | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const { settings: legalSettings } = useLegalSettings();
  const { reviews, count: reviewCount } = useProductReviews(form.id !== "__new__" ? form.id : "");

  const seoReviews = useMemo(
    () =>
      reviews.map((r) => ({
        body: r.text,
        rating: r.rating,
        title: r.title,
        authorName: r.name,
        verified: r.verified,
      })),
    [reviews],
  );

  const score = computeProductSeoScore(form);
  const google = getGooglePreview(form, getClientSiteUrl(), legalSettings.deliveryZones);
  const seoFilename = generateSeoImageFilename(form.seoKeyword || form.name);
  const descWords = countWords(form.desc);
  const hasImage = hasProductImage(form);
  const secondaryKw = form.seoSecondaryKeywords?.filter((k) => k.trim()) ?? [];

  const schemaOrg = useMemo(
    () =>
      buildProductSchemaOrg(
        {
          id: form.id,
          name: form.name,
          desc: form.desc,
          seoExcerpt: form.seoExcerpt,
          metaDescription: form.metaDescription,
          seoKeyword: form.seoKeyword,
          seoSecondaryKeywords: form.seoSecondaryKeywords,
          seoSlug: form.seoSlug,
          imageAlt: form.imageAlt,
          price: form.price,
          stock: form.stock,
          rating: form.rating,
          reviews: form.reviews,
          mainImageUrl: form.mainImageUrl,
          imageUrl: form.imageUrl,
          galleryImages: form.galleryImages,
          extraSections: form.extraSections,
        },
        seoReviews,
      ),
    [form, seoReviews],
  );

  async function runAnalyze() {
    if (!form.name.trim()) return;
    setAnalyzing(true);
    setAiError(null);
    setAiMessage(null);
    try {
      const res = await fetch("/api/admin/ai/seo-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", product: form, categoryName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Analyse SEO impossible");
      }
      setAnalysis(json.analysis);
      setPredictedScore(null);
      setAiMessage(`Analyse Claude · ${json.model}${json.costEur != null ? ` · ${Number(json.costEur).toFixed(4)} €` : ""}`);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erreur analyse SEO");
    } finally {
      setAnalyzing(false);
    }
  }

  async function runOptimize() {
    if (!form.name.trim()) return;
    setOptimizing(true);
    setAiError(null);
    setAiMessage(null);
    try {
      const res = await fetch("/api/admin/ai/seo-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "optimize", product: form, categoryName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Optimisation SEO impossible");
      }
      applySeoPatch(json.patch, onChange);
      setPredictedScore(json.predictedScore ?? null);
      setAiMessage(`Métadonnées SEO mises à jour (Claude · ${json.model}) — le contenu produit n'a pas été modifié.`);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erreur optimisation SEO");
    } finally {
      setOptimizing(false);
    }
  }

  const displayScore = analysis?.score ?? score.score;
  const displayLevel = analysis?.score != null ? scoreToLevel(analysis.score) : score.level;

  return (
    <div>
      <div
        className="adm-card"
        style={{
          padding: 16,
          marginBottom: 16,
          border: `1px solid ${seoLevelColor(displayLevel)}33`,
          background: `${seoLevelColor(displayLevel)}0d`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--adm-ink-mute)", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Score SEO {analysis ? "(Claude)" : ""}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: seoLevelColor(displayLevel) }}>{displayScore}</span>
              <span style={{ fontSize: 14, color: "var(--adm-ink-mute)" }}>/ 100</span>
            </div>
          </div>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              background: seoLevelColor(displayLevel),
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {seoLevelLabel(displayLevel)}
          </div>
        </div>

        {predictedScore != null && predictedScore !== score.score && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 14,
              background: `${seoLevelColor(scoreToLevel(predictedScore))}14`,
              border: `1px solid ${seoLevelColor(scoreToLevel(predictedScore))}33`,
              fontSize: 12.5,
            }}
          >
            <Icon name="sparkle" size={15} color={seoLevelColor(scoreToLevel(predictedScore))} />
            <span>
              Score prévisionnel après optimisation des métadonnées :{" "}
              <strong style={{ color: seoLevelColor(scoreToLevel(predictedScore)) }}>
                {predictedScore}/100
              </strong>
            </span>
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

      <div
        style={{
          padding: "12px 14px",
          borderRadius: 10,
          marginBottom: 14,
          background: "var(--adm-bg)",
          border: "1px solid var(--adm-border)",
          fontSize: 12.5,
          lineHeight: 1.55,
          color: "var(--adm-ink-soft)",
        }}
      >
        <strong style={{ color: "var(--adm-ink)" }}>Assistant SEO Claude</strong>
        {" — "}
        Analyse votre fiche produit en lecture seule. Les descriptions et contenus marketing ne sont jamais modifiés automatiquement.
        {reviewCount > 0 ? ` ${reviewCount} avis client(s) pris en compte dans l'analyse locale.` : ""}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <button
          type="button"
          className="adm-btn gold sm"
          onClick={() => void runAnalyze()}
          disabled={!form.name.trim() || analyzing || optimizing}
        >
          <Icon name="search" size={14} />
          {analyzing ? "Analyse en cours…" : "Analyser le SEO"}
        </button>
        <button
          type="button"
          className="adm-btn sm"
          onClick={() => void runOptimize()}
          disabled={!form.name.trim() || analyzing || optimizing}
          title="Génère uniquement les métadonnées SEO (titre, meta, mots-clés, slug, alt)"
          style={{
            background: "linear-gradient(135deg, #1B7F4E 0%, #2F9E68 100%)",
            color: "#fff",
            border: "none",
          }}
        >
          <Icon name="sparkle" size={14} />
          {optimizing ? "Optimisation…" : "Optimiser le SEO"}
        </button>
        <button type="button" className="adm-btn ghost sm" onClick={() => setShowPreview(true)} disabled={!form.name.trim()}>
          <Icon name="eye" size={14} />
          Aperçu SEO
        </button>
        <button
          type="button"
          className="adm-btn ghost sm"
          onClick={() => setShowSchema((v) => !v)}
          disabled={!schemaOrg.length}
        >
          <Icon name="eye" size={14} />
          Schema.org
        </button>
      </div>

      {aiError && (
        <div style={{ fontSize: 12.5, color: "var(--tone-pink)", marginBottom: 12 }}>{aiError}</div>
      )}
      {aiMessage && (
        <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginBottom: 12 }}>{aiMessage}</div>
      )}

      {analysis && (
        <div className="adm-card" style={{ padding: 16, marginBottom: 16 }}>
          <div className="adm-form-section-title" style={{ marginTop: 0 }}>Résultat de l&apos;analyse Claude</div>

          {analysis.strengths.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2F9E68", marginBottom: 6 }}>Points forts</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
                {analysis.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.weaknesses.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tone-pink)", marginBottom: 6 }}>Points à améliorer</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
                {analysis.weaknesses.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendations.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--adm-ink)", marginBottom: 6 }}>Recommandations</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
                {analysis.recommendations.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 10, marginBottom: 0 }}>
                Ces recommandations ne sont pas appliquées automatiquement — vous restez maître du contenu produit.
              </p>
            </div>
          )}
        </div>
      )}

      {showSchema && schemaOrg.length ? (
        <div className="adm-card" style={{ padding: 14, marginBottom: 16 }}>
          <div className="adm-form-section-title" style={{ marginTop: 0 }}>Schema.org (aperçu)</div>
          <pre
            style={{
              fontSize: 11,
              overflow: "auto",
              maxHeight: 280,
              padding: 12,
              borderRadius: 8,
              background: "var(--adm-bg)",
              margin: 0,
            }}
          >
            {JSON.stringify(schemaOrg, null, 2)}
          </pre>
        </div>
      ) : null}

      <div style={{ marginBottom: 20 }}>
        <GooglePreview preview={google} />
      </div>

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
        <label>Mots-clés secondaires</label>
        <textarea
          className="ab-input textarea"
          rows={2}
          value={secondaryKw.join(", ")}
          onChange={(e) =>
            onChange(
              "seoSecondaryKeywords",
              e.target.value
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
            )
          }
          placeholder="cils magnétiques 30ml, maquillage LN COS, acheter cils magnétiques"
        />
        <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 4 }}>
          Séparez par des virgules — minimum 3 pour le score SEO optimal.
        </div>
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
          placeholder={`Découvrez ${form.name || "votre produit"} chez LN COS.`}
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
        <label>Description courte SEO (extrait)</label>
        <textarea
          className="ab-input textarea"
          rows={2}
          value={form.seoExcerpt ?? ""}
          onChange={(e) => onChange("seoExcerpt", e.target.value)}
          placeholder="Texte court unique pour cartes et extraits — distinct de la meta description."
        />
        <SeoLengthBar
          label="Longueur extrait"
          length={(form.seoExcerpt ?? "").length}
          displayMax={200}
          idealMin={120}
          idealMax={200}
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

      <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 16 }}>
        Description produit : <strong>{descWords} mots</strong>
        {" · "}
        objectif 350–500 mots (minimum 300)
        {!hasImage && (
          <span style={{ display: "block", marginTop: 4 }}>
            Ajoutez une image produit pour améliorer le score SEO.
          </span>
        )}
        {descWords > 0 && descWords < 300 && (
          <span style={{ color: "#C2557A", display: "block", marginTop: 4 }}>
            Description courte — enrichissez manuellement votre contenu marketing pour le référencement.
          </span>
        )}
      </div>

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
