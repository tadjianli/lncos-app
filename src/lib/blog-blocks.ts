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

/** Convertit du markdown simple (H1–H3, paragraphes) en blocs blog. */
export function markdownToBlogBlocks(markdown: string, fallbackTitle?: string): BlogContentBlock[] {
  const blocks: BlogContentBlock[] = [];
  const lines = markdown.split("\n");
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    const text = paragraphBuffer.join(" ").trim();
    paragraphBuffer = [];
    if (text) blocks.push({ type: "p", text });
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
    } else if (trimmed.startsWith("# ")) {
      flushParagraph();
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
    } else {
      paragraphBuffer.push(trimmed);
    }
  }
  flushParagraph();

  if (blocks.length === 0 && fallbackTitle?.trim()) {
    return [{ type: "h1", text: fallbackTitle.trim() }];
  }
  if (blocks.length > 0 && blocks[0].type !== "h1" && fallbackTitle?.trim()) {
    return [{ type: "h1", text: fallbackTitle.trim() }, ...blocks];
  }
  return blocks;
}
