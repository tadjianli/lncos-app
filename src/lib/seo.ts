/**
 * LN COS — Assistant SEO e-commerce (scoring, analyse, génération gratuite)
 */

import type { ProductExtraSection } from "@/lib/product-sections";
import { slugifyProductId } from "@/lib/product-catalog";

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
  ingredients?: string[];
  usageTips?: string[];
  extraSections?: ProductExtraSection[];
  active?: boolean;
}

export type SeoLevel = "poor" | "medium" | "good" | "excellent";

export type LengthBarStatus = "short" | "ok" | "ideal";

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
  breakdown: {
    title: number;
    meta: number;
    slug: number;
    alt: number;
    description: number;
    keyword: number;
    images: number;
  };
}

export interface GooglePreviewData {
  title: string;
  url: string;
  description: string;
}

const BRAND = "LN COS";
const REGION = "La Réunion";

const TITLE_IDEAL_MIN = 30;
const TITLE_IDEAL_MAX = 60;
const TITLE_DISPLAY_MAX = 60;
const META_IDEAL_MIN = 120;
const META_IDEAL_MAX = 160;
const META_DISPLAY_MAX = 160;

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
  const words = k.split(/\s+/).filter(Boolean);
  const hay = normalize(haystack);
  return words.every((w) => hay.includes(w));
}

