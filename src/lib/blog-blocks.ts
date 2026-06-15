/**
 * LN COS — Rendu et utilitaires blocs article blog
 */

import type { BlogContentBlock } from "./contracts/blog";

export function parseBlogBody(raw: unknown): BlogContentBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isBlogContentBlock);
}

function isBlogContentBlock(value: unknown): value is BlogContentBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as { type?: string };
  if (block.type === "p" || block.type === "h1" || block.type === "h2" || block.type === "h3") {
    return typeof (value as { text?: unknown }).text === "string";
  }
  if (block.type === "quote") {
    return typeof (value as { text?: unknown }).text === "string";
  }
  if (block.type === "img") {
    return typeof (value as { url?: unknown }).url === "string";
  }
  if (block.type === "ul" || block.type === "ol") {
    return Array.isArray((value as { items?: unknown }).items);
  }
  return false;
}

export function blogBodyToPlainText(blocks: BlogContentBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "ul" || b.type === "ol") return b.items.join(" ");
      if (b.type === "img") return b.alt ?? "";
      if ("text" in b) return b.text;
      return "";
    })
    .join(" ");
}

export function estimateReadMinutes(blocks: BlogContentBlock[], fallback = 5): number {
  const words = blogBodyToPlainText(blocks).split(/\s+/).filter(Boolean).length;
  if (words === 0) return fallback;
  return Math.max(2, Math.round(words / 200));
}
