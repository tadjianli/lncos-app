"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";

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
  const [zoomed, setZoomed] = useState<"before" | "after" | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxWidth(el.clientWidth));
    ro.observe(el);
    setBoxWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const updateFromClientX = useCallback((clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
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

  return (
    <>
      <div
        ref={boxRef}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 5",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,.08)",
          touchAction: "none",
          userSelect: "none",
          cursor: dragging ? "grabbing" : "ew-resize",
          background: "#111",
        }}
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
        <img
          src={afterUrl}
          alt="Après"
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pos}%`,
            overflow: "hidden",
            borderRight: "2px solid rgba(255,255,255,.92)",
            boxShadow: "4px 0 24px rgba(0,0,0,.35)",
          }}
        >
          <img
            src={beforeUrl}
            alt="Avant"
            draggable={false}
            style={{
              width: boxWidth || "100%",
              height: "100%",
              maxWidth: "none",
              objectFit: "cover",
            }}
          />
        </div>

        <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "#fff",
            background: "rgba(0,0,0,.45)",
            padding: "4px 8px",
            borderRadius: 999,
          }}
        >
          Avant
        </span>
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "#fff",
            background: "rgba(212,175,55,.75)",
            padding: "4px 8px",
            borderRadius: 999,
          }}
        >
          Après
        </span>

        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${pos}%`,
            transform: "translateX(-50%)",
            width: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,.95)",
              boxShadow: "0 4px 18px rgba(0,0,0,.35)",
              display: "grid",
              placeItems: "center",
              color: "#1a1306",
            }}
          >
            <Icon name="sliders" size={16} color="#1a1306" />
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setZoomed("before"); }}
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: "rgba(0,0,0,.5)",
            color: "#fff",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
          aria-label="Zoom avant"
        >
          <Icon name="search" size={14} color="#fff" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setZoomed("after"); }}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: "rgba(212,175,55,.65)",
            color: "#1a1306",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
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
          onClick={() => setZoomed(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,.92)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <button
            type="button"
            onClick={() => setZoomed(null)}
            style={{
              position: "absolute",
              top: "max(16px, env(safe-area-inset-top))",
              right: 16,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,.12)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <Icon name="x" size={18} color="#fff" />
          </button>
          <img
            src={zoomed === "before" ? beforeUrl : afterUrl}
            alt={zoomed === "before" ? "Avant zoom" : "Après zoom"}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
        </div>
      )}
    </>
  );
}
