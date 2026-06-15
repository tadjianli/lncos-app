/**
 * LN COS — Noyau SEO partagé (constantes & utilitaires)
 */

import type { ProductExtraSection } from "@/lib/product-sections";
import { slugifyProductId } from "@/lib/product-catalog";

export type SeoOptimizeMode = "standard" | "maximal";

export interface ProductSeoFields {
  name: string;
  desc?: string;
  seoKeyword?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  seoSlug?: string | null;
  imageAlt?: string | null;
  mainImageUrl?: string | null;
  imageUrl?: string | null;
  galleryImages?: string[];
  benefits?: string[];
  usageTips?: string[];
  extraSections?: ProductExtraSection[];
  active?: boolean;
}

export const BRAND = "LN COS";

export const TITLE_IDEAL_MIN = 30;
export const TITLE_IDEAL_MAX = 60;
export const TITLE_DISPLAY_MAX = 60;
export const TITLE_GEN_MIN = 40;
export const TITLE_GEN_MAX = 60;
export const META_IDEAL_MIN = 120;
export const META_IDEAL_MAX = 160;
export const META_DISPLAY_MAX = 160;
export const META_GEN_MIN = 140;
export const META_GEN_MAX = 160;
export const DESC_WORD_MIN = 300;
export const DESC_WORD_TARGET_MIN = 350;
export const DESC_WORD_TARGET_MAX = 500;
export const SEO_FAQ_SECTION_ID_PREFIX = "seo-faq-";

export function slugifySeo(text: string): string {
  return slugifyProductId(text);
}

export function generateSeoSlugFromName(name: string): string {
  return slugifySeo(name);
}

export function generateSeoImageFilename(keyword: string, ext = "webp"): string {
  const base = slugifySeo(keyword || "produit");
  return `${base}-ln-cos.${ext}`;
}

export function countWords(text: string | null | undefined): number {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function normalizeSeoText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function containsKeyword(
  haystack: string | null | undefined,
  keyword: string | null | undefined
): boolean {
  if (!haystack || !keyword) return false;
  const k = normalizeSeoText(keyword.trim());
  if (!k) return false;
  const words = k.split(/\s+/).filter(Boolean);
  const hay = normalizeSeoText(haystack);
  return words.every((w) => hay.includes(w));
}

export function keywordInFirstParagraph(desc: string, keyword: string): boolean {
  const first = desc.split(/\n\n+/)[0]?.trim() ?? "";
  return containsKeyword(first, keyword);
}

export function keywordInH2(desc: string, keyword: string): boolean {
  const headings = desc.match(/^#{2}\s+.+$/gm) ?? [];
  return headings.some((h) => containsKeyword(h, keyword));
}

export function titleCaseKeyword(keyword: string): string {
  return keyword
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function resolvePrimaryKeyword(fields: {
  name: string;
  seoKeyword?: string | null;
}): string {
  const fromField = fields.seoKeyword?.trim();
  if (fromField && fromField.length >= 3) return fromField.toLowerCase();
  return fields.name.trim().toLowerCase();
}
