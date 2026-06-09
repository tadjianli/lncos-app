"use client";

import { useState } from "react";
import type { Product } from "@/lib/data";
import type { BeforeAfterResult } from "@/lib/before-after";
import type { BeforeAfterFormValues } from "@/lib/before-after";
import { Icon } from "@/components/shared/Icon";
import { BeforeAfterFields } from "@/components/admin/BeforeAfterFields";

function emptyValues(productId: string): BeforeAfterFormValues {
  return {
    productId,
    reviewId: null,
    beforeImageUrl: "",
    afterImageUrl: "",
    description: "",
    resultDuration: "2_weeks",
    resultDurationCustom: "",
    featured: false,
    pinned: false,
    showBeforeAfter: true,
  };
}

function resultToValues(r: BeforeAfterResult): BeforeAfterFormValues {
  return {
    productId: r.productId,
    reviewId: r.reviewId,
    beforeImageUrl: r.beforeImageUrl,
    afterImageUrl: r.afterImageUrl,
    description: r.description,
    resultDuration: r.resultDuration,
    resultDurationCustom: r.resultDurationCustom ?? "",
    featured: r.featured,
    pinned: r.pinned,
    showBeforeAfter: true,
  };
}

export function BeforeAfterFormModal({
  product,
  result,
  reviews,
  onClose,
  onSave,
}: {
  product: Product;
  result?: BeforeAfterResult | null;
  reviews?: { id: string; authorName: string }[];
  onClose: () => void;
  onSave: (values: BeforeAfterFormValues, resultId?: string) => Promise<string | null>;
}) {
  const [form, setForm] = useState<BeforeAfterFormValues>(
    result ? resultToValues(result) : emptyValues(product.id)
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!form.beforeImageUrl || !form.afterImageUrl) return;
    setSaving(true);
    const err = await onSave({ ...form, productId: product.id }, result?.id);
    setSaving(false);
    if (!err) onClose();
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">{result ? "Modifier le résultat" : "Ajouter un résultat"}</div>
          <button className="adm-iconbtn" onClick={onClose} type="button"><Icon name="x" size={17} /></button>
        </div>

        <div className="ab-modal-scroll">
          <p className="adm-form-section-desc" style={{ marginTop: 0 }}>
            Produit : <strong>{product.name}</strong>
          </p>

          {reviews && reviews.length > 0 && (
            <div className="ab-field">
              <label>Associer à un avis (optionnel)</label>
              <select
                className="ab-input"
                value={form.reviewId ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, reviewId: e.target.value || null }))}
              >
                <option value="">— Aucun avis —</option>
                {reviews.map((r) => (
                  <option key={r.id} value={r.id}>{r.authorName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="adm-form-section-title">Résultat client</div>
          <BeforeAfterFields
            form={form}
            onChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
            uploadFolder={result?.id ?? product.id}
          />
        </div>

        <div className="ab-modal-foot">
          <button type="button" className="adm-btn ghost" onClick={onClose} disabled={saving}>Annuler</button>
          <button
            type="button"
            className="adm-btn gold"
            onClick={() => void handleSubmit()}
            disabled={saving || !form.beforeImageUrl || !form.afterImageUrl}
          >
            {saving ? "Enregistrement…" : result ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
