/**
 * LN COS — Assistant SEO e-commerce (scoring, analyse, génération V2)
 */

import type { ProductExtraSection } from "@/lib/product-sections";
import type { DeliveryZoneSettings } from "@/lib/delivery-zones";
import { DEFAULT_DELIVERY_ZONES, getSeoDeliveryPhrase } from "@/lib/delivery-zones";
import { generateProductSeoAI, type SeoReviewInput } from "@/lib/seo-ai-engine";
import {
  isGenericSeoDescription,
  type ProductSeoGenerationInput,
} from "@/lib/seo-product-generator";
import {
  BRAND,
  TITLE_IDEAL_MIN,
  TITLE_IDEAL_MAX,
  META_IDEAL_MIN,
  META_IDEAL_MAX,
  EXCERPT_IDEAL_MIN,
  EXCERPT_IDEAL_MAX,
  slugifySeo,
  generateSeoSlugFromName,
  generateSeoImageFilename,
  countWords,
  containsKeyword,
  keywordInFirstParagraph,
  keywordInH2,
  hasSeoFaqSection,
  getProductSeoPath as getProductSeoPathCore,
  resolvePrimaryKeyword,
  titleCaseKeyword,
  type ProductSeoFields,
  type SeoOptimizeMode,
} from "@/lib/seo-core";

export type SeoLevel = "poor" | "medium" | "good" | "excellent";

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

export interface ProductSeoGenerationOptions {
  categoryId?: string;
  categoryName?: string;
  ml?: string;
  variants?: string[];
  tag?: string | null;
  productId?: string;
  deliveryZones?: DeliveryZoneSettings;
  reviews?: SeoReviewInput[];
}

export type LengthBarStatus = "short" | "ok" | "ideal";

export type { ProductSeoFields, SeoOptimizeMode };

export {
  slugifySeo,
  generateSeoSlugFromName,
  generateSeoImageFilename,
  countWords,
  BRAND,
};

export interface ProductSeoOptimizationResult {
  seoKeyword: string;
  seoSecondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  seoSlug: string;
  imageAlt: string;
  seoImageFilename: string;
  seoExcerpt: string;
  desc: string;
  benefits: string[];
  extraSections: ProductExtraSection[];
  schemaOrg: Record<string, unknown>[];
  predictedScore: number;
  predictedLevel: SeoLevel;
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
  if ((fields.benefits?.length ?? 0) > 0) return true;
  const desc = fields.desc ?? "";
  return /^#{2,3}\s/m.test(desc) || /^[A-ZÀ-Ÿ][^\n]{2,40}$/m.test(desc);
}

