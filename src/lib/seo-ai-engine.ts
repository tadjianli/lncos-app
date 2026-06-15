/**
 * LN COS — Moteur SEO IA (analyse multi-signaux, contenu unique anti-duplication)
 */

import type { ProductExtraSection } from "@/lib/product-sections";
import type { DeliveryZoneSettings } from "@/lib/delivery-zones";
import { DEFAULT_DELIVERY_ZONES, getSeoDeliveryPhrase } from "@/lib/delivery-zones";
import type { ProductSeoFields, SeoOptimizeMode } from "@/lib/seo-core";
import {
  countWords,
  generateSeoImageFilename,
  normalizeSeoText,
  SEO_FAQ_SECTION_ID_PREFIX,
  slugifySeo,
  titleCaseKeyword,
} from "@/lib/seo-core";
import {
  analyzeProduct,
  generateUniqueImageAlt,
  generateUniqueLongDescription,
  generateUniqueMetaDescription,
  generateUniqueSeoTitle,
  generateUniqueBenefits,
  generateUniqueFaqSection,
  isGenericSeoDescription,
  type ProductAnalysis,
  type ProductSeoGenerationInput,
} from "@/lib/seo-product-generator";
import { buildProductSchemaOrg, type ProductReviewSchemaInput } from "@/lib/seo-schema";

export interface SeoReviewInput {
  body: string;
  rating: number;
  title?: string;
  authorName?: string;
  verified?: boolean;
  date?: string;
}

export interface ProductSeoAiInput extends ProductSeoGenerationInput {
  reviews?: SeoReviewInput[];
}

export interface ProductSeoAiResult {
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
}

const BRAND = "LN COS";
const EXCERPT_MIN = 120;
const EXCERPT_MAX = 200;

const FR_STOP_WORDS = new Set([
  "avec", "dans", "pour", "plus", "tout", "tous", "toute", "toutes", "cette", "celui",
  "celle", "ceux", "elles", "nous", "vous", "elle", "elles", "très", "bien", "aussi",
  "mais", "comme", "chez", "sans", "sous", "entre", "depuis", "alors", "donc", "car",
  "the", "and", "des", "les", "une", "est", "son", "ses", "mon", "mes", "sur", "par",
  "que", "qui", "quoi", "dont", "être", "avoir", "faire", "lncos", "lnc", "cos",
]);

function simpleHash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickBySeed<T>(seed: string, salt: string, options: T[]): T {
  if (options.length === 0) throw new Error("pickBySeed: empty options");
  return options[simpleHash(`${seed}:${salt}`) % options.length];
}

function tokenize(text: string): string[] {
  return normalizeSeoText(text)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !FR_STOP_WORDS.has(w));
}

function mineReviewInsights(reviews: SeoReviewInput[]): {
  phrases: string[];
  topQuote: string | null;
  avgRating: number;
  count: number;
  themes: string[];
} {
  const published = reviews.filter((r) => r.body.trim().length >= 12 && r.rating >= 3);
  if (published.length === 0) {
    return { phrases: [], topQuote: null, avgRating: 0, count: 0, themes: [] };
  }

  const freq = new Map<string, number>();
  for (const r of published) {
    const tokens = tokenize(`${r.title ?? ""} ${r.body}`);
    const seen = new Set<string>();
    for (const t of tokens) {
      if (seen.has(t)) continue;
      seen.add(t);
      freq.set(t, (freq.get(t) ?? 0) + 1);
    }
    for (let i = 0; i < tokens.length - 1; i += 1) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      if (bigram.length >= 8) freq.set(bigram, (freq.get(bigram) ?? 0) + 1);
    }
  }

  const themes = [...freq.entries()]
    .filter(([, c]) => c >= 1)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 8)
    .map(([k]) => k);

  const bestReview = [...published].sort((a, b) => b.rating - a.rating || b.body.length - a.body.length)[0];
  const topQuote = bestReview
    ? bestReview.body.trim().split(/[.!?]/)[0]?.trim().slice(0, 120) ?? null
    : null;

  const avgRating = published.reduce((s, r) => s + r.rating, 0) / published.length;

  return {
    phrases: themes.slice(0, 5),
    topQuote,
    avgRating,
    count: published.length,
    themes,
  };
}

