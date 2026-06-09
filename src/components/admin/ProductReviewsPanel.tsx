"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import {
  useBeforeAfterResultsAdmin,
  useProductReviewsAdmin,
  useProducts,
} from "@/lib/admin-supabase";
import type { ProductReview } from "@/lib/reviews";
import { REVIEW_STATUS_LABELS, formatReviewDate } from "@/lib/reviews";
import { Icon } from "@/components/shared/Icon";
import { ReviewFormModal, type ReviewFormValues } from "@/components/admin/ReviewFormModal";

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          size={12}
          color={i < n ? "var(--tone-gold)" : "var(--adm-border)"}
          fill={i < n ? "var(--tone-gold)" : "none"}
        />
      ))}
    </div>
  );
}

export function ProductReviewsPanel({ product }: { product: Product }) {
  const { products } = useProducts();
  const {
    reviews,
    updateReview,
    deleteReview,
    createReview,
    setReviewImages,
  } = useProductReviewsAdmin();
  const { getByReviewId, upsertForReview } = useBeforeAfterResultsAdmin();

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product.id),
    [reviews, product.id]
  );

  const published = productReviews.filter((r) => r.status === "published");
  const avg =
    published.length > 0
      ? published.reduce((s, r) => s + r.rating, 0) / published.length
      : product.rating;

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductReview | null>(null);

  async function saveReview(values: ReviewFormValues, reviewId?: string) {
    const patch: Partial<ProductReview> = {
      authorName: values.authorName,
      authorEmail: values.authorEmail || null,
      authorPhotoUrl: values.authorPhotoUrl,
      productId: values.productId || product.id,
      productName: values.productName || product.name,
      title: values.title,
      rating: values.rating,
      body: values.body,
      status: values.status,
      verified: values.verified,
      featured: values.featured,
      pinned: values.pinned,
      homepageFeatured: values.homepageFeatured,
      reviewDate: values.reviewDate,
    };

    const syncBeforeAfter = async (id: string) => {
      const ba = values.beforeAfter;
      if (!ba.showBeforeAfter) {
        await upsertForReview(id, product.id, null);
        return;
      }
      await upsertForReview(id, product.id, {
        beforeImageUrl: ba.beforeImageUrl,
        afterImageUrl: ba.afterImageUrl,
        description: ba.description,
        resultDuration: ba.resultDuration,
        resultDurationCustom: ba.resultDurationCustom || null,
        featured: ba.featured,
        pinned: ba.pinned,
      });
    };

    if (reviewId) {
      const { error } = await updateReview(reviewId, patch);
      if (error) return error;
      await setReviewImages(reviewId, values.imageUrls);
      await syncBeforeAfter(reviewId);
      return null;
    }

    const { review, error } = await createReview({ ...patch, productId: product.id, productName: product.name });
    if (error || !review) return error ?? "Erreur";
    if (values.imageUrls.length > 0) await setReviewImages(review.id, values.imageUrls);
    await syncBeforeAfter(review.id);
    return null;
  }

  return (
    <div>
      <div className="adm-form-section-title">Avis associés</div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "var(--adm-ink-soft)" }}>
          <strong style={{ color: "var(--adm-gold)" }}>{avg.toFixed(1)}</strong>
          {" · "}
          <strong>{published.length}</strong> avis publié{published.length !== 1 ? "s" : ""}
          {" · "}
          <strong>{productReviews.length}</strong> au total
        </div>
        <button type="button" className="adm-btn gold sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Icon name="plus" size={14} /> Ajouter un avis
        </button>
        <Link href="/admin/reviews" className="adm-btn sm" style={{ textDecoration: "none" }}>
          Voir tous les avis
        </Link>
      </div>

      {productReviews.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--adm-ink-mute)", margin: 0 }}>
          Aucun avis pour ce produit.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {productReviews.slice(0, 6).map((r) => {
            const st = REVIEW_STATUS_LABELS[r.status];
            return (
              <div
                key={r.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid var(--adm-border-2)",
                  background: "var(--adm-surface-2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{r.authorName}</span>
                    <Stars n={r.rating} />
                    <span className="adm-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    {r.pinned && <span className="adm-badge" style={{ background: "rgba(212,175,55,.12)", color: "var(--adm-gold)" }}>Épinglé</span>}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--adm-ink-mute)" }}>{formatReviewDate(r.reviewDate ?? r.createdAt)}</span>
                </div>
                {r.title && <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 4 }}>{r.title}</div>}
                <p style={{ fontSize: 12.5, color: "var(--adm-ink-soft)", margin: "0 0 10px", lineHeight: 1.45 }}>
                  {r.body.length > 140 ? `${r.body.slice(0, 140)}…` : r.body}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button type="button" className="adm-btn sm" onClick={() => { setEditing(r); setShowForm(true); }}>
                    Modifier
                  </button>
                  {r.status !== "published" && (
                    <button type="button" className="adm-btn sm" onClick={() => updateReview(r.id, { status: "published" })}>
                      Approuver
                    </button>
                  )}
                  <button type="button" className="adm-btn sm" onClick={() => updateReview(r.id, { pinned: !r.pinned })}>
                    {r.pinned ? "Désépingler" : "Épingler"}
                  </button>
                  <button
                    type="button"
                    className="adm-btn sm"
                    style={{ color: "#FF7070" }}
                    onClick={() => { if (confirm("Supprimer cet avis ?")) deleteReview(r.id); }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showForm || editing) && (
        <ReviewFormModal
          review={editing}
          products={products.length > 0 ? products : [product]}
          defaultProductId={product.id}
          initialBeforeAfter={editing ? getByReviewId(editing.id) : null}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={saveReview}
        />
      )}
    </div>
  );
}
