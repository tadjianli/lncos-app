"use client";

import type { SocialProofNotification, SocialProofEventType } from "@/lib/social-proof";

const META: Record<SocialProofEventType, { emoji: string; line1: (n: string) => string; line3?: string }> = {
  purchase: {
    emoji: "🛒",
    line1: (n) => `${n} vient d'acheter`,
  },
  review: {
    emoji: "⭐",
    line1: (n) => `${n} vient de laisser`,
    line3: "un avis 5 étoiles",
  },
  favorite: {
    emoji: "❤️",
    line1: (n) => `${n} vient d'ajouter`,
    line3: "à ses favoris",
  },
  cart: {
    emoji: "🛍️",
    line1: (n) => `${n} vient d'ajouter`,
    line3: "à son panier",
  },
};

export function SocialProofToast({
  notification,
  visible,
  bottomOffset,
}: {
  notification: SocialProofNotification | null;
  visible: boolean;
  bottomOffset: string;
}) {
  if (!notification) return null;
  const meta = META[notification.type];
  const stars =
    notification.type === "review"
      ? notification.rating
        ? `un avis ${notification.rating} étoile${notification.rating > 1 ? "s" : ""}`
        : "un avis 5 étoiles"
      : meta.line3;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        left: "max(12px, env(safe-area-inset-left, 0px))",
        bottom: bottomOffset,
        maxWidth: 300,
        zIndex: 74,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity .45s ease, transform .45s cubic-bezier(.22,.68,0,1)",
      }}
    >
      <div
        style={{
          background: "rgba(14,14,16,.94)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 14,
          padding: "12px 14px",
          boxShadow: "0 16px 40px -12px rgba(0,0,0,.65)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.35 }}>
          <span style={{ marginRight: 6 }}>{meta.emoji}</span>
          {meta.line1(notification.customerName)}
        </div>
        {notification.type === "review" && (
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
            {stars ?? "un avis 5 étoiles"}
          </div>
        )}
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>
          {notification.type === "review" ? (
            <>sur : {notification.productName}</>
          ) : (
            notification.productName
          )}
        </div>
        {meta.line3 && notification.type !== "review" && (
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>{meta.line3}</div>
        )}
        <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 6 }}>{notification.timeAgo}</div>
      </div>
    </div>
  );
}