function generateSecondaryKeywords(
  analysis: ProductAnalysis,
  reviewInsights: ReturnType<typeof mineReviewInsights>
): string[] {
  const { keyword, keywordTitle, categoryLabel, formatSpec, variantSummary, seed, productName } = analysis;
  const candidates: string[] = [];

  if (formatSpec) candidates.push(`${keyword} ${formatSpec}`);
  candidates.push(`${keyword} ${categoryLabel}`);
  candidates.push(`${categoryLabel} ${BRAND.toLowerCase()}`);
  candidates.push(`acheter ${keyword}`);
  if (variantSummary) candidates.push(`${keyword} ${variantSummary.split(",")[0]?.trim() ?? ""}`);

  const nameTokens = tokenize(stripBrand(productName)).slice(0, 2);
  if (nameTokens.length >= 2) candidates.push(nameTokens.join(" "));

  for (const theme of reviewInsights.phrases.slice(0, 3)) {
    if (theme.includes(" ")) candidates.push(`${keyword} ${theme}`);
    else candidates.push(`${theme} ${categoryLabel}`);
  }

  const normalizedPrimary = normalizeSeoText(keyword);
  const unique = [...new Set(
    candidates
      .map((c) => c.trim().toLowerCase().replace(/\s{2,}/g, " "))
      .filter((c) => c.length >= 5 && c !== normalizedPrimary && !c.startsWith(normalizedPrimary + " " + normalizedPrimary))
  )];

  const start = simpleHash(`${seed}:sec-kw`) % Math.max(1, unique.length);
  const rotated = [...unique.slice(start), ...unique.slice(0, start)];
  return rotated.slice(0, 5);
}

function stripBrand(name: string): string {
  return name.replace(/\bln\s*cos\b/gi, "").replace(/\s{2,}/g, " ").trim();
}

function fitCharLength(text: string, min: number, max: number, fillers: string[] = []): string {
  let result = text.trim();
  if (result.length > max) {
    const cut = result.slice(0, max - 1).trimEnd();
    const lastSpace = cut.lastIndexOf(" ");
    result = (lastSpace > min ? cut.slice(0, lastSpace) : cut).trimEnd();
  }
  let fillerIdx = 0;
  while (result.length < min && fillerIdx < fillers.length) {
    const next = `${result}${fillers[fillerIdx]}`;
    if (next.length <= max) result = next;
    fillerIdx += 1;
  }
  return result.slice(0, max);
}

function generateSeoExcerpt(
  analysis: ProductAnalysis,
  metaDescription: string,
  reviewInsights: ReturnType<typeof mineReviewInsights>
): string {
  const { productName, keywordTitle, primaryBenefit, categoryLabel, formatSpec, seed, deliveryPhrase } = analysis;

  const reviewBit =
    reviewInsights.count >= 2 && reviewInsights.avgRating >= 4
      ? ` Noté ${reviewInsights.avgRating.toFixed(1)}/5 par ${reviewInsights.count} clientes.`
      : "";

  const templates = [
    `${productName}${formatSpec ? ` (${formatSpec})` : ""} — ${primaryBenefit.charAt(0).toUpperCase()}${primaryBenefit.slice(1)}.${reviewBit} ${deliveryPhrase}.`,
    `${keywordTitle}, référence ${categoryLabel} ${BRAND}.${formatSpec ? ` Format ${formatSpec}.` : ""} ${primaryBenefit.charAt(0).toUpperCase()}${primaryBenefit.slice(1)}.`,
    `Fiche ${categoryLabel} dédiée à ${keywordTitle.toLowerCase()} : ${primaryBenefit}.${reviewBit}`,
    `${productName} chez ${BRAND} — ${categoryLabel} sélectionné pour ${primaryBenefit.split(",")[0]?.trim() ?? primaryBenefit}.`,
  ];

  let excerpt = pickBySeed(seed, "excerpt", templates);

  const metaNorm = normalizeSeoText(metaDescription.slice(0, 80));
  if (normalizeSeoText(excerpt.slice(0, 80)) === metaNorm) {
    excerpt = pickBySeed(seed, "excerpt-alt", templates.slice().reverse());
  }

  return fitCharLength(excerpt, EXCERPT_MIN, EXCERPT_MAX, [` ${BRAND}.`, ` ${deliveryPhrase}.`]);
}

