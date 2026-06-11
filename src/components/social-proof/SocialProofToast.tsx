"use client";

import { formatSocialProofCopy, type SocialProofNotification } from "@/lib/social-proof";

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

  const { line1, line2 } = formatSocialProofCopy(notification);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sp-toast${visible ? " sp-toast--visible" : " sp-toast--hidden"}`}
      style={{ bottom: `${bottomOffsetPx}px` }}
    >
      <div className="sp-toast__card">
        <p className="sp-toast__line1">{line1}</p>
        {line2 ? <p className="sp-toast__line2">{line2}</p> : null}
      </div>
    </div>
  );
}
