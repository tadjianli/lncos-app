"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { submitProductReview } from "@/lib/client-supabase";

interface ReviewSubmitModalProps {
  userId: string;
  authorName: string;
  orderId: string;
  productId: string;
  productName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function ReviewSubmitModal({
  userId,
  authorName,
  orderId,
  productId,
  productName,
  onClose,
  onSubmitted,
}: ReviewSubmitModalProps) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (body.trim().length < 10) {
      setError("Votre avis doit contenir au moins 10 caractères.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: err } = await submitProductReview({
      userId,
      orderId,
      productId,
      productName,
      authorName,
      rating,
      body,
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    onSubmitted();
    onClose();
  }

  return (
    <div
      className="safe-area-layout safe-area-layout--top safe-area-layout--bottom safe-area-layout--left safe-area-layout--right"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(0,0,0,.72)",
        display: "grid",
        placeItems: "center",
        padding: 20,
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--charcoal)",
          borderRadius: "var(--r-lg)",
          border: "1px solid rgba(212,175,55,.22)",
          padding: "22px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>Votre avis</h3>
          <button type="button" onClick={onClose} className="touch-target" style={{ color: "var(--ink-mute)" }} aria-label="Fermer">
            <Icon name="x" size={20} />
          </button>
        </div>

        <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-soft)" }}>{productName}</p>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              style={{ padding: 2 }}
            >
              <Icon
                name="star"
                size={26}
                color={n <= rating ? "var(--gold)" : "var(--ink-mute)"}
                fill={n <= rating ? "var(--gold)" : "none"}
              />
            </button>
          ))}
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Partagez votre expérience avec ce produit…"
          rows={4}
          style={{
            width: "100%",
            resize: "vertical",
            minHeight: 100,
            padding: "12px 14px",
            borderRadius: "var(--r-md)",
            border: "1px solid rgba(255,255,255,.1)",
            background: "var(--noir)",
            color: "var(--ink)",
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        />

        {error && (
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#FF7070" }}>{error}</p>
        )}

        <p style={{ margin: "0 0 16px", fontSize: 11, color: "var(--ink-mute)" }}>
          Votre avis sera publié après validation par notre équipe.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: "100%",
            padding: "13px 18px",
            borderRadius: "var(--r-pill)",
            background: "var(--gold-grad)",
            color: "#1a1306",
            fontWeight: 700,
            fontSize: 14,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Envoi…" : "Envoyer mon avis"}
        </button>
      </div>
    </div>
  );
}
