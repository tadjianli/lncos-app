"use client";

import { getLengthBarStatus, lengthBarColor, type LengthBarStatus } from "@/lib/seo";

interface SeoLengthBarProps {
  label: string;
  length: number;
  displayMax: number;
  idealMin: number;
  idealMax: number;
}

export function SeoLengthBar({ label, length, displayMax, idealMin, idealMax }: SeoLengthBarProps) {
  const status: LengthBarStatus = getLengthBarStatus(length, idealMin, idealMax);
  const color = lengthBarColor(status);
  const pct = Math.min(100, Math.round((length / displayMax) * 100));

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--adm-ink-mute)", marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>
          {length} / {displayMax} caractères
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--adm-border-2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: color,
            transition: "width .2s ease, background .2s ease",
          }}
        />
      </div>
      <div style={{ fontSize: 10, color, marginTop: 3, fontWeight: 600 }}>
        {status === "ideal" ? "Idéal" : status === "ok" ? "Acceptable" : "À améliorer"}
      </div>
    </div>
  );
}
