"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/data";
import { Icon } from "@/components/shared/Icon";
import { uploadProductImage } from "@/lib/admin-media";
import { ProductImageStorefrontPreview } from "@/components/admin/ProductImageStorefrontPreview";
import {
  fetchRemoteFileSize,
  formatFileSize,
  formatFromFilename,
  loadImageDimensions,
  parseFilenameFromUrl,
  type ImageMetadata,
} from "@/lib/image-metadata";

interface ProductMainImageEditorProps {
  productId: string;
  imageUrl: string | null;
  imageAlt?: string | null;
  product: Product;
  onChange: (url: string | null) => void;
}

const EMPTY_META: ImageMetadata = {
  filename: "—",
  format: "—",
  width: null,
  height: null,
  sizeBytes: null,
};

export function ProductMainImageEditor({
  productId,
  imageUrl,
  imageAlt,
  product,
  onChange,
}: ProductMainImageEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<ImageMetadata>(EMPTY_META);

  const canUpload = Boolean(productId?.trim());
  const displayUrl = previewUrl ?? imageUrl;

  const previewProduct: Product = {
    ...product,
    mainImageUrl: displayUrl,
    imageUrl: displayUrl,
  };

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      if (!displayUrl) {
        setMeta(EMPTY_META);
        return;
      }

      if (pendingFile && previewUrl?.startsWith("blob:")) {
        const dims = await loadImageDimensions(previewUrl);
        if (cancelled) return;
        setMeta({
          filename: pendingFile.name,
          format: formatFromFilename(pendingFile.name),
          width: dims?.width ?? null,
          height: dims?.height ?? null,
          sizeBytes: pendingFile.size,
        });
        return;
      }

      const filename = parseFilenameFromUrl(displayUrl);
      const dims = await loadImageDimensions(displayUrl);
      const sizeBytes = await fetchRemoteFileSize(displayUrl);
      if (cancelled) return;

      setMeta({
        filename,
        format: formatFromFilename(filename),
        width: dims?.width ?? null,
        height: dims?.height ?? null,
        sizeBytes,
      });
    }

    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, [displayUrl, pendingFile, previewUrl]);

  async function handleFile(file: File | null) {
    if (!file) return;
    if (!canUpload) {
      setError("Définissez d'abord l'identifiant produit (généré depuis le nom)");
      return;
    }

    setUploading(true);
    setError(null);
    setPendingFile(file);

    const blob = URL.createObjectURL(file);
    setPreviewUrl(blob);

    const { url, error: err } = await uploadProductImage(file, productId);
    URL.revokeObjectURL(blob);
    setPreviewUrl(null);
    setPendingFile(null);

    if (err || !url) {
      setError(err ?? "Upload échoué");
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onChange(url);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!canUpload || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function removeImage() {
    onChange(null);
    setPreviewUrl(null);
    setPendingFile(null);
    setError(null);
    setMeta(EMPTY_META);
    if (inputRef.current) inputRef.current.value = "";
  }

  const dropzoneDisabled = !canUpload || uploading;
  const dimensionsLabel =
    meta.width && meta.height ? `${meta.width} × ${meta.height} px` : "—";

  return (
    <div className="adm-main-image-editor adm-main-image-editor--compact">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="adm-image-input"
        disabled={dropzoneDisabled}
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      <div className="adm-main-image-row">
        <div
          className={`adm-main-image-thumb${uploading ? " is-loading" : ""}`}
          onClick={() => !dropzoneDisabled && inputRef.current?.click()}
          onDragOver={(e) => !dropzoneDisabled && e.preventDefault()}
          onDrop={onDrop}
          role="button"
          tabIndex={dropzoneDisabled ? -1 : 0}
          aria-label={displayUrl ? "Remplacer l'image principale" : "Ajouter l'image principale"}
          onKeyDown={(e) => e.key === "Enter" && !dropzoneDisabled && inputRef.current?.click()}
        >
          {displayUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={displayUrl} alt={imageAlt || "Aperçu produit"} />
          ) : (
            <div className="adm-main-image-thumb-empty">
              <Icon name="plus" size={22} color="var(--adm-gold)" />
              <span>150×150</span>
            </div>
          )}
        </div>

        <div className="adm-main-image-details">
          <dl className="adm-main-image-meta">
            <div>
              <dt>Fichier</dt>
              <dd>{meta.filename}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{meta.format}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>{dimensionsLabel}</dd>
            </div>
            <div>
              <dt>Poids</dt>
              <dd>{formatFileSize(meta.sizeBytes)}</dd>
            </div>
            <div>
              <dt>Texte ALT</dt>
              <dd>{imageAlt?.trim() || "—"}</dd>
            </div>
          </dl>

          <div className="adm-main-image-actions">
            <button
              type="button"
              className="adm-btn ghost sm"
              onClick={() => !uploading && inputRef.current?.click()}
              disabled={uploading || !canUpload}
            >
              <Icon name="edit" size={14} />
              {displayUrl ? "Remplacer" : "Ajouter"}
            </button>
            {displayUrl && (
              <button
                type="button"
                className="adm-btn ghost sm danger"
                onClick={removeImage}
                disabled={uploading}
              >
                <Icon name="trash" size={14} /> Supprimer
              </button>
            )}
          </div>

          <div className="adm-main-image-hint">
            JPG, PNG, WebP · max 4 Mo · converti en WebP
            {!canUpload && " · Saisissez le nom du produit pour l'identifiant"}
          </div>
        </div>
      </div>

      {error && <div className="adm-gallery-error">{error}</div>}
      {uploading && (
        <div className="adm-main-image-uploading">Optimisation & envoi en cours…</div>
      )}

      <ProductImageStorefrontPreview product={previewProduct} />
    </div>
  );
}
