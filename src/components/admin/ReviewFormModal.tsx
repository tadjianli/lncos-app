"use client";

import { useRef, useState } from "react";
import type { Product } from "@/lib/data";
import type { ProductReview, ReviewStatus } from "@/lib/reviews";
import { Icon } from "@/components/shared/Icon";
import { isImageUrl, uploadAdminImage, uploadReviewImage } from "@/lib/admin-media";

const MAX_REVIEW_PHOTOS = 5;

export interface ReviewFormValues {
  authorName: string;
  authorEmail: string;
  authorPhotoUrl: string | null;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  body: string;
  reviewDate: string;
  status: ReviewStatus;
  verified: boolean;
  featured: boolean;
  pinned: boolean;
  homepageFeatured: boolean;
  imageUrls: string[];
}

function emptyForm(products: Product[], defaultProductId?: string): ReviewFormValues {
  const product = products.find((p) => p.id === defaultProductId) ?? products[0];
  return {
    authorName: "",
    authorEmail: "",
    authorPhotoUrl: null,
    productId: product?.id ?? "",
    productName: product?.name ?? "",
    rating: 5,
    title: "",
    body: "",
    reviewDate: new Date().toISOString().slice(0, 10),
    status: "pending",
    verified: false,
    featured: false,
    pinned: false,
    homepageFeatured: false,
    imageUrls: [],
  };
}

function reviewToForm(review: ProductReview): ReviewFormValues {
  return {
    authorName: review.authorName,
    authorEmail: review.authorEmail ?? "",
    authorPhotoUrl: review.authorPhotoUrl,
    productId: review.productId ?? "",
    productName: review.productName,
    rating: review.rating,
    title: review.title,
    body: review.body,
    reviewDate: (review.reviewDate ?? review.createdAt).slice(0, 10),
    status: review.status,
    verified: review.verified,
    featured: review.featured,
    pinned: review.pinned,
    homepageFeatured: review.homepageFeatured,
    imageUrls: review.images.map((i) => i.imageUrl),
  };
}

