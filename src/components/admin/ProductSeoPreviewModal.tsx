"use client";

import type { Product } from "@/lib/data";
import { Icon } from "@/components/shared/Icon";
import { resolveProductImage } from "@/lib/product-catalog";
import {
  computeProductSeoScore,
  generateSeoImageFilename,
  getGooglePreview,
  getProductSeoPath,
  seoLevelColor,
  seoLevelLabel,
} from "@/lib/seo";
import { GooglePreview } from "@/components/admin/GooglePreview";

function getClientSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://lncos.re";
}

interface ProductSeoPreviewModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductSeoPreviewModal({ product, onClose }: ProductSeoPreviewModalProps) {
  const score = computeProductSeoScore(product);
  const siteUrl = getClientSiteUrl();
  const google = getGooglePreview(product, siteUrl);
  const image = resolveProductImage(product);
  const seoFilename = generateSeoImageFilename(product.seoKeyword || product.name);
  const canonical = `${siteUrl}${getProductSeoPath(product)}`;

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal ab-modal-wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Aperçu SEO — {product.name}</div>
          <button className="adm-iconbtn" onClick={onClose} aria-label="Fermer">
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="ab-modal-scroll" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image}
                alt={product.imageAlt ?? product.name}
                style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12, flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: "linear-gradient(165deg,#2a2228,#1a1618)",
                  border: "1px solid rgba(212,175,55,.2)",
                }}
                aria-hidden
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>{product.name}</h2>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--adm-gold)", marginBottom: 8 }}>
                {product.price.toFixed(2)} €
              </div>
              <p style={{ fontSize: 13, color: "var(--adm-ink-soft)", lineHeight: 1.55, margin: 0 }}>
                {(product.desc || "Aucune description renseignée.").slice(0, 280)}
                {(product.desc?.length ?? 0) > 280 ? "…" : ""}
              </p>
            </div>
          </div>

          <GooglePreview preview={google} />

          <div className="adm-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--adm-ink-mute)", marginBottom: 10 }}>
              Balises SEO
            </div>
            <dl style={{ margin: 0, fontSize: 12.5, display: "grid", gap: 8 }}>
              {[
                ["Canonical", canonical],
                ["Slug", product.seoSlug || "—"],
                ["Mot-clé", product.seoKeyword || "—"],
                ["Alt image", product.imageAlt || "—"],
                ["Fichier image SEO", seoFilename],
                ["Open Graph", product.seoTitle || product.name],
                ["Twitter Card", "summary_large_image"],
                ["Schema.org", "Product + Offer"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 8 }}>
                  <dt style={{ color: "var(--adm-ink-mute)", fontWeight: 600 }}>{k}</dt>
                  <dd style={{ margin: 0, wordBreak: "break-word" }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 12,
              background: `${seoLevelColor(score.level)}12`,
              border: `1px solid ${seoLevelColor(score.level)}33`,
            }}
          >
            <span style={{ fontWeight: 700 }}>Score SEO actuel</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: seoLevelColor(score.level) }}>
              {score.score}/100 — {seoLevelLabel(score.level)}
            </span>
          </div>
        </div>

        <div className="ab-modal-foot">
          <button type="button" className="adm-btn ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