export function countWords(text: string | null | undefined): number {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getLengthBarStatus(
  length: number,
  idealMin: number,
  idealMax: number
): LengthBarStatus {
  if (length >= idealMin && length <= idealMax) return "ideal";
  if (length === 0 || length < idealMin * 0.6 || length > idealMax * 1.25) return "short";
  return "ok";
}

export function lengthBarColor(status: LengthBarStatus): string {
  switch (status) {
    case "ideal":
      return "#2F9E68";
    case "ok":
      return "#C77A33";
    default:
      return "#C2557A";
  }
}

export function hasProductImage(fields: ProductSeoFields): boolean {
  return Boolean(
    fields.mainImageUrl?.trim() ||
    fields.imageUrl?.trim() ||
    (fields.galleryImages?.length ?? 0) > 0
  );
}

export function hasGalleryImage(fields: ProductSeoFields): boolean {
  return (fields.galleryImages?.length ?? 0) > 0;
}

function hasSubheadings(fields: ProductSeoFields): boolean {
  const extras = fields.extraSections?.filter((s) => s.enabled && s.title.trim()) ?? [];
  if (extras.length > 0) return true;
  if ((fields.usageTips?.length ?? 0) > 0) return true;
  if ((fields.ingredients?.length ?? 0) > 0) return true;
  const desc = fields.desc ?? "";
  return /^#{2,3}\s/m.test(desc) || /^[A-ZÀ-Ÿ][^\n]{2,40}$/m.test(desc);
}

function hasBulletLists(fields: ProductSeoFields): boolean {
  if ((fields.ingredients?.length ?? 0) > 0) return true;
  if ((fields.usageTips?.length ?? 0) > 0) return true;
  return (fields.extraSections ?? []).some(
    (s) => s.enabled && (s.type === "list" || s.type === "steps") && s.items.some((i) => i.trim())
  );
}

function isSlugOptimized(slug: string): boolean {
  const s = slug.trim();
  if (s.length < 3 || s.length > 80) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

function isSeoFilenameOptimized(filename: string, keyword: string): boolean {
  const f = filename.toLowerCase();
  if (!f.endsWith(".webp") && !f.endsWith(".jpg") && !f.endsWith(".png")) return false;
  if (!f.includes("-ln-cos")) return false;
  return containsKeyword(f.replace(/\.[a-z]+$/, "").replace(/-/g, " "), keyword);
}

function scoreFromParts(parts: { ideal: boolean; ok: boolean; max: number }): number {
  if (parts.ideal) return parts.max;
  if (parts.ok) return Math.round(parts.max * 0.55);
  return 0;
}

export function computeProductSeoScore(fields: ProductSeoFields): SeoScoreResult {
  const keyword = fields.seoKeyword?.trim() ?? "";
  const title = fields.seoTitle?.trim() ?? "";
  const meta = fields.metaDescription?.trim() ?? "";
  const slug = fields.seoSlug?.trim() ?? "";
  const alt = fields.imageAlt?.trim() ?? "";
  const desc = fields.desc?.trim() ?? "";
  const wordCount = countWords(desc);
  const imageFilename = generateSeoImageFilename(keyword || fields.name);
  const hasImage = hasProductImage(fields);
  const hasGallery = hasGalleryImage(fields);
  const indexable = fields.active !== false;

  const titleLen = title.length;
  const metaLen = meta.length;
  const titleIdeal = titleLen >= TITLE_IDEAL_MIN && titleLen <= TITLE_IDEAL_MAX;
  const titleOk = titleLen >= 20 && titleLen <= 70;
  const metaIdeal = metaLen >= META_IDEAL_MIN && metaLen <= META_IDEAL_MAX;
  const metaOk = metaLen >= 90 && metaLen <= 180;

  const kwInTitle = containsKeyword(title, keyword);
  const kwInMeta = containsKeyword(meta, keyword);
  const kwInSlug = containsKeyword(slug.replace(/-/g, " "), keyword);
  const kwInAlt = containsKeyword(alt, keyword);
  const kwInDesc = containsKeyword(desc, keyword);
  const kwSet = keyword.length >= 3;

  const titlePts = Math.min(
    15,
    scoreFromParts({ ideal: titleIdeal, ok: titleOk, max: 8 }) +
      (kwInTitle ? 7 : 0)
  );
  const metaPts = Math.min(
    15,
    scoreFromParts({ ideal: metaIdeal, ok: metaOk, max: 8 }) +
      (kwInMeta ? 7 : 0)
  );
  const slugPts = Math.min(10, (isSlugOptimized(slug) ? 5 : 0) + (kwInSlug ? 5 : 0));
  const altPts = Math.min(10, (alt.length > 0 ? 5 : 0) + (kwInAlt ? 5 : 0));

  let descPts = 0;
  if (wordCount >= 300) descPts += 8;
  else if (wordCount >= 150) descPts += 4;
  if (kwInDesc) descPts += 4;
  if (hasSubheadings(fields)) descPts += 4;
  if (hasBulletLists(fields)) descPts += 4;
  descPts = Math.min(20, descPts);

  let kwPts = 0;
  if (kwSet) kwPts += 3;
  const placements = [kwInTitle, kwInMeta, kwInSlug, kwInAlt, kwInDesc].filter(Boolean).length;
  kwPts += Math.min(12, placements * 2.4);
  kwPts = Math.min(15, Math.round(kwPts));

  let imgPts = 0;
  if (hasImage) imgPts += 10;
  if (hasGallery || hasImage) imgPts += 5;
  imgPts = Math.min(15, imgPts);

  const breakdown = {
    title: titlePts,
    meta: metaPts,
    slug: slugPts,
    alt: altPts,
    description: descPts,
    keyword: kwPts,
    images: imgPts,
  };

  const score = Math.min(
    100,
    breakdown.title +
      breakdown.meta +
      breakdown.slug +
      breakdown.alt +
      breakdown.description +
      breakdown.keyword +
      breakdown.images
  );

  const checks: SeoCheck[] = [
    { id: "kw-title", label: "Mot-clé dans le titre SEO", ok: kwInTitle, points: kwInTitle ? 1 : 0, maxPoints: 1 },
    { id: "kw-meta", label: "Mot-clé dans la meta description", ok: kwInMeta, points: kwInMeta ? 1 : 0, maxPoints: 1 },
    { id: "kw-slug", label: "Mot-clé dans le slug", ok: kwInSlug, points: kwInSlug ? 1 : 0, maxPoints: 1 },
    { id: "kw-alt", label: "Mot-clé dans l'alt image", ok: kwInAlt, points: kwInAlt ? 1 : 0, maxPoints: 1 },
    { id: "kw-desc", label: "Mot-clé dans la description produit", ok: kwInDesc, points: kwInDesc ? 1 : 0, maxPoints: 1 },
    { id: "desc-words", label: "Longueur description > 300 mots", ok: wordCount >= 300, points: wordCount >= 300 ? 1 : 0, maxPoints: 1 },
    { id: "subheadings", label: "Présence de sous-titres", ok: hasSubheadings(fields), points: hasSubheadings(fields) ? 1 : 0, maxPoints: 1 },
    { id: "bullets", label: "Présence de listes à puces", ok: hasBulletLists(fields), points: hasBulletLists(fields) ? 1 : 0, maxPoints: 1 },
    { id: "has-image", label: "Présence d'au moins une image", ok: hasImage, points: hasImage ? 1 : 0, maxPoints: 1 },
    { id: "title-len", label: "Titre SEO longueur idéale (30–60)", ok: titleIdeal, points: titleIdeal ? 1 : 0, maxPoints: 1 },
    { id: "meta-len", label: "Meta description longueur idéale (120–160)", ok: metaIdeal, points: metaIdeal ? 1 : 0, maxPoints: 1 },
    { id: "slug-opt", label: "Slug optimisé", ok: isSlugOptimized(slug), points: isSlugOptimized(slug) ? 1 : 0, maxPoints: 1 },
    { id: "indexable", label: "Produit indexable (publié)", ok: indexable, points: indexable ? 1 : 0, maxPoints: 1 },
    { id: "file-opt", label: "Nom de fichier image optimisé", ok: isSeoFilenameOptimized(imageFilename, keyword || fields.name), points: isSeoFilenameOptimized(imageFilename, keyword || fields.name) ? 1 : 0, maxPoints: 1 },
    { id: "file-kw", label: "Mot-clé présent dans le nom de fichier", ok: containsKeyword(imageFilename.replace(/\.[a-z]+$/, "").replace(/-/g, " "), keyword || fields.name), points: containsKeyword(imageFilename.replace(/\.[a-z]+$/, "").replace(/-/g, " "), keyword || fields.name) ? 1 : 0, maxPoints: 1 },
  ];

  const level: SeoLevel =
    score >= 95 ? "excellent" : score >= 80 ? "good" : score >= 50 ? "medium" : "poor";

  return { score, level, checks, breakdown };
}

export function seoLevelColor(level: SeoLevel): string {
  switch (level) {
    case "excellent":
      return "#1B7F4E";
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
    case "excellent":
      return "Excellent";
    case "good":
      return "Bon";
    case "medium":
      return "Moyen";
    default:
      return "Faible";
  }
}

export function generateSeoFieldsFromProduct(name: string): {
  seoKeyword: string;
  seoTitle: string;
  metaDescription: string;
  imageAlt: string;
  seoSlug: string;
  seoImageFilename: string;
} {
  const keyword = extractMainKeyword(name);
  const slug = generateSeoSlugFromName(name);
  const displayName = name.trim();
  const titleBase = displayName.length > 45 ? displayName.slice(0, 42).trim() + "…" : displayName;

  return {
    seoKeyword: keyword,
    seoTitle: `${titleBase} | ${BRAND}`,
    metaDescription: `Découvrez ${keyword} ${BRAND}. Qualité premium, résultats visibles. Livraison rapide à ${REGION}.`,
    imageAlt: `${capitalizeKeyword(keyword)} ${BRAND}`,
    seoSlug: slug,
    seoImageFilename: generateSeoImageFilename(keyword),
  };
}

export function getProductSeoPath(product: Pick<ProductSeoFields, "seoSlug" | "name"> & { id?: string }): string {
  const slug = product.seoSlug?.trim() || product.id || slugifySeo(product.name);
  return `/produit/${encodeURIComponent(slug)}`;
}

export function getCategorySeoPath(category: { seoSlug?: string | null; id: string }): string {
  const slug = category.seoSlug?.trim() || category.id;
  return `/categorie/${encodeURIComponent(slug)}`;
}

export function getGooglePreview(fields: ProductSeoFields, siteUrl: string): GooglePreviewData {
  const title = fields.seoTitle?.trim() || `${fields.name} | ${BRAND}`;
  const path = getProductSeoPath(fields);
  const url = `${siteUrl.replace(/\/$/, "")}${path}`;
  const description =
    fields.metaDescription?.trim() ||
    `Découvrez ${fields.name} sur ${BRAND}. Cosmétiques premium livrés à ${REGION}.`;

  return { title, url, description };
}

export function isProductSeoOptimized(fields: ProductSeoFields): boolean {
  return computeProductSeoScore(fields).score >= 95;
}

export interface SeoDashboardStats {
  total: number;
  optimized: number;
  withoutDescription: number;
  withoutImageAlt: number;
  withoutMetaDescription: number;
  withoutImage: number;
  averageScore: number;
  needsWork: Array<ProductSeoFields & { id: string; score: number; level: SeoLevel }>;
}

export function computeSeoDashboardStats(
  products: Array<ProductSeoFields & { id: string }>
): SeoDashboardStats {
  let optimized = 0;
  let withoutDescription = 0;
  let withoutImageAlt = 0;
  let withoutMetaDescription = 0;
  let withoutImage = 0;
  let scoreSum = 0;
  const needsWork: SeoDashboardStats["needsWork"] = [];

  for (const p of products) {
    const result = computeProductSeoScore(p);
    scoreSum += result.score;
    if (result.score >= 95) optimized += 1;
    if (!p.desc?.trim()) withoutDescription += 1;
    if (!p.imageAlt?.trim()) withoutImageAlt += 1;
    if (!p.metaDescription?.trim()) withoutMetaDescription += 1;
    if (!hasProductImage(p)) withoutImage += 1;
    if (result.score < 95) {
      needsWork.push({ ...p, score: result.score, level: result.level });
    }
  }

  needsWork.sort((a, b) => a.score - b.score);

  return {
    total: products.length,
    optimized,
    withoutDescription,
    withoutImageAlt,
    withoutMetaDescription,
    withoutImage,
    averageScore: products.length ? Math.round(scoreSum / products.length) : 0,
    needsWork,
  };
}
