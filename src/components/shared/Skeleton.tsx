"use client";
/**
 * LN COS — Skeleton system
 * Shimmer placeholders that match the exact dimensions of real content,
 * eliminating layout shift while data / images load.
 */

import { memo } from "react";
import { HorizontalProductCarousel } from "@/components/carousels/HorizontalProductCarousel";

/* ─── Primitive ─────────────────────────────────────────────────── */

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export const SkeletonBlock = memo(function SkeletonBlock({
  width = "100%",
  height = 14,
  radius = 6,
  style,
  className = "",
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
});

export const SkeletonLine = memo(function SkeletonLine({
  width = "100%",
  height = 13,
  style,
}: Omit<SkeletonProps, "radius">) {
  return <SkeletonBlock width={width} height={height} radius={5} style={style} />;
});

/* ─── Product card ──────────────────────────────────────────────── */

export const SkeletonProductCard = memo(function SkeletonProductCard() {
  return (
    <div
      aria-hidden
      className="prod-card snap"
      style={{ pointerEvents: "none", cursor: "default" }}
    >
      <SkeletonBlock
        height="var(--prod-card-img-h)"
        radius={0}
        style={{ borderRadius: 0, flex: "0 0 var(--prod-card-img-h)" }}
      />
      <div
        className="prod-card-info"
        style={{ display: "flex", flexDirection: "column", gap: 7 }}
      >
        <SkeletonLine width="90%" height={12} />
        <SkeletonLine width="60%" height={11} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <SkeletonLine width="38%" height={14} />
          <SkeletonBlock width={30} height={30} radius="50%" />
        </div>
      </div>
    </div>
  );
});

/* ─── Horizontal product row ────────────────────────────────────── */

export const SkeletonProductRow = memo(function SkeletonProductRow({
  count = 3,
}: {
  count?: number;
}) {
  return (
    <HorizontalProductCarousel bleed={false} fillColumns={2} enhanceScroll={false} style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </HorizontalProductCarousel>
  );
});

/* ─── Section header ────────────────────────────────────────────── */

export const SkeletonSectionHeader = memo(function SkeletonSectionHeader() {
  return (
    <div style={{ padding: "0 18px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
      <SkeletonLine width={80} height={10} />
      <SkeletonLine width={160} height={20} />
    </div>
  );
});

/* ─── Hero ──────────────────────────────────────────────────────── */

export const SkeletonHero = memo(function SkeletonHero() {
  return (
    <div style={{ margin: "0 18px", borderRadius: 24, overflow: "hidden", position: "relative" }}>
      <SkeletonBlock height={320} radius={0} />
      {/* Text overlay ghost */}
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 22,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <SkeletonBlock width={100} height={26} radius={999} />
        <SkeletonLine width="70%" height={32} />
        <SkeletonLine width="85%" height={13} />
        <SkeletonLine width="55%" height={13} />
        <SkeletonBlock width={120} height={40} radius={999} style={{ marginTop: 4 }} />
      </div>
    </div>
  );
});

/* ─── Category tile ─────────────────────────────────────────────── */

export const SkeletonCategoryGrid = memo(function SkeletonCategoryGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        padding: "0 16px",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBlock key={i} height={100} radius={16} />
      ))}
    </div>
  );
});

/* ─── Full page skeleton (route-level loading state) ────────────── */

export function SkeletonPage() {
  return (
    <div
      style={{
        flex: "1 1 auto",
        minHeight: 0,
        overflowY: "auto",
        paddingBottom: 8,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        paddingTop: 16,
      }}
    >
      <SkeletonHero />
      <SkeletonSectionHeader />
      <SkeletonProductRow count={2} />
      <SkeletonSectionHeader />
      <SkeletonProductRow count={2} />
    </div>
  );
}
