"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { uploadProductImage, isImageUrl } from "@/lib/admin-media";

export interface GalleryItem {
  id: string;
  url: string;
}

interface ProductImageGalleryEditorProps {
  productId: string;
  mainImageUrl: string | null;
  galleryImages: string[];
  onMainChange: (url: string | null) => void;
  onGalleryChange: (urls: string[]) => void;
}

function toItems(main: string | null, gallery: string[]): GalleryItem[] {
  const urls: string[] = [];
  if (main) urls.push(main);
  for (const g of gallery) {
    if (g && !urls.includes(g)) urls.push(g);
  }
  return urls.map((url, i) => ({ id: `img-${i}-${url.slice(-12)}`, url }));
}

export function ProductImageGalleryEditor({
  productId,
  mainImageUrl,
  galleryImages,
  onMainChange,
  onGalleryChange,
}: ProductImageGalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const items = toItems(mainImageUrl, galleryImages);

  function syncFromItems(next: GalleryItem[], newMain?: string | null) {
    const urls = next.map((i) => i.url);
    const main = newMain !== undefined ? newMain : (mainImageUrl && urls.includes(mainImageUrl) ? mainImageUrl : urls[0] ?? null);
    onMainChange(main);
    onGalleryChange(urls.filter((u) => u !== main));
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || !productId || productId === "__new__") {
      setError("Enregistrez d'abord le produit ou définissez un identifiant");
      return;
    }
    setUploading(true);
    setError(null);
    const next = [...items];

    for (const file of Array.from(fileList)) {
      const { url, error: err } = await uploadProductImage(file, productId);
      if (err || !url) {
        setError(err ?? "Upload échoué");
        continue;
      }
      next.push({ id: `img-${Date.now()}-${Math.random()}`, url });
    }

    if (next.length > items.length) {
      const main = mainImageUrl ?? next[0]?.url ?? null;
      syncFromItems(next, main);
    }
    setUploading(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    void handleFiles(e.dataTransfer.files);
  }

  function removeItem(id: string) {
    const next = items.filter((i) => i.id !== id);
    syncFromItems(next, next[0]?.url ?? null);
  }

  function setAsMain(url: string) {
    onMainChange(url);
    onGalleryChange(items.map((i) => i.url).filter((u) => u !== url));
  }

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((i) => i.id === dragId);
    const to = items.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) return;
    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    syncFromItems(reordered);
  }

  const canUpload = productId && productId !== "__new__";

  return (
    <div className="adm-product-gallery">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="adm-image-input"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <div
        className={`adm-gallery-dropzone${uploading ? " is-loading" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => canUpload && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && canUpload && inputRef.current?.click()}
      >
        <Icon name="plus" size={22} color="var(--adm-gold)" />
        <div className="adm-gallery-dropzone-title">
          {uploading ? "Optimisation & envoi…" : "Glisser-déposer ou cliquer"}
        </div>
        <div className="adm-gallery-dropzone-sub">JPG, PNG, WebP · max 10 Mo · converti en WebP</div>
        {!canUpload && (
          <div className="adm-gallery-dropzone-hint">L&apos;identifiant produit sera généré à la création</div>
        )}
      </div>

      {error && <div className="adm-gallery-error">{error}</div>}

      {items.length > 0 && (
        <div className="adm-gallery-grid">
          {items.map((item) => {
            const isMain = item.url === mainImageUrl || (!mainImageUrl && item === items[0]);
            return (
              <div
                key={item.id}
                className={`adm-gallery-thumb${isMain ? " is-main" : ""}`}
                draggable
                onDragStart={() => onDragStart(item.id)}
                onDragOver={(e) => onDragOver(e, item.id)}
                onDragEnd={() => setDragId(null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" />
                {isMain && <span className="adm-gallery-badge">Principale</span>}
                <div className="adm-gallery-thumb-actions">
                  {!isMain && (
                    <button type="button" className="adm-gallery-act" title="Définir principale" onClick={() => setAsMain(item.url)}>
                      <Icon name="star" size={13} />
                    </button>
                  )}
                  <button type="button" className="adm-gallery-act danger" title="Supprimer" onClick={() => removeItem(item.id)}>
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mainImageUrl && isImageUrl(mainImageUrl) && (
        <div className="adm-gallery-main-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mainImageUrl} alt="Aperçu principale" />
        </div>
      )}
    </div>
  );
}
