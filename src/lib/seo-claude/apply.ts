/**
 * Application des métadonnées SEO Claude — champs marketing protégés.
 */

import type { Product } from "@/lib/data";
import type { ProductSeoOptimizationResult } from "./context";
import { computeProductSeoScore } from "@/lib/seo";
import { PROTECTED_PRODUCT_FIELDS } from "./context";

export interface SeoOnlyPatchResult {
  patch: Partial<Product>;
  predictedScore: number;
}

/** Applique uniquement les champs SEO autorisés — jamais le contenu marketing. */
export function applySeoOptimizationPatch(
  form: Product,
  data: ProductSeoOptimizationResult,
): SeoOnlyPatchResult {
  const patch: Partial<Product> = {
    seoTitle: data.seoTitle,
    metaDescription: data.metaDescription,
    seoKeyword: data.focusKeyword,
    seoSecondaryKeywords: data.secondaryKeywords,
    seoSlug: data.slug,
    imageAlt: data.imageAlt,
  };

  // Garde-fou runtime : aucun champ protégé
  for (const key of PROTECTED_PRODUCT_FIELDS) {
    if (key in patch) {
      delete (patch as Record<string, unknown>)[key];
    }
  }

  const merged: Product = { ...form, ...patch };
  const predictedScore = data.predictedScore || computeProductSeoScore(merged).score;

  return { patch, predictedScore };
}

/** Vérifie qu'un patch ne touche pas aux champs protégés. */
export function assertSeoOnlyPatch(patch: Partial<Product>): void {
  for (const key of Object.keys(patch) as (keyof Product)[]) {
    if ((PROTECTED_PRODUCT_FIELDS as readonly string[]).includes(key)) {
      throw new Error(`Champ protégé interdit pour l'assistant SEO: ${String(key)}`);
    }
  }
}
