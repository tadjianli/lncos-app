"use client";

import type { SocialProofNotification } from "@/lib/social-proof";

function compactCopy(notification: SocialProofNotification): { line1: string; line2: string } {
  const { type, customerName, productName, rating } = notification;

  switch (type) {
    case "purchase":
      return { line1: "🛒 Achat récent", line2: productName };
    case "review": {
      const stars = rating ?? 5;
      return {
        line1: `⭐ ${customerName}`,
        line2: `Avis ${stars}★ • ${productName}`,
      };
    }
    case "favorite":
      return { line1: `❤️ ${customerName}`, line2: productName };
    case "cart":
      return { line1: `🛍️ ${customerName}`, line2: productName };
    default:
      return { line1: customerName, line2: productName };
  }
}

export function SocialProofToast({
  notification,
  visible,
  bottomOffsetPx,
}: {
  notification: SocialProofNotification | null;
  visible: boolean;
  bottomOffsetPx: number;
}) {
  if (!notification) return null;

  const { line1, line2 } = compactCopy(notification);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sp-toast${visible ? " sp-toast--visible" : " sp-toast--hidden"}`}
      style={{ bottom: `${bottomOffsetPx}px` }}
    >
      <div className="sp-toast__card">
        <div className="sp-toast__line1">{line1}</div>
        <div className="sp-toast__line2">{line2}</div>
      </div>
    </div>
  );
}
