"use client";

import type { GooglePreviewData } from "@/lib/seo";

interface GooglePreviewProps {
  preview: GooglePreviewData;
}

export function GooglePreview({ preview }: GooglePreviewProps) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: "#fff",
        border: "1px solid #e8eaed",
        fontFamily: "arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--adm-ink-mute)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
        Google Preview
      </div>
      <div style={{ fontSize: 20, color: "#1a0dab", lineHeight: 1.3, marginBottom: 2, wordBreak: "break-word" }}>
        {preview.title || "Titre SEO du produit"}
      </div>
      <div style={{ fontSize: 13, color: "#006621", marginBottom: 4, wordBreak: "break-all" }}>
        {preview.url || "https://lncos.re/produit/exemple"}
      </div>
      <div style={{ fontSize: 14, color: "#4d5156", lineHeight: 1.58, wordBreak: "break-word" }}>
        {preview.description || "Meta description du produit…"}
      </div>
    </div>
  );
}