function hasBulletLists(fields: ProductSeoFields): boolean {
  if ((fields.benefits?.length ?? 0) > 0) return true;
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
  const secondaryKws = fields.seoSecondaryKeywords?.filter((k) => k.trim()) ?? [];
  const excerpt = fields.seoExcerpt?.trim() ?? "";
  const title = fields.seoTitle?.trim() ?? "";
  const meta = fields.metaDescription?.trim() ?? "";
  const slug = fields.seoSlug?.trim() ?? "";
  const alt = fields.imageAlt?.trim() ?? "";
  const desc = fields.desc?.trim() ?? "";
  const wordCount = countWords(desc);
  const excerptLen = excerpt.length;
  const imageFilename = generateSeoImageFilename(keyword || fields.name);
  const hasImage = hasProductImage(fields);
  const hasGallery = hasGalleryImage(fields);
  const indexable = fields.active !== false;
  const hasFaq = hasSeoFaqSection(fields);

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
  const metaNotGeneric = !isGenericSeoDescription(meta);
  const descNotGeneric = !isGenericSeoDescription(desc);

  const titlePts = Math.min(
    15,
    scoreFromParts({ ideal: titleIdeal, ok: titleOk, max: 8 }) + (kwInTitle ? 7 : 0)
  );
  const metaPts = Math.min(
    15,
    scoreFromParts({ ideal: metaIdeal && metaNotGeneric, ok: metaOk && metaNotGeneric, max: 8 }) +
      (kwInMeta ? 7 : 0)
  );
  const slugPts = Math.min(10, (isSlugOptimized(slug) ? 5 : 0) + (kwInSlug ? 5 : 0));
  const altPts = Math.min(10, (alt.length > 0 ? 5 : 0) + (kwInAlt ? 5 : 0));

  let descPts = 0;
  if (wordCount >= 300) descPts += 7;
  else if (wordCount >= 150) descPts += 3;
  if (kwInDesc) descPts += 3;
  if (descNotGeneric) descPts += 2;
  if (hasSubheadings(fields)) descPts += 3;
  if (hasBulletLists(fields)) descPts += 3;
  if (excerptLen >= EXCERPT_IDEAL_MIN && excerptLen <= EXCERPT_IDEAL_MAX) descPts += 2;
  descPts = Math.min(20, descPts);

  let kwPts = 0;
  if (kwSet) kwPts += 2;
  if (secondaryKws.length >= 3) kwPts += 3;
  const placements = [kwInTitle, kwInMeta, kwInSlug, kwInAlt, kwInDesc].filter(Boolean).length;
  kwPts += Math.min(10, placements * 2);
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

  const kwInFirstPara = keywordInFirstParagraph(desc, keyword);
  const kwInH2Heading = keywordInH2(desc, keyword);

  const checks: SeoCheck[] = [
    { id: "kw-title", label: "Mot-clé dans le titre SEO", ok: kwInTitle, points: kwInTitle ? 1 : 0, maxPoints: 1 },
    { id: "kw-meta", label: "Mot-clé dans la meta description", ok: kwInMeta, points: kwInMeta ? 1 : 0, maxPoints: 1 },
    { id: "kw-slug", label: "Mot-clé dans le slug", ok: kwInSlug, points: kwInSlug ? 1 : 0, maxPoints: 1 },
    { id: "kw-alt", label: "Mot-clé dans l'alt image", ok: kwInAlt, points: kwInAlt ? 1 : 0, maxPoints: 1 },
    { id: "kw-desc", label: "Mot-clé dans la description produit", ok: kwInDesc, points: kwInDesc ? 1 : 0, maxPoints: 1 },
    { id: "kw-first-para", label: "Mot-clé dans le premier paragraphe", ok: kwInFirstPara, points: kwInFirstPara ? 1 : 0, maxPoints: 1 },
    { id: "kw-h2", label: "Mot-clé dans au moins un H2", ok: kwInH2Heading, points: kwInH2Heading ? 1 : 0, maxPoints: 1 },
    { id: "desc-words", label: "Longueur description > 300 mots", ok: wordCount >= 300, points: wordCount >= 300 ? 1 : 0, maxPoints: 1 },
    { id: "desc-unique", label: "Description non générique", ok: descNotGeneric, points: descNotGeneric ? 1 : 0, maxPoints: 1 },
    { id: "meta-unique", label: "Meta description non générique", ok: metaNotGeneric, points: metaNotGeneric ? 1 : 0, maxPoints: 1 },
    { id: "sec-kw", label: "Mots-clés secondaires (≥3)", ok: secondaryKws.length >= 3, points: secondaryKws.length >= 3 ? 1 : 0, maxPoints: 1 },
    { id: "excerpt", label: "Description courte SEO (120–200 car.)", ok: excerptLen >= EXCERPT_IDEAL_MIN && excerptLen <= EXCERPT_IDEAL_MAX, points: excerptLen >= EXCERPT_IDEAL_MIN && excerptLen <= EXCERPT_IDEAL_MAX ? 1 : 0, maxPoints: 1 },
    { id: "faq-seo", label: "FAQ SEO structurée", ok: hasFaq, points: hasFaq ? 1 : 0, maxPoints: 1 },
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

function buildGenerationInput(
  fields: ProductSeoFields,
  options?: ProductSeoGenerationOptions
): ProductSeoGenerationInput & { reviews?: SeoReviewInput[] } {
  return {
    fields,
    categoryId: options?.categoryId,
    categoryName: options?.categoryName,
    ml: options?.ml,
    variants: options?.variants,
    tag: options?.tag,
    productId: options?.productId,
    deliveryZones: options?.deliveryZones ?? DEFAULT_DELIVERY_ZONES,
    reviews: options?.reviews,
  };
}

/**
 * Moteur d'optimisation SEO IA — analyse multi-signaux, contenu unique par fiche.
 */
export function optimizeProductSeo(
  fields: ProductSeoFields,
  mode: SeoOptimizeMode = "standard",
  options?: ProductSeoGenerationOptions
): ProductSeoOptimizationResult | null {
  const generated = generateProductSeoAI(buildGenerationInput(fields, options), mode);
  if (!generated) return null;

  const optimized: ProductSeoFields = {
    ...fields,
    seoKeyword: generated.seoKeyword,
    seoSecondaryKeywords: generated.seoSecondaryKeywords,
    seoTitle: generated.seoTitle,
    metaDescription: generated.metaDescription,
    seoSlug: generated.seoSlug,
    imageAlt: generated.imageAlt,
    seoExcerpt: generated.seoExcerpt,
    desc: generated.desc,
    benefits: generated.benefits,
    extraSections: generated.extraSections,
  };

  const scoreResult = computeProductSeoScore(optimized);

  return {
    ...generated,
    predictedScore: scoreResult.score,
    predictedLevel: scoreResult.level,
  };
}

export function previewProductSeoOptimization(
  fields: ProductSeoFields,
  mode: SeoOptimizeMode = "standard",
  options?: ProductSeoGenerationOptions
): ProductSeoOptimizationResult | null {
  return optimizeProductSeo(fields, mode, options);
}

/** @deprecated Utiliser optimizeProductSeo */
export function generateSeoFieldsFromProduct(
  name: string,
  options?: ProductSeoGenerationOptions
): {
  seoKeyword: string;
  seoTitle: string;
  metaDescription: string;
  imageAlt: string;
  seoSlug: string;
  seoImageFilename: string;
} {
  const result = optimizeProductSeo({ name, desc: "" }, "maximal", options);
  if (!result) {
    const keyword = resolvePrimaryKeyword({ name });
    return {
      seoKeyword: keyword,
      seoTitle: `${titleCaseKeyword(keyword)} | ${BRAND}`,
      metaDescription: `Découvrez ${name} chez ${BRAND}. ${getSeoDeliveryPhrase(options?.deliveryZones ?? DEFAULT_DELIVERY_ZONES)}.`,
      imageAlt: `${name} — ${BRAND}`,
      seoSlug: slugifySeo(name),
      seoImageFilename: generateSeoImageFilename(keyword),
    };
  }
  return {
    seoKeyword: result.seoKeyword,
    seoTitle: result.seoTitle,
    metaDescription: result.metaDescription,
    imageAlt: result.imageAlt,
    seoSlug: result.seoSlug,
    seoImageFilename: result.seoImageFilename,
  };
}

export function getProductSeoPath(product: Pick<ProductSeoFields, "seoSlug" | "name"> & { id?: string }): string {
  return getProductSeoPathCore(product);
}

export function getCategorySeoPath(category: { seoSlug?: string | null; id: string }): string {
  const slug = category.seoSlug?.trim() || category.id;
  return `/categorie/${encodeURIComponent(slug)}`;
}

export function getGooglePreview(
  fields: ProductSeoFields,
  siteUrl: string,
  deliveryZones: DeliveryZoneSettings = DEFAULT_DELIVERY_ZONES
): GooglePreviewData {
  const title = fields.seoTitle?.trim() || `${fields.name} | ${BRAND}`;
  const path = getProductSeoPath(fields);
  const url = `${siteUrl.replace(/\/$/, "")}${path}`;
  const deliveryPhrase = getSeoDeliveryPhrase(deliveryZones);
  const description =
    fields.metaDescription?.trim() ||
    `Découvrez ${fields.name} sur ${BRAND}. ${deliveryPhrase}.`;

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

export { isGenericSeoDescription };
