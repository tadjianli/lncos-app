"use client";

import { Icon } from "@/components/shared/Icon";
import { useProductReviews } from "@/lib/client-supabase";
import type { PublicReview } from "@/lib/reviews";

function Stars({
  rating,
  size = 14,
  muted = false,
}: {
  rating: number;
  size?: number;
  muted?: boolean;
}) {
  const filled = muted ? "var(--ink-mute)" : "var(--gold)";
  const empty = muted ? "var(--charcoal-3)" : "var(--charcoal-3)";
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[0, 1, 2, 3, 4].map((s) => (
        <Icon
          key={s}
          name="star"
          size={size}
          color={s < Math.round(rating) ? filled : empty}
          fill={s < Math.round(rating) ? filled : empty}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  const initials = review.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article
      style={{
        padding: "16px 0",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
        {review.authorPhotoUrl ? (
          <img
            src={review.authorPhotoUrl}
            alt=""
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(212,175,55,.15)",
              display: "grid",
              placeItems: "center",
              color: "var(--gold)",
              fontWeight: 800,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{review.name}</span>
            {review.verified && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "var(--tone-green, #2F9E68)",
                  background: "rgba(47,158,104,.12)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                <Icon name="check" size={10} stroke={3} /> Achat vérifié
              </span>
            )}
            {review.pinned && (
              <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600 }}>Épinglé</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Stars rating={review.rating} size={12} />
            <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{review.date}</span>
          </div>
        </div>
      </div>

      {review.title && (
        <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
          {review.title}
        </h4>
      )}

      <p style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-soft)" }}>
        {review.text}
      </p>

      {review.images && review.images.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {review.images.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function ReviewStars({
  rating,
  size = 14,
  muted = false,
}: {
  rating: number;
  size?: number;
  muted?: boolean;
}) {
  return <Stars rating={rating} size={size} muted={muted} />;
}

export function ProductReviewsSummary({
  productId,
  fallbackRating,
  fallbackCount,
  onViewReviews,
}: {
  productId: string;
  fallbackRating: number;
  fallbackCount: number;
  onViewReviews: () => void;
}) {
  const { loading, count, avg } = useProductReviews(productId);
  const displayCount = count > 0 ? count : fallbackCount;
  const displayAvg = count > 0 ? avg : fallbackRating;
  if (!loading && displayCount === 0) return null;

  return (
    <button
      type="button"
      onClick={onViewReviews}
      className="pd-reviews-summary"
    >
      <ReviewStars rating={displayAvg} size={11} muted />
      <span className="pd-reviews-summary__score">{displayAvg.toFixed(1)}</span>
      <span className="pd-reviews-summary__count">({displayCount} avis)</span>
      <span className="pd-reviews-summary__link">
        Voir les avis
        <Icon name="chevD" size={12} color="var(--ink-mute)" />
      </span>
    </button>
  );
}

export function ProductReviewsSection({
  productId,
  fallbackRating,
  fallbackCount,
  sectionId = "product-reviews",
}: {
  productId: string;
  fallbackRating: number;
  fallbackCount: number;
  sectionId?: string;
}) {
  const { reviews, loading, count, avg } = useProductReviews(productId);
  const displayCount = count > 0 ? count : fallbackCount;
  const displayAvg = count > 0 ? avg : fallbackRating;
  if (!loading && reviews.length === 0 && fallbackCount === 0) return null;

  return (
    <section id={sectionId} style={{ marginTop: 28, paddingTop: 8, scrollMarginTop: 80 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>Avis clients</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars rating={displayAvg} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>{displayAvg.toFixed(1)}</span>
          <span style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>({displayCount} avis)</span>
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--ink-mute)" }}>Chargement des avis…</p>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-mute)" }}>Aucun avis publié pour le moment.</p>
      ) : (
        <div>{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</div>
      )}
    </section>
  );
}
