"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import {
  DEFAULT_FLASH_SALES_COUNTDOWN,
  durationTotalSeconds,
  endAtRemainingSeconds,
  splitSeconds,
  type FlashSalesCountdown,
} from "@/lib/flash-countdown";

interface FlashSaleHeadProps {
  title?: string;
  countdown?: FlashSalesCountdown;
}

export function FlashSaleHead({
  title = "Ventes Flash",
  countdown = DEFAULT_FLASH_SALES_COUNTDOWN,
}: FlashSaleHeadProps) {
  const initialDuration = useMemo(
    () => durationTotalSeconds(countdown),
    [countdown.hours, countdown.minutes, countdown.seconds]
  );

  const [remaining, setRemaining] = useState(() => {
    if (!countdown.enabled) return 0;
    if (countdown.mode === "end_at" && countdown.endAt) {
      return endAtRemainingSeconds(countdown.endAt) ?? initialDuration;
    }
    return initialDuration;
  });

  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!countdown.enabled) return;

    if (countdown.mode === "end_at" && countdown.endAt) {
      const tick = () => {
        const left = endAtRemainingSeconds(countdown.endAt!);
        if (left == null) {
          setRemaining(0);
          setExpired(true);
          return;
        }
        setRemaining(left);
        setExpired(left <= 0);
      };
      tick();
      const t = setInterval(tick, 1000);
      return () => clearInterval(t);
    }

    setRemaining(initialDuration);
    setExpired(false);
    const t = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (countdown.onExpire === "reset") {
            return initialDuration;
          }
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [
    countdown.enabled,
    countdown.mode,
    countdown.endAt,
    countdown.onExpire,
    initialDuration,
  ]);

  const showTimer =
    countdown.enabled &&
    !(expired && countdown.onExpire === "hide");

  const displaySeconds =
    expired && countdown.onExpire === "zeros" ? 0 : remaining;

  const { h, m, s } = splitSeconds(displaySeconds);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flash-head">
      <h3 className="flash-head-title">
        <Icon
          name="flame"
          size={20}
          color="var(--gold)"
          fill="rgba(212,175,55,.25)"
        />
        {title}
      </h3>
      {showTimer && (
        <div className="flash-countdown" aria-label="Compte à rebours vente flash">
          {[h, m, s].map((v, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="flash-countdown-digit">{pad(v)}</span>
              {i < 2 && (
                <span style={{ color: "var(--ink-mute)", fontWeight: 700 }}>:</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
