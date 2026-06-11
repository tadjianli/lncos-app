"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePublicProducts } from "@/lib/client-supabase";
import { useSocialProofNotifications } from "@/lib/social-proof-db";
import { useSocialProofBottomOffset } from "@/lib/use-social-proof-bottom-offset";
import { SocialProofToast } from "@/components/social-proof/SocialProofToast";
import {
  SOCIAL_PROOF_DISPLAY_MS,
  pickNextNotificationIndex,
  randomPauseMs,
  shuffleNotifications,
  type SocialProofEventType,
  type SocialProofNotification,
} from "@/lib/social-proof";

export function SocialProofRotator({ navVisible }: { navVisible: boolean }) {
  const { products } = usePublicProducts();
  const productList = useMemo(
    () => products.map((p) => ({ id: p.id, name: p.name })),
    [products]
  );
  const { notifications, settings, loading } = useSocialProofNotifications(productList);
  const bottomOffsetPx = useSocialProofBottomOffset(navVisible);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const queue = useMemo(
    () => shuffleNotifications(notifications),
    [notifications]
  );

  const current: SocialProofNotification | null =
    queue.length > 0 ? queue[index % queue.length] : null;

  const lastTypeRef = useRef<SocialProofEventType | null>(null);
  const lastIndexRef = useRef(-1);

  const anyEnabled =
    settings.purchaseNotifications ||
    settings.reviewNotifications ||
    settings.favoriteNotifications ||
    settings.cartNotifications;

  useEffect(() => {
    if (loading || !anyEnabled || queue.length === 0) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timers.push(t);
      });

    void (async () => {
      await sleep(randomPauseMs(2200, 4200));

      while (!cancelled) {
        const nextIndex = pickNextNotificationIndex(
          queue,
          lastTypeRef.current,
          lastIndexRef.current
        );
        const next = queue[nextIndex];

        lastTypeRef.current = next?.type ?? null;
        lastIndexRef.current = nextIndex;
        setIndex(nextIndex);
        setVisible(true);

        await sleep(SOCIAL_PROOF_DISPLAY_MS);
        if (cancelled) break;

        setVisible(false);
        await sleep(randomPauseMs());
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      setVisible(false);
    };
  }, [loading, anyEnabled, queue]);

  if (!anyEnabled || queue.length === 0) return null;

  return (
    <div className="sp-toast-layer" aria-hidden={!visible}>
      <SocialProofToast
        notification={current}
        visible={visible}
        bottomOffsetPx={bottomOffsetPx}
      />
    </div>
  );
}