function enhanceImageAlt(
  baseAlt: string,
  analysis: ProductAnalysis,
  galleryCount: number
): string {
  if (galleryCount <= 1) return baseAlt;

  const extras = [
    ` — galerie ${galleryCount} vues`,
    `, photo ${pickBySeed(analysis.seed, "img-idx", ["principale", "détail", "packshot"])} (${galleryCount} images)`,
    ` — visuel ${galleryCount} photos ${BRAND}`,
  ];
  const suffix = pickBySeed(analysis.seed, "alt-gallery", extras);
  return fitCharLength(`${baseAlt}${suffix}`, 24, 125);
}

function enhanceFaqWithReviews(
  faq: ProductExtraSection,
  analysis: ProductAnalysis,
  reviewInsights: ReturnType<typeof mineReviewInsights>
): ProductExtraSection {
  if (reviewInsights.count === 0 || !reviewInsights.topQuote) return faq;

  const items = [...(faq.items ?? [])];
  const reviewFaq = `${analysis.productName} a-t-il de bons avis ? ${reviewInsights.count} avis clientes (${reviewInsights.avgRating.toFixed(1)}/5) : « ${reviewInsights.topQuote}… ».`;
  if (!items.some((i) => i.includes("avis clientes"))) {
    items.push(reviewFaq);
  }

  if (reviewInsights.themes[0]) {
    const themeFaq = `Que disent les clientes sur ${analysis.keywordTitle.toLowerCase()} ? Retours récurrents : ${reviewInsights.themes.slice(0, 2).join(", ")}.`;
    if (!items.some((i) => normalizeSeoText(i).includes(normalizeSeoText(reviewInsights.themes[0])))) {
      items.push(themeFaq);
    }
  }

  return { ...faq, items: items.slice(0, 5) };
}

function injectReviewSocialProof(
  desc: string,
  analysis: ProductAnalysis,
  reviewInsights: ReturnType<typeof mineReviewInsights>
): string {
  if (reviewInsights.count < 1) return desc;
  if (desc.includes("avis clientes") || desc.includes("clientes LN COS")) return desc;

  const heading = `## Ce que disent les clientes sur ${analysis.productName}`;
  const body =
    reviewInsights.count >= 2
      ? `Avec ${reviewInsights.count} avis publiés (moyenne ${reviewInsights.avgRating.toFixed(1)}/5), ${analysis.keywordTitle.toLowerCase()} recueille des retours concrets.${reviewInsights.topQuote ? ` Exemple : « ${reviewInsights.topQuote} ».` : ""}${reviewInsights.themes.length ? ` Thèmes récurrents : ${reviewInsights.themes.slice(0, 3).join(", ")}.` : ""}`
      : `Une cliente ${BRAND} partage son expérience : « ${reviewInsights.topQuote ?? "produit conforme à la fiche"} ».`;

  const block = `${heading}\n\n${body}\n\n`;
  const insertAt = desc.indexOf("\n\n## ");
  if (insertAt > 0) {
    return `${desc.slice(0, insertAt)}\n\n${block}${desc.slice(insertAt + 2)}`;
  }
  return `${desc}\n\n${block}`;
}

