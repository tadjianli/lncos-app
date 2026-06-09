"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import { useBeforeAfterResultsAdmin, useProductReviewsAdmin } from "@/lib/admin-supabase";
import type { BeforeAfterResult } from "@/lib/before-after";
import { formatResultDuration } from "@/lib/before-after";
import type { BeforeAfterFormValues } from "@/lib/before-after";
import { Icon } from "@/components/shared/Icon";
import { BeforeAfterFormModal } from "@/components/admin/BeforeAfterFormModal";

export function ProductBeforeAfterPanel({ product }: { product: Product }) {
  const { results, createResult, updateResult, deleteResult } = useBeforeAfterResultsAdmin();
  const { reviews } = useProductReviewsAdmin();

  const productResults = useMemo(
    () => results.filter((r) => r.productId === product.id),
    [results, product.id]
  );

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product.id).map((r) => ({ id: r.id, authorName: r.authorName })),
    [reviews, product.id]
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BeforeAfterResult | null>(null);

  async function saveResult(values: BeforeAfterFormValues, resultId?: string) {
    const payload: Partial<BeforeAfterResult> = {
      productId: product.id,
      reviewId: values.reviewId,
      beforeImageUrl: values.beforeImageUrl,
      afterImageUrl: values.afterImageUrl,
      description: values.description,
      resultDuration: values.resultDuration,
      resultDurationCustom: values.resultDurationCustom || null,
      featured: values.featured,
      pinned: values.pinned,
    };

    if (resultId) {
      const { error } = await updateResult(resultId, payload);
      return error;
    }
    const { error } = await createResult(payload);
    return error ?? null;
  }

  return (
    <div>
      <div className="adm-form-section-title">Résultats Avant / Après</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--adm-ink-soft)" }}>
          <strong>{productResults.length}</strong> résultat{productResults.length !== 1 ? "s" : ""}
        </span>
        <button type="button" className="adm-btn gold sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Icon name="plus" size={14} /> Ajouter un résultat
        </button>
      </div>

      {productResults.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--adm-ink-mute)", margin: 0 }}>Aucun résultat pour ce produit.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {productResults.map((r) => (
            <div
              key={r.id}
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid var(--adm-border-2)",
                background: "var(--adm-surface-2)",
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <img src={r.beforeImageUrl} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
                <img src={r.afterImageUrl} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                    {r.description || "Sans description"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--adm-ink-mute)" }}>
                    {formatResultDuration(r.resultDuration, r.resultDurationCustom)}
                    {r.authorName ? ` · ${r.authorName}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {r.featured && <span className="adm-badge" style={{ background: "rgba(194,85,122,.1)", color: "var(--tone-pink)" }}>Vedette</span>}
                    {r.pinned && <span className="adm-badge" style={{ background: "rgba(212,175,55,.12)", color: "var(--adm-gold)" }}>Épinglé</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" className="adm-btn sm" onClick={() => { setEditing(r); setShowForm(true); }}>Modifier</button>
                <button type="button" className="adm-btn sm" onClick={() => updateResult(r.id, { featured: !r.featured })}>
                  {r.featured ? "Retirer vedette" : "Mettre en avant"}
                </button>
                <button type="button" className="adm-btn sm" onClick={() => updateResult(r.id, { pinned: !r.pinned })}>
                  {r.pinned ? "Désépingler" : "Épingler"}
                </button>
                <button
                  type="button"
                  className="adm-btn sm"
                  style={{ color: "#FF7070" }}
                  onClick={() => { if (confirm("Supprimer ce résultat ?")) deleteResult(r.id); }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BeforeAfterFormModal
          product={product}
          result={editing}
          reviews={productReviews}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={saveResult}
        />
      )}
    </div>
  );
}
