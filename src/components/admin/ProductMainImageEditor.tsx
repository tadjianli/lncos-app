"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { uploadProductImage } from "@/lib/admin-media";

interface ProductMainImageEditorProps {
  productId: string;
  imageUrl: string | null;
  onChange: (url: string | null) => void;
}

export function ProductMainImageEditor({
  productId,
  imageUrl,
  onChange,
}: ProductMainImageEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canUpload = Boolean(productId?.trim());
  const displayUrl = previewUrl ?? imageUrl;

  async function handleFile(file: File | null) {
    if (!file) return;
    if (!canUpload) {
      setError("Définissez d'abord l'identifiant produit (généré depuis le nom)");
      return;
    }

    setUploading(true);
    setError(null);

    const blob = URL.createObjectURL(file);
    setPreviewUrl(blob);

    const { url, error: err } = await uploadProductImage(file, productId);
    URL.revokeObjectURL(blob);
    setPreviewUrl(null);

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
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const dropzoneDisabled = !canUpload || uploading;

  return (
    <div className="adm-main-image-editor">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="adm-image-input"
        disabled={dropzoneDisabled}
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      <div
        className={`adm-gallery-dropzone adm-gallery-dropzone--compact adm-main-image-dropzone${uploading ? " is-loading" : ""}${dropzoneDisabled ? " is-disabled" : ""}`}
        onDragOver={(e) => !dropzoneDisabled && e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !dropzoneDisabled && inputRef.current?.click()}
        role="button"
        tabIndex={dropzoneDisabled ? -1 : 0}
        aria-disabled={dropzoneDisabled}
        onKeyDown={(e) => e.key === "Enter" && !dropzoneDisabled && inputRef.current?.click()}
      >
        <Icon name="plus" size={16} color="var(--adm-gold)" />
        <div className="adm-gallery-dropzone-title">
          {uploading
            ? "Optimisation & envoi…"
            : displayUrl
              ? "Remplacer l'image principale"
              : "Glisser-déposer ou cliquer"}
        </div>
        <div className="adm-gallery-dropzone-sub">
          1 image · JPG, PNG, WebP · max 10 Mo · converti en WebP
        </div>
        {!canUpload && (
          <div className="adm-gallery-dropzone-hint">
            Saisissez le nom du produit pour générer l&apos;identifiant de stockage
          </div>
        )}
      </div>

      {error && <div className="adm-gallery-error">{error}</div>}

      {displayUrl && (
        <div className="adm-main-image-preview" aria-label="Aperçu image principale">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayUrl} alt="Aperçu image principale" />
          <div className="adm-main-image-preview-actions">
            <button
              type="button"
              className="adm-btn ghost sm"
              onClick={() => !uploading && inputRef.current?.click()}
              disabled={uploading || !canUpload}
            >
              <Icon name="edit" size={14} /> Remplacer
            </button>
            <button
              type="button"
              className="adm-btn ghost sm danger"
              onClick={removeImage}
              disabled={uploading}
            >
              <Icon name="trash" size={14} /> Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
