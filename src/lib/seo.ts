/**
 * LN COS — SEO gratuit (scoring, slug, pré-remplissage, libellés)
 */

import { slugifyProductId } from "@/lib/product-catalog";

export interface ProductSeoFields {
  name: string;
  desc?: string;
  seoKeyword?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  seoSlug?: string | null;
  imageAlt?: string | null;
}

export type SeoLevel = "good" | "medium" | "poor";

export interface SeoCheck {
  id: string;
  label: string;
  ok: boolean;
  points: number;
  maxPoints: number;
}

export interface SeoScoreResult {
  score: number;
  level: SeoLevel;
  checks: SeoCheck[];
}

const BRAND = "LN COS";
const REGION = "La Réunion";

export function slugifySeo(text: string): string {
  return slugifyProductId(text);
}

export function generateSeoSlugFromName(name: string): string {
  return slugifySeo(name);
}

export function generateSeoFieldsFromProduct(name: string): {
  seoKeyword: string;
  seoTitle: string;
  metaDescription: string;
  imageAlt: string;
  seoSlug: string;
} {
  const keyword = extractMainKeyword(name);
  const slug = generateSeoSlugFromName(name);
  return {
    seoKeyword: keyword,
    seoTitle: `${name} | ${BRAND}`,
    metaDescription: `Découvrez ${keyword} ${BRAND}. Livraison rapide à ${REGION}.`,
    imageAlt: `${capitalizeKeyword(keyword)} ${BRAND}`,
    seoSlug: slug,
  };
}

function extractMainKeyword(name: string): string {
  return name.trim().toLowerCase();
}

function capitalizeKeyword(keyword: string): string {
  if (!keyword) return keyword;
  return keyword.charAt(0).toUpperCase() + keyword.slice(1);
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function containsKeyword(haystack: string | null | undefined, keyword: string | null | undefined): boolean {
  if (!haystack || !keyword) return false;
  const k = normalize(keyword.trim());
  if (!k) return false;
  return normalize(haystack).includes(k);
}

function scoreTitleLength(title: string | null | undefined): { points: number; max: number; ok: boolean } {
  const max = 15;
  const len = (title ?? "").trim().length;
  if (len === 0) return { points: 0, max, ok: false };
  if (len >= 30 && len <= 60) return { points: max, max, ok: true };
  if (len >= 20 && len <= 70) return { points: 10, max, ok: false };
  return { points: 5, max, ok: false };
}

function scoreMetaLength(meta: string | null | undefined): { points: number; max: number; ok: boolean } {
  const max = 15;
  const len = (meta ?? "").trim().length;
  if (len === 0) return { points: 0, max, ok: false };
  if (len >= 120 && len <= 160) return { points: max, max, ok: true };
  if (len >= 90 && len <= 180) return { points: 10, max, ok: false };
  return { points: 5, max, ok: false };
}

export function computeProductSeoScore(fields: ProductSeoFields): SeoScoreResult {
  const keyword = fields.seoKeyword?.trim() ?? "";
  const title = fields.seoTitle?.trim() ?? "";
  const meta = fields.metaDescription?.trim() ?? "";
  const slug = fields.seoSlug?.trim() ?? "";
  const alt = fields.imageAlt?.trim() ?? "";

  const titleLen = scoreTitleLength(title);
  const metaLen = scoreMetaLength(meta);

  const checks: SeoCheck[] = [
    {
      id: "title-length",
      label: "Longueur du titre SEO (30–60 car. idéal)",
      ...titleLen,
      maxPoints: titleLen.max,
      points: titleLen.points,
    },
    {
      id: "meta-length",
      label: "Longueur meta description (120–160 car. idéal)",
      ...metaLen,
      maxPoints: metaLen.max,
      points: metaLen.points,
    },
    {
      id: "keyword-title",
      label: "Mot-clé présent dans le titre SEO",
      ok: containsKeyword(title, keyword),
      points: containsKeyword(title, keyword) ? 15 : 0,
      maxPoints: 15,
    },
    {
      id: "keyword-meta",
      label: "Mot-clé présent dans la meta description",
      ok: containsKeyword(meta, keyword),
      points: containsKeyword(meta, keyword) ? 15 : 0,
      maxPoints: 15,
    },
    {
      id: "keyword-slug",
      label: "Mot-clé présent dans le slug URL",
      ok: containsKeyword(slug.replace(/-/g, " "), keyword),
      points: containsKeyword(slug.replace(/-/g, " "), keyword) ? 15 : 0,
      maxPoints: 15,
    },
    {
      id: "alt-present",
      label: "Texte alternatif image renseigné",
      ok: alt.length > 0,
      points: alt.length > 0 ? 10 : 0,
      maxPoints: 10,
    },
    {
      id: "keyword-alt",
      label: "Mot-clé présent dans l'alt image",
      ok: containsKeyword(alt, keyword),
      points: containsKeyword(alt, keyword) ? 15 : 0,
      maxPoints: 15,
    },
  ];

  const score = Math.min(100, checks.reduce((s, c) => s + c.points, 0));
  const level: SeoLevel = score >= 70 ? "good" : score >= 40 ? "medium" : "poor";

  return { score, level, checks };
}

export function seoLevelColor(level: SeoLevel): string {
  switch (level) {
    case "good":
      return "#2F9E68";
    case "medium":
      return "#C77A33";
    default:
      return "#C2557A";
  }
}

export function seoLevelLabel(level: SeoLevel): string {
  switch (level) {
    case "good":
      return "Bon";
    case "medium":
      return "Moyen";
    default:
      return "Faible";
  }
}

export function getProductSeoPath(product: Pick<ProductSeoFields, "seoSlug" | "name"> & { id?: string }): string {
  const slug = product.seoSlug?.trim() || product.id || slugifySeo(product.name);
  return `/produit/${encodeURIComponent(slug)}`;
}

export function getCategorySeoPath(category: { seoSlug?: string | null; id: string }): string {
  const slug = category.seoSlug?.trim() || category.id;
  return `/categorie/${encodeURIComponent(slug)}`;
}

export function isProductSeoOptimized(fields: ProductSeoFields): boolean {
  return computeProductSeoScore(fields).score >= 70;
}

export interface SeoDashboardStats {
  total: number;
  optimized: number;
  withoutDescription: number;
  withoutImageAlt: number;
  withoutMetaDescription: number;
  averageScore: number;
  needsWork: Array<ProductSeoFields & { id: string; score: number }>;
}

export function computeSeoDashboardStats(
  products: Array<ProductSeoFields & { id: string }>
): SeoDashboardStats {
  let optimized = 0;
  let withoutDescription = 0;
  let withoutImageAlt = 0;
  let withoutMetaDescription = 0;
  let scoreSum = 0;
  const needsWork: SeoDashboardStats["needsWork"] = [];

  for (const p of products) {
    const result = computeProductSeoScore(p);
    scoreSum += result.score;
    if (result.score >= 70) optimized += 1;
    if (!p.desc?.trim()) withoutDescription += 1;
    if (!p.imageAlt?.trim()) withoutImageAlt += 1;
    if (!p.metaDescription?.trim()) withoutMetaDescription += 1;
    if (result.score < 70) {
      needsWork.push({ ...p, score: result.score });
    }
  }

  needsWork.sort((a, b) => a.score - b.score);

  return {
    total: products.length,
    optimized,
    withoutDescription,
    withoutImageAlt,
    withoutMetaDescription,
    averageScore: products.length ? Math.round(scoreSum / products.length) : 0,
    needsWork,
  };
}
