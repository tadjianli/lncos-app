"use client";

import { Icon } from "@/components/shared/Icon";
import { useProductReviews } from "@/lib/client-supabase";
import type { PublicReview } from "@/lib/reviews";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[0, 1, 2, 3, 4].map((s) => (
        <Icon
          key={s}
          name="star"
          size={size}
          color={s < Math.round(rating) ? "var(--gold)" : "var(--charcoal-3)"}
          fill={s < Math.round(rating) ? "var(--gold)" : "var(--charcoal-3)"}
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

export function ProductReviewsSection({
  productId,
  fallbackRating,
  fallbackCount,
}: {
  productId: string;
  fallbackRating: number;
  fallbackCount: number;
}) {
  const { reviews, loading, count, avg } = useProductReviews(productId);
  const displayCount = count > 0 ? count : fallbackCount;
  const displayAvg = count > 0 ? avg : fallbackRating;
  if (!loading && reviews.length === 0 && fallbackCount === 0) return null;

  return (
    <section style={{ marginTop: 28, paddingTop: 8 }}>
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