function countGalleryImages(fields: ProductSeoFields): number {
  const urls = new Set<string>();
  if (fields.mainImageUrl?.trim()) urls.add(fields.mainImageUrl.trim());
  if (fields.imageUrl?.trim()) urls.add(fields.imageUrl.trim());
  for (const g of fields.galleryImages ?? []) {
    if (g?.trim()) urls.add(g.trim());
  }
  return urls.size;
}

function generateUniqueSeoSlug(keyword: string, productName: string, formatSpec: string): string {
  const parts = [slugifySeo(keyword), formatSpec ? slugifySeo(formatSpec) : ""].filter(Boolean);
  const combined = parts.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (combined.length >= 3) return combined.length <= 80 ? combined : combined.slice(0, 80).replace(/-$/, "");
  const fromName = slugifySeo(productName);
  return fromName.length <= 80 ? fromName : fromName.slice(0, 80).replace(/-$/, "");
}

function mergeExtraSections(
  existing: ProductExtraSection[] | undefined,
  faq: ProductExtraSection,
  mode: SeoOptimizeMode
): ProductExtraSection[] {
  const list = [...(existing ?? [])];
  const faqIdx = list.findIndex((s) => s.id.startsWith(SEO_FAQ_SECTION_ID_PREFIX));

  if (mode === "maximal") {
    return [...list.filter((s) => !s.id.startsWith(SEO_FAQ_SECTION_ID_PREFIX)), faq];
  }

  if (faqIdx >= 0) {
    list[faqIdx] = { ...list[faqIdx], ...faq, enabled: true };
    return list;
  }
  return [...list, faq];
}

