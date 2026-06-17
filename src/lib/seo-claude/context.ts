/**
 * Assistant SEO produit — Claude (Anthropic) uniquement.
 * Le contenu marketing produit est READ ONLY.
 */

import type { Product } from "@/lib/data";
import { getAppName } from "@/lib/branding";

/** Champs jamais modifiables par l'assistant SEO */
export const PROTECTED_PRODUCT_FIELDS = [
  "name",
  "desc",
  "seoExcerpt",
  "benefits",
  "usageTips",
  "extraSections",
  "ingredients",
  "variants",
  "productVariants",
  "price",
  "stock",
] as const;

/** Contexte produit en lecture seule pour Claude */
export interface ReadOnlyProductSeoContext {
  productName: string;
  shortDescription: string;
  longDescription: string;
  characteristics: string[];
  usageTips: string[];
  category: string;
  brand: string;
  tags: string[];
  attributes: Record<string, string>;
  existingSeo: {
    seoTitle: string;
    metaDescription: string;
    focusKeyword: string;
    secondaryKeywords: string[];
    slug: string;
    imageAlt: string;
  };
}

export interface ProductSeoAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface ProductSeoOptimizationResult {
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  slug: string;
  imageAlt: string;
  predictedScore: number;
}

export function buildReadOnlyProductSeoContext(
  form: Product,
  categoryName?: string,
): ReadOnlyProductSeoContext {
  const attributes: Record<string, string> = {};
  if (form.ml?.trim()) attributes.contenance = form.ml.trim();
  if (form.tag?.trim()) attributes.tag = form.tag.trim();
  if (form.variants?.length) attributes.variantes = form.variants.join(", ");
  if (form.productVariants?.length) {
    attributes.variantes = form.productVariants.map((v) => v.name).join(", ");
  }

  const tags = [form.tag, form.cat].filter((t): t is string => Boolean(t?.trim()));

  return {
    productName: form.name.trim(),
    shortDescription: form.seoExcerpt?.trim() || "",
    longDescription: form.desc?.trim() || "",
    characteristics: (form.benefits ?? []).filter(Boolean),
    usageTips: (form.usageTips ?? []).filter(Boolean),
    category: categoryName?.trim() || form.cat || "",
    brand: getAppName(),
    tags,
    attributes,
    existingSeo: {
      seoTitle: form.seoTitle?.trim() || "",
      metaDescription: form.metaDescription?.trim() || "",
      focusKeyword: form.seoKeyword?.trim() || "",
      secondaryKeywords: form.seoSecondaryKeywords?.filter(Boolean) ?? [],
      slug: form.seoSlug?.trim() || "",
      imageAlt: form.imageAlt?.trim() || "",
    },
  };
}

export function formatContextForPrompt(ctx: ReadOnlyProductSeoContext): string {
  return [
    `=== CONTENU PRODUIT (LECTURE SEULE — NE PAS MODIFIER) ===`,
    `Nom: ${ctx.productName}`,
    ctx.category ? `Catégorie: ${ctx.category}` : null,
    `Marque: ${ctx.brand}`,
    ctx.tags.length ? `Tags: ${ctx.tags.join(", ")}` : null,
    Object.keys(ctx.attributes).length
      ? `Attributs: ${Object.entries(ctx.attributes)
          .map(([k, v]) => `${k}=${v}`)
          .join("; ")}`
      : null,
    ctx.shortDescription ? `Description courte (marketing): ${ctx.shortDescription}` : null,
    ctx.longDescription ? `Description longue (marketing):\n${ctx.longDescription}` : null,
    ctx.characteristics.length
      ? `Caractéristiques / bénéfices:\n${ctx.characteristics.map((c) => `- ${c}`).join("\n")}`
      : null,
    ctx.usageTips.length
      ? `Conseils d'utilisation:\n${ctx.usageTips.map((c) => `- ${c}`).join("\n")}`
      : null,
    "",
    `=== MÉTADONNÉES SEO ACTUELLES ===`,
    `Titre SEO: ${ctx.existingSeo.seoTitle || "(vide)"}`,
    `Meta description: ${ctx.existingSeo.metaDescription || "(vide)"}`,
    `Mot-clé principal: ${ctx.existingSeo.focusKeyword || "(vide)"}`,
    `Mots-clés secondaires: ${ctx.existingSeo.secondaryKeywords.join(", ") || "(aucun)"}`,
    `Slug: ${ctx.existingSeo.slug || "(vide)"}`,
    `Alt image: ${ctx.existingSeo.imageAlt || "(vide)"}`,
  ]
    .filter(Boolean)
    .join("\n");
}
