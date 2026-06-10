"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicProducts } from "@/lib/client-supabase";
import { useSocialProofNotifications } from "@/lib/social-proof-db";
import { useSocialProofBottomOffset } from "@/lib/use-social-proof-bottom-offset";
import { SocialProofToast } from "@/components/social-proof/SocialProofToast";
import type { SocialProofNotification } from "@/lib/social-proof";

export function SocialProofRotator({ navVisible }: { navVisible: boolean }) {
  const { products } = usePublicProducts();
  const productList = useMemo(() => products.map((p) => ({ id: p.id, name: p.name })), [products]);
  const { notifications, settings, loading } = useSocialProofNotifications(productList);
  const bottomOffsetPx = useSocialProofBottomOffset(navVisible);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const queue = notifications;
  const current: SocialProofNotification | null =
    queue.length > 0 ? queue[index % queue.length] : null;

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
      await sleep(2000);
      let i = 0;
      const displayMs = Math.min(settings.notificationDurationMs || 3000, 3000);
      while (!cancelled) {
        setIndex(i % queue.length);
        setVisible(true);
        await sleep(displayMs);
        if (cancelled) break;
        setVisible(false);
        const pause = Math.max(500, settings.rotationIntervalSec * 1000 - displayMs);
        await sleep(pause);
        i += 1;
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      setVisible(false);
    };
  }, [
    loading,
    anyEnabled,
    queue.length,
    settings.rotationIntervalSec,
    settings.notificationDurationMs,
  ]);

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