export function ReviewFormModal({
  review,
  products,
  defaultProductId,
  onClose,
  onSave,
}: {
  review?: ProductReview | null;
  products: Product[];
  defaultProductId?: string;
  onClose: () => void;
  onSave: (values: ReviewFormValues, reviewId?: string) => Promise<string | null>;
}) {
  const isEdit = Boolean(review);
  const [form, setForm] = useState<ReviewFormValues>(
    review ? reviewToForm(review) : emptyForm(products, defaultProductId)
  );
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof ReviewFormValues>(key: K, val: ReviewFormValues[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function onProductChange(productId: string) {
    const product = products.find((p) => p.id === productId);
    setForm((p) => ({
      ...p,
      productId,
      productName: product?.name ?? "",
    }));
  }

  async function handleAuthorPhoto(file: File) {
    setUploadingPhoto(true);
    const folder = review?.id ? `avatars/${review.id}` : "avatars/pending";
    const { url, error } = await uploadAdminImage(file, folder, "review-images");
    setUploadingPhoto(false);
    if (error) return error;
    if (url) set("authorPhotoUrl", url);
    return null;
  }

  async function handleGalleryPhotos(files: FileList) {
    const remaining = MAX_REVIEW_PHOTOS - form.imageUrls.length;
    if (remaining <= 0) return "Maximum 5 photos par avis";
    const slice = Array.from(files).slice(0, remaining);
    setUploadingGallery(true);
    const folderId = review?.id ?? "pending";
    const newUrls: string[] = [];
    for (const file of slice) {
      const { url, error } = await uploadReviewImage(file, folderId);
      if (error) {
        setUploadingGallery(false);
        return error;
      }
      if (url) newUrls.push(url);
    }
    setForm((p) => ({ ...p, imageUrls: [...p.imageUrls, ...newUrls] }));
    setUploadingGallery(false);
    return null;
  }

  async function handleSubmit() {
    if (!form.authorName.trim()) return;
    if (!form.body.trim()) return;
    setSaving(true);
    const err = await onSave(
      {
        ...form,
        reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : new Date().toISOString(),
      },
      review?.id
    );
    setSaving(false);
    if (!err) onClose();
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal ab-modal-wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">{isEdit ? "Modifier l'avis" : "Ajouter un avis"}</div>
          <button className="adm-iconbtn" onClick={onClose} type="button">
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="ab-modal-scroll">
          <div className="ab-field">
            <label>Auteur</label>
            <input
              className="ab-input"
              value={form.authorName}
              onChange={(e) => set("authorName", e.target.value)}
              placeholder="Prénom N."
            />
          </div>

          <div className="ab-field">
            <label>Email (optionnel)</label>
            <input
              className="ab-input"
              type="email"
              value={form.authorEmail}
              onChange={(e) => set("authorEmail", e.target.value)}
            />
          </div>

          <div className="ab-field">
            <label>Photo client (optionnel)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {isImageUrl(form.authorPhotoUrl) ? (
                <img
                  src={form.authorPhotoUrl!}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--adm-gold-bg)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--adm-gold)",
                    fontWeight: 700,
                  }}
                >
                  {form.authorName[0] || "?"}
                </div>
              )}
              <button
                type="button"
                className="adm-btn sm"
                disabled={uploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                {uploadingPhoto ? "Upload…" : "Choisir une photo"}
              </button>
              {form.authorPhotoUrl && (
                <button type="button" className="adm-btn sm ghost" onClick={() => set("authorPhotoUrl", null)}>
                  Retirer
                </button>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleAuthorPhoto(f);
                e.target.value = "";
              }}
            />
          </div>

          <div className="ab-field">
            <label>Produit associé</label>
            <select
              className="ab-input"
              value={form.productId}
              onChange={(e) => onProductChange(e.target.value)}
            >
              <option value="">— Aucun produit —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="ab-field">
            <label>Note</label>
            <select
              className="ab-input"
              value={form.rating}
              onChange={(e) => set("rating", Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>

          <div className="ab-field">
            <label>Titre de l&apos;avis</label>
            <input
              className="ab-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="ab-field">
            <label>Commentaire</label>
            <textarea
              className="ab-input textarea"
              rows={4}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
            />
          </div>

          <div className="ab-field">
            <label>Date personnalisée</label>
            <input
              className="ab-input"
              type="date"
              value={form.reviewDate}
              onChange={(e) => set("reviewDate", e.target.value)}
            />
          </div>

          <div className="ab-field">
            <label>Statut</label>
            <select
              className="ab-input"
              value={form.status}
              onChange={(e) => set("status", e.target.value as ReviewStatus)}
            >
              <option value="pending">En attente</option>
              <option value="published">Publié</option>
              <option value="rejected">Rejeté</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
            {([
              ["verified", "Achat vérifié"],
              ["featured", "Mis en avant"],
              ["pinned", "Épinglé"],
              ["homepageFeatured", "Afficher sur la page d'accueil"],
            ] as const).map(([key, label]) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="adm-form-section-title">Photos du client</div>
          <p className="adm-form-section-desc">JPG, PNG ou WebP — maximum {MAX_REVIEW_PHOTOS} photos.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            {form.imageUrls.map((url, i) => (
              <div key={url} style={{ position: "relative" }}>
                <img
                  src={url}
                  alt=""
                  style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => set("imageUrls", form.imageUrls.filter((_, j) => j !== i))}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#333",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {form.imageUrls.length < MAX_REVIEW_PHOTOS && (
            <button
              type="button"
              className="adm-btn sm"
              disabled={uploadingGallery}
              onClick={() => galleryInputRef.current?.click()}
            >
              {uploadingGallery ? "Upload…" : "+ Ajouter des photos"}
            </button>
          )}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) void handleGalleryPhotos(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div className="ab-modal-foot">
          <button type="button" className="adm-btn ghost" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button
            type="button"
            className="adm-btn gold"
            onClick={() => void handleSubmit()}
            disabled={saving || !form.authorName.trim() || !form.body.trim()}
          >
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer l'avis"}
          </button>
        </div>
      </div>
    </div>
  );
}
