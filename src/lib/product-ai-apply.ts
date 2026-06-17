/**
 * LN COS — Application des résultats IA sur une fiche produit (SEO uniquement)
 */

import type { Product } from "@/lib/data";
import type { ProductSEOResult } from "@/lib/ai-generate";
import {
  applySeoOptimizationPatch,
  type ProductSeoOptimizationResult,
} from "@/lib/seo-claude";

export interface ProductAiApplyResult {
  patch: Partial<Product>;
  predictedScore: number;
}

/**
 * @deprecated Utiliser applySeoOptimizationPatch — ne modifie plus le contenu marketing.
 */
export function applyProductSeoAiResult(
  form: Product,
  data: ProductSEOResult,
): ProductAiApplyResult {
  const keywords = data.keywords.filter(Boolean);
  const optimization: ProductSeoOptimizationResult = {
    seoTitle: data.seoTitle,
    metaDescription: data.metaDescription,
    focusKeyword: keywords[0] ?? form.seoKeyword ?? "",
    secondaryKeywords: keywords.length > 1 ? keywords.slice(1) : (form.seoSecondaryKeywords ?? []),
    slug: data.slug.trim() || form.seoSlug || form.id,
    imageAlt: data.imageAlt,
    predictedScore: 0,
  };

  return applySeoOptimizationPatch(form, optimization);
}
