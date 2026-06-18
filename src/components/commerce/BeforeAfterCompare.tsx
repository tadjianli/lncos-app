"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";

const SESSION_HINT_KEY = "lncos-ba-compare-hint-dismissed";
const SESSION_ANIM_KEY = "lncos-ba-compare-hint-animated";

function readSessionFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* quota / private mode */
  }
}

export function BeforeAfterCompare({
  beforeUrl,
  afterUrl,
  alt = "Comparaison avant après",
}: {
  beforeUrl: string;
  afterUrl: string;
  alt?: string;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [hintAnimating, setHintAnimating] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [zoomed, setZoomed] = useState<"before" | "after" | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const hintDismissedRef = useRef(false);

  useEffect(() => {
    const dismissed = readSessionFlag(SESSION_HINT_KEY);
    hintDismissedRef.current = dismissed;
    setShowHint(!dismissed);
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxWidth(el.clientWidth));
    ro.observe(el);
    setBoxWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const dismissHint = useCallback(() => {
    if (hintDismissedRef.current) return;
    hintDismissedRef.current = true;
    setShowHint(false);
    setHintAnimating(false);
    writeSessionFlag(SESSION_HINT_KEY);
  }, []);

  useEffect(() => {
    if (readSessionFlag(SESSION_HINT_KEY)) return;
    if (readSessionFlag(SESSION_ANIM_KEY)) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      writeSessionFlag(SESSION_ANIM_KEY);
      return;
    }

    writeSessionFlag(SESSION_ANIM_KEY);
    setHintAnimating(true);

    const steps: Array<{ value: number; at: number }> = [
      { value: 50, at: 0 },
      { value: 58, at: 350 },
      { value: 42, at: 750 },
      { value: 50, at: 1150 },
    ];

    const timers = steps.map(({ value, at }) =>
      window.setTimeout(() => {
        if (!hintDismissedRef.current) setPos(value);
      }, at)
    );

    const endTimer = window.setTimeout(() => {
      setHintAnimating(false);
    }, 1500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(endTimer);
    };
  }, []);

  const updateFromClientX = useCallback((clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dismissHint();
    setDragging(true);
    updateFromClientX(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const motionClass =
    hintAnimating && !dragging ? " ba-compare__stage--motion" : dragging ? " ba-compare__stage--dragging" : "";

  return (
    <div className="ba-compare">
      {showHint ? (
        <p className="ba-compare__hint" aria-live="polite">
          Glissez pour comparer
        </p>
      ) : null}

      <div
        ref={boxRef}
        className={`ba-compare__stage${motionClass}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label={alt}
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <img src={afterUrl} alt="Après" draggable={false} className="ba-compare__img ba-compare__img--after" />
        <div className="ba-compare__clip" style={{ width: `${pos}%` }}>
          <img
            src={beforeUrl}
            alt="Avant"
            draggable={false}
            className="ba-compare__img ba-compare__img--before"
            style={{ width: boxWidth || "100%" }}
          />
        </div>

        <span className="ba-compare__label ba-compare__label--before">Avant</span>
        <span className="ba-compare__label ba-compare__label--after">Après</span>

        <div className="ba-compare__handle" style={{ left: `${pos}%` }}>
          <span className="ba-compare__handle-btn" aria-hidden>
            <Icon name="chevL" size={14} color="#1a1306" stroke={2.5} />
            <Icon name="chevR" size={14} color="#1a1306" stroke={2.5} />
          </span>
        </div>

        <button
          type="button"
          className="ba-compare__zoom ba-compare__zoom--before"
          onClick={(e) => {
            e.stopPropagation();
            dismissHint();
            setZoomed("before");
          }}
          aria-label="Zoom avant"
        >
          <Icon name="search" size={14} color="#fff" />
        </button>
        <button
          type="button"
          className="ba-compare__zoom ba-compare__zoom--after"
          onClick={(e) => {
            e.stopPropagation();
            dismissHint();
            setZoomed("after");
          }}
          aria-label="Zoom après"
        >
          <Icon name="search" size={14} color="#1a1306" />
        </button>
      </div>

      {zoomed && (
        <div
          role="dialog"
          aria-modal
          className="ba-compare__lightbox"
          onClick={() => setZoomed(null)}
        >
          <button
            type="button"
            className="ba-compare__lightbox-close"
            onClick={() => setZoomed(null)}
            aria-label="Fermer"
          >
            <Icon name="x" size={18} color="#fff" />
          </button>
          <img
            src={zoomed === "before" ? beforeUrl : afterUrl}
            alt={zoomed === "before" ? "Avant zoom" : "Après zoom"}
            onClick={(e) => e.stopPropagation()}
            className="ba-compare__lightbox-img"
          />
        </div>
      )}
    </div>
  );
}
