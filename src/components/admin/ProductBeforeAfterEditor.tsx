"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/data";
import { Icon } from "@/components/shared/Icon";
import { BeforeAfterCompare } from "@/components/commerce/BeforeAfterCompare";
import { useBeforeAfterResultsAdmin } from "@/lib/admin-supabase";
import { isImageUrl, uploadBeforeAfterImage } from "@/lib/admin-media";

interface ProductBeforeAfterEditorProps {
  product: Product;
}

function pickPrimaryProductResult(
  results: ReturnType<typeof useBeforeAfterResultsAdmin>["results"],
  productId: string
) {
  const forProduct = results.filter((r) => r.productId === productId && !r.reviewId);
  if (forProduct.length === 0) return null;
  return forProduct.find((r) => r.pinned) ?? forProduct[0];
}

export function ProductBeforeAfterEditor({ product }: ProductBeforeAfterEditorProps) {
  const { results, createResult, updateResult, deleteResult, loading } = useBeforeAfterResultsAdmin();

  const primary = useMemo(
    () => pickPrimaryProductResult(results, product.id),
    [results, product.id]
  );

  const [beforeImageUrl, setBeforeImageUrl] = useState("");
  const [afterImageUrl, setAfterImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resultId, setResultId] = useState<string | null>(null);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  const uploadFolder = `products/${product.id}/before-after`;

  useEffect(() => {
    if (primary) {
      setBeforeImageUrl(primary.beforeImageUrl);
      setAfterImageUrl(primary.afterImageUrl);
      setTitle(primary.title ?? "");
      setDescription(primary.description ?? "");
      setResultId(primary.id);
    } else {
      setBeforeImageUrl("");
      setAfterImageUrl("");
      setTitle("");
      setDescription("");
      setResultId(null);
    }
  }, [primary?.id, primary?.updatedAt, primary?.beforeImageUrl, primary?.afterImageUrl, primary?.title, primary?.description]);

  async function upload(file: File, kind: "before" | "after") {
    const setBusy = kind === "before" ? setUploadingBefore : setUploadingAfter;
    setBusy(true);
    setError(null);
    const { url, error: uploadError } = await uploadBeforeAfterImage(file, `${uploadFolder}/${kind}`);
    setBusy(false);
    if (uploadError) {
      setError(uploadError);
      return;
    }
    if (url) {
      if (kind === "before") setBeforeImageUrl(url);
      else setAfterImageUrl(url);
    }
  }

  async function handleSave() {
    if (!beforeImageUrl.trim() || !afterImageUrl.trim()) {
      setError("Les deux images (avant et après) sont requises.");
      return;
    }
    setSaving(true);
    setError(null);
    setStatus(null);

    const payload = {
      productId: product.id,
      reviewId: null as string | null,
      beforeImageUrl: beforeImageUrl.trim(),
      afterImageUrl: afterImageUrl.trim(),
      title: title.trim() || null,
      description: description.trim(),
      resultDuration: "2_weeks" as const,
      resultDurationCustom: null,
      featured: true,
      pinned: true,
    };

    if (resultId) {
      const { error: saveError } = await updateResult(resultId, payload);
      setSaving(false);
      if (saveError) {
        setError(saveError);
        return;
      }
      setStatus("Photos avant / après enregistrées.");
      return;
    }

    const { error: createError } = await createResult(payload);
    setSaving(false);
    if (createError) {
      setError(createError);
      return;
    }
    setStatus("Photos avant / après enregistrées.");
  }

  async function handleRemove() {
    if (!resultId) {
      setBeforeImageUrl("");
      setAfterImageUrl("");
      setTitle("");
      setDescription("");
      return;
    }
    if (!confirm("Supprimer les photos avant / après de ce produit ?")) return;
    const { error: delError } = await deleteResult(resultId);
    if (delError) {
      setError(delError);
      return;
    }
    setStatus("Section supprimée.");
    setResultId(null);
    setBeforeImageUrl("");
    setAfterImageUrl("");
    setTitle("");
    setDescription("");
  }

  const canPreview = isImageUrl(beforeImageUrl) && isImageUrl(afterImageUrl);

  return (
    <div>
      <div className="adm-form-section-title">Photos avant / après</div>
      <p className="adm-form-section-desc">
        Comparateur glissé sur la fiche produit (si le bloc est activé dans le Product Builder).
      </p>

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--adm-ink-mute)" }}>Chargement…</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div className="ab-field" style={{ margin: 0 }}>
              <label>Image avant</label>
              {isImageUrl(beforeImageUrl) && (
                <img
                  src={beforeImageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 8,
                    border: "1px solid var(--adm-border-2)",
                  }}
                />
              )}
              <button
                type="button"
                className="adm-btn sm"
                disabled={uploadingBefore}
                onClick={() => beforeRef.current?.click()}
              >
                {uploadingBefore ? "Upload…" : beforeImageUrl ? "Remplacer" : "Choisir une image"}
              </button>
              <input
                ref={beforeRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f, "before");
                  e.target.value = "";
                }}
              />
            </div>

            <div className="ab-field" style={{ margin: 0 }}>
              <label>Image après</label>
              {isImageUrl(afterImageUrl) && (
                <img
                  src={afterImageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 8,
                    border: "1px solid var(--adm-border-2)",
                  }}
                />
              )}
              <button
                type="button"
                className="adm-btn sm"
                disabled={uploadingAfter}
                onClick={() => afterRef.current?.click()}
              >
                {uploadingAfter ? "Upload…" : afterImageUrl ? "Remplacer" : "Choisir une image"}
              </button>
              <input
                ref={afterRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f, "after");
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="ab-field">
            <label>Titre (optionnel)</label>
            <input
              className="ab-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Résultat après 3 semaines"
            />
          </div>

          <div className="ab-field">
            <label>Description (optionnelle)</label>
            <textarea
              className="ab-input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Courte légende sous le comparateur"
              rows={3}
            />
          </div>

          {canPreview && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--adm-gold)",
                  marginBottom: 8,
                }}
              >
                Aperçu en direct
              </div>
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid var(--adm-border-2)",
                  background: "var(--adm-surface-2)",
                }}
              >
                <BeforeAfterCompare beforeUrl={beforeImageUrl} afterUrl={afterImageUrl} />
                {title.trim() && (
                  <p style={{ margin: "12px 0 4px", fontSize: 14, fontWeight: 700, color: "var(--adm-ink)" }}>
                    {title.trim()}
                  </p>
                )}
                {description.trim() && (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--adm-ink-soft)", lineHeight: 1.45 }}>
                    {description.trim()}
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontSize: 13, color: "#c0392b", margin: "0 0 12px" }}>{error}</p>
          )}
          {status && (
            <p style={{ fontSize: 13, color: "var(--adm-ink-soft)", margin: "0 0 12px" }}>{status}</p>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="adm-btn gold sm"
              disabled={saving || !beforeImageUrl || !afterImageUrl}
              onClick={() => void handleSave()}
            >
              <Icon name="check" size={14} />
              {saving ? "Enregistrement…" : "Enregistrer la section"}
            </button>
            {(resultId || beforeImageUrl || afterImageUrl) && (
              <button type="button" className="adm-btn ghost sm" onClick={() => void handleRemove()}>
                Supprimer
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
