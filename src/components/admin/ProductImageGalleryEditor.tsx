"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { uploadProductImage } from "@/lib/admin-media";

export const MAX_PRODUCT_IMAGES = 5;

export interface GalleryItem {
  id: string;
  url: string;
  pending?: boolean;
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
  return urls.slice(0, MAX_PRODUCT_IMAGES).map((url, i) => ({
    id: `img-${i}-${url.slice(-16)}`,
    url,
  }));
}

function orderedUrls(items: GalleryItem[]): string[] {
  return items
    .filter((i) => !i.pending && i.url && !i.url.startsWith("blob:"))
    .map((i) => i.url);
}

export function ProductImageGalleryEditor({
  productId,
  mainImageUrl,
  galleryImages,
  onMainChange,
  onGalleryChange,
}: ProductImageGalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<GalleryItem[]>(() => toItems(mainImageUrl, galleryImages));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (syncingRef.current) return;
    setItems(toItems(mainImageUrl, galleryImages));
  }, [mainImageUrl, galleryImages, productId]);

  const syncToParent = useCallback(
    (next: GalleryItem[]) => {
      const urls = orderedUrls(next);
      onMainChange(urls[0] ?? null);
      onGalleryChange(urls.slice(1));
    },
    [onMainChange, onGalleryChange]
  );

  const applyItems = useCallback(
    (next: GalleryItem[]) => {
      setItems(next);
      syncToParent(next);
    },
    [syncToParent]
  );

  const canUpload = Boolean(productId?.trim());
  const atMax = items.length >= MAX_PRODUCT_IMAGES;
  const mainUrl = mainImageUrl ?? items[0]?.url ?? null;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    if (!canUpload) {
      setError("Définissez d'abord l'identifiant produit (généré depuis le nom)");
      return;
    }
    if (atMax) {
      setError(`Maximum ${MAX_PRODUCT_IMAGES} images par produit`);
      return;
    }

    setUploading(true);
    setError(null);
    syncingRef.current = true;

    const slotsLeft = MAX_PRODUCT_IMAGES - items.length;
    const files = Array.from(fileList).slice(0, slotsLeft);
    let working = [...items];

    for (const file of files) {
      if (working.length >= MAX_PRODUCT_IMAGES) break;

      const previewUrl = URL.createObjectURL(file);
      const pendingId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      working = [...working, { id: pendingId, url: previewUrl, pending: true }];
      setItems(working);

      const { url, error: err } = await uploadProductImage(file, productId);
      URL.revokeObjectURL(previewUrl);

      if (err || !url) {
        working = working.filter((i) => i.id !== pendingId);
        setItems(working);
        setError(err ?? "Upload échoué");
        continue;
      }

      working = working.map((i) =>
        i.id === pendingId ? { id: `img-${Date.now()}-${url.slice(-8)}`, url } : i
      );
      setItems(working);
      syncToParent(working);
    }

    syncingRef.current = false;
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (atMax || !canUpload) return;
    void handleFiles(e.dataTransfer.files);
  }

  function removeItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (item?.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
    const next = items.filter((i) => i.id !== id);
    applyItems(next);
  }

  function selectAsMain(id: string) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx <= 0) return;
    const next = [...items];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    applyItems(next);
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
    applyItems(reordered);
  }

  const dropzoneDisabled = !canUpload || atMax || uploading;

  return (
    <div className="adm-product-gallery">
      <div className="adm-gallery-toolbar">
        <span className="adm-gallery-counter">
          {items.length} / {MAX_PRODUCT_IMAGES} images
        </span>
        {mainUrl && items.length > 0 && (
          <span className="adm-gallery-main-hint">La 1<sup>re</sup> miniature = image principale</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="adm-image-input"
        disabled={dropzoneDisabled}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <div
        className={`adm-gallery-dropzone${uploading ? " is-loading" : ""}${dropzoneDisabled ? " is-disabled" : ""}`}
        onDragOver={(e) => !dropzoneDisabled && e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !dropzoneDisabled && inputRef.current?.click()}
        role="button"
        tabIndex={dropzoneDisabled ? -1 : 0}
        aria-disabled={dropzoneDisabled}
        onKeyDown={(e) => e.key === "Enter" && !dropzoneDisabled && inputRef.current?.click()}
      >
        <Icon name="plus" size={22} color="var(--adm-gold)" />
        <div className="adm-gallery-dropzone-title">
          {uploading
            ? "Optimisation & envoi…"
            : atMax
              ? "Limite de 5 images atteinte"
              : "Glisser-déposer ou cliquer"}
        </div>
        <div className="adm-gallery-dropzone-sub">
          JPG, PNG, WebP · max 10 Mo · converti en WebP
        </div>
        {!canUpload && (
          <div className="adm-gallery-dropzone-hint">
            Saisissez le nom du produit pour générer l&apos;identifiant de stockage
          </div>
        )}
      </div>

      {error && <div className="adm-gallery-error">{error}</div>}

      <div className="adm-gallery-strip" aria-label="Galerie produit">
        {Array.from({ length: MAX_PRODUCT_IMAGES }).map((_, slot) => {
          const item = items[slot];
          if (!item) {
            return (
              <div
                key={`slot-${slot}`}
                className={`adm-gallery-slot-empty${!canUpload || atMax ? " is-inactive" : ""}`}
                aria-hidden
              />
            );
          }

          const isMain =
            item.url === mainUrl ||
            (!mainImageUrl && slot === 0) ||
            items[0]?.id === item.id;

          return (
            <div
              key={item.id}
              className={`adm-gallery-thumb${isMain ? " is-main" : ""}${item.pending ? " is-pending" : ""}`}
              draggable={!item.pending}
              onDragStart={() => !item.pending && onDragStart(item.id)}
              onDragOver={(e) => onDragOver(e, item.id)}
              onDragEnd={() => setDragId(null)}
            >
              <button
                type="button"
                className="adm-gallery-thumb-select"
                onClick={() => selectAsMain(item.id)}
                aria-label={isMain ? "Image principale" : `Définir ${item.url} comme principale`}
                disabled={item.pending || isMain}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" />
              </button>

              {isMain && <span className="adm-gallery-badge">Principale</span>}
              {item.pending && <span className="adm-gallery-badge adm-gallery-badge--pending">Envoi…</span>}

              <div className="adm-gallery-thumb-actions">
                <button
                  type="button"
                  className="adm-gallery-act danger"
                  title="Supprimer"
                  onClick={() => removeItem(item.id)}
                  disabled={item.pending && uploading}
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
