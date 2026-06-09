"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { isImageUrl, uploadAdminImage } from "@/lib/admin-media";

interface AdminImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  helpText?: string;
}

export function AdminImageUpload({
  value,
  onChange,
  label = "Image",
  folder = "sections",
  helpText,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const { url, error: err } = await uploadAdminImage(file, folder);
    setUploading(false);
    if (err || !url) {
      setError(err ?? "Échec de l'upload");
      return;
    }
    onChange(url);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  const hasPreview = isImageUrl(value);

  return (
    <div className="adm-image-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="adm-image-input"
        onChange={onInputChange}
      />

      {hasPreview ? (
        <div className="adm-image-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} />
          <div className="adm-image-preview-actions">
            <button
              type="button"
              className="adm-btn ghost sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Icon name="edit" size={14} />
              Remplacer
            </button>
            <button
              type="button"
              className="adm-btn ghost sm"
              disabled={uploading}
              onClick={() => onChange("")}
              style={{ color: "var(--tone-pink)" }}
            >
              <Icon name="trash" size={14} />
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="adm-image-dropzone"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <div className="adm-image-dropzone-icon">
            <Icon name="plus" size={22} color="var(--adm-gold)" />
          </div>
          <div className="adm-image-dropzone-title">
            {uploading ? "Envoi en cours…" : `Téléverser ${label.toLowerCase()}`}
          </div>
          <div className="adm-image-dropzone-sub">JPG, PNG, WebP ou GIF · max 5 Mo</div>
        </button>
      )}

      {error && (
        <div style={{ fontSize: 11.5, color: "var(--tone-pink)", marginTop: 6 }}>{error}</div>
      )}
      {helpText && !error && (
        <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 6 }}>{helpText}</div>
      )}
    </div>
  );
}