function shouldRegenerateDescription(
  fields: ProductSeoFields,
  keyword: string,
  mode: SeoOptimizeMode
): boolean {
  if (mode === "maximal") return true;
  const desc = fields.desc?.trim() ?? "";
  if (isGenericSeoDescription(desc)) return true;
  if (countWords(desc) < 300) return true;
  const first = desc.split(/\n\n+/)[0] ?? "";
  const kw = keyword.toLowerCase();
  if (kw && !normalizeSeoText(first).includes(normalizeSeoText(kw.split(/\s+/)[0] ?? kw))) return true;
  if (!/^#{2}\s/m.test(desc)) return true;
  return false;
}

function shouldRegenerateExcerpt(fields: ProductSeoFields, mode: SeoOptimizeMode): boolean {
  if (mode === "maximal") return true;
  const ex = fields.seoExcerpt?.trim() ?? "";
  if (!ex) return true;
  if (ex.length < EXCERPT_MIN || ex.length > EXCERPT_MAX + 20) return true;
  if (isGenericSeoDescription(ex)) return true;
  return false;
}

function shouldRegenerateSecondaryKeywords(fields: ProductSeoFields, mode: SeoOptimizeMode): boolean {
  if (mode === "maximal") return true;
  const kws = fields.seoSecondaryKeywords?.filter((k) => k.trim()) ?? [];
  return kws.length < 3;
}

function toSchemaReviews(reviews: SeoReviewInput[]): ProductReviewSchemaInput[] {
  return reviews
    .filter((r) => r.body.trim().length >= 8 && r.rating >= 1)
    .slice(0, 5)
    .map((r) => ({
      authorName: r.authorName?.trim() || "Cliente LN COS",
      rating: r.rating,
      body: r.body.trim(),
      title: r.title,
      verified: r.verified,
      date: r.date,
    }));
}

function shouldRegenerateBenefits(fields: ProductSeoFields, mode: SeoOptimizeMode): boolean {
  if (mode === "maximal") return true;
  const benefits = fields.benefits?.filter((b) => b.trim()) ?? [];
  if (benefits.length < 3) return true;
  return benefits.some((b) => isGenericSeoDescription(b));
}

/**
 * Génération SEO IA — analyse nom, catégorie, description, images, caractéristiques et avis.
 */
export function generateProductSeoAI(
  input: ProductSeoAiInput,
  mode: SeoOptimizeMode = "standard"
): ProductSeoAiResult | null {
  const productName = input.fields.name?.trim();
  if (!productName) return null;

  const deliveryZones: DeliveryZoneSettings = input.deliveryZones ?? DEFAULT_DELIVERY_ZONES;
  const analysis = analyzeProduct({ ...input, deliveryZones });
  const reviews = input.reviews ?? [];
  const reviewInsights = mineReviewInsights(reviews);

  const seoKeyword = analysis.keyword;
  const seoTitle = generateUniqueSeoTitle(analysis);
  let metaDescription = generateUniqueMetaDescription(analysis);

  if (reviewInsights.count >= 3 && reviewInsights.avgRating >= 4.2) {
    const ratingSnippet = ` (${reviewInsights.avgRating.toFixed(1)}/5, ${reviewInsights.count} avis)`;
    if (metaDescription.length + ratingSnippet.length <= 160) {
      metaDescription = fitCharLength(
        metaDescription.replace(/\.$/, "") + ratingSnippet + ".",
        140,
        160
      );
    }
  }

  const seoSlug = generateUniqueSeoSlug(seoKeyword, productName, analysis.formatSpec);
  const galleryCount = countGalleryImages(input.fields);
  const imageAlt = enhanceImageAlt(
    generateUniqueImageAlt(analysis),
    analysis,
    galleryCount
  );
  const seoImageFilename = generateSeoImageFilename(seoKeyword);

  let desc = shouldRegenerateDescription(input.fields, seoKeyword, mode)
    ? generateUniqueLongDescription(analysis)
    : (input.fields.desc?.trim() ?? generateUniqueLongDescription(analysis));
  desc = injectReviewSocialProof(desc, analysis, reviewInsights);

  const benefits = shouldRegenerateBenefits(input.fields, mode)
    ? generateUniqueBenefits(analysis)
    : (input.fields.benefits?.filter((b) => b.trim()) ?? generateUniqueBenefits(analysis));

  let faq = generateUniqueFaqSection(analysis);
  faq = enhanceFaqWithReviews(faq, analysis, reviewInsights);
  const extraSections = mergeExtraSections(input.fields.extraSections, faq, mode);

  const seoSecondaryKeywords = shouldRegenerateSecondaryKeywords(input.fields, mode)
    ? generateSecondaryKeywords(analysis, reviewInsights)
    : (input.fields.seoSecondaryKeywords?.filter((k) => k.trim()) ?? generateSecondaryKeywords(analysis, reviewInsights));

  const seoExcerpt = shouldRegenerateExcerpt(input.fields, mode)
    ? generateSeoExcerpt(analysis, metaDescription, reviewInsights)
    : (input.fields.seoExcerpt?.trim() ?? generateSeoExcerpt(analysis, metaDescription, reviewInsights));

  const schemaOrg = buildProductSchemaOrg(
    {
      id: input.productId ?? slugifySeo(productName),
      name: productName,
      desc,
      seoExcerpt,
      metaDescription,
      seoKeyword,
      seoSecondaryKeywords,
      seoSlug,
      imageAlt,
      price: 0,
      stock: 1,
      rating: reviewInsights.avgRating || 0,
      reviews: reviewInsights.count,
      mainImageUrl: input.fields.mainImageUrl,
      imageUrl: input.fields.imageUrl,
      galleryImages: input.fields.galleryImages,
      extraSections,
    },
    toSchemaReviews(reviews)
  );

  return {
    seoKeyword,
    seoSecondaryKeywords,
    seoTitle,
    metaDescription,
    seoSlug,
    imageAlt,
    seoImageFilename,
    seoExcerpt,
    desc,
    benefits,
    extraSections,
    schemaOrg,
  };
}

export { isGenericSeoDescription, type ProductSeoGenerationInput };
