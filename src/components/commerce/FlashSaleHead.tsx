"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import {
  countdownUnitLabel,
  DEFAULT_FLASH_SALES_COUNTDOWN,
  durationTotalSeconds,
  endAtRemainingSeconds,
  getCountdownDisplayUnits,
  type FlashSalesCountdown,
} from "@/lib/flash-countdown";

interface FlashSaleHeadProps {
  title?: string;
  countdown?: FlashSalesCountdown;
}

function CountdownBlock({
  value,
  label,
  shortLabel,
}: {
  value: number;
  label: string;
  shortLabel: string;
}) {
  return (
    <span className="flash-countdown-block">
      <span className="flash-countdown-value" key={value}>
        {value}
      </span>
      <span className="flash-countdown-unit">{label}</span>
      <span className="flash-countdown-compact" aria-hidden>
        {value}
        {shortLabel}
      </span>
    </span>
  );
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

  const isExpiredOffer =
    countdown.enabled &&
    expired &&
    countdown.onExpire !== "reset";

  const showTimer = countdown.enabled && !isExpiredOffer;

  const displaySeconds =
    expired && countdown.onExpire === "zeros" ? 0 : remaining;

  const units = useMemo(
    () => getCountdownDisplayUnits(displaySeconds),
    [displaySeconds]
  );

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
      {isExpiredOffer && (
        <p className="flash-countdown-expired" role="status">
          Offre terminée
        </p>
      )}
      {showTimer && (
        <div
          className="flash-countdown"
          aria-label="Compte à rebours vente flash"
          role="timer"
        >
          {units.map((unit) => (
            <CountdownBlock
              key={unit.key}
              value={unit.value}
              label={countdownUnitLabel(unit.key, unit.value)}
              shortLabel={unit.shortLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
