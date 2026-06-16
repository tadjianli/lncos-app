/**
 * LN COS — Application des résultats IA sur une fiche produit
 */

import type { Product } from "@/lib/data";
import type { ProductSEOResult } from "@/lib/ai-generate";
import type { ProductExtraSection } from "@/lib/product-sections";
import { SEO_FAQ_SECTION_ID_PREFIX, slugifySeo } from "@/lib/seo-core";
import { computeProductSeoScore } from "@/lib/seo";

export interface ProductAiApplyResult {
  patch: Partial<Product>;
  predictedScore: number;
}

function buildFaqSection(
  productName: string,
  slug: string,
  faq: ProductSEOResult["faq"],
  existing: ProductExtraSection[] | undefined
): ProductExtraSection[] {
  if (!faq.length) return existing ?? [];

  const faqSection: ProductExtraSection = {
    id: `${SEO_FAQ_SECTION_ID_PREFIX}${slugifySeo(slug) || "produit"}`,
    title: `Questions sur ${productName}`,
    type: "list",
    body: "",
    enabled: true,
    items: faq.map((entry) => {
      const q = entry.question.trim();
      const a = entry.answer.trim();
      if (!q) return a;
      if (!a) return q;
      return q.endsWith("?") ? `${q} ${a}` : `${q} ? ${a}`;
    }),
  };

  const list = [...(existing ?? [])].filter((s) => !s.id.startsWith(SEO_FAQ_SECTION_ID_PREFIX));
  return [...list, faqSection];
}

/** Transforme la réponse IA en patch produit + score SEO prévisionnel. */
export function applyProductSeoAiResult(
  form: Product,
  data: ProductSEOResult
): ProductAiApplyResult {
  const keywords = data.keywords.filter(Boolean);
  const primaryKeyword = keywords[0] ?? form.seoKeyword ?? "";
  const secondaryKeywords = keywords.length > 1 ? keywords.slice(1) : (form.seoSecondaryKeywords ?? []);

  const optimizedName = data.optimizedName.trim() || form.name;
  const slug = data.slug.trim() || form.seoSlug || form.id;

  const patch: Partial<Product> = {
    name: optimizedName,
    seoTitle: data.seoTitle,
    metaDescription: data.metaDescription,
    seoSlug: slug,
    seoExcerpt: data.shortDescription,
    desc: data.longDescription,
    imageAlt: data.imageAlt,
    seoKeyword: primaryKeyword,
    seoSecondaryKeywords: secondaryKeywords,
    benefits: data.benefits.length ? data.benefits : form.benefits,
    extraSections: buildFaqSection(optimizedName, slug, data.faq, form.extraSections),
  };

  const merged: Product = { ...form, ...patch };
  const predictedScore = computeProductSeoScore(merged).score;

  return { patch, predictedScore };
}
