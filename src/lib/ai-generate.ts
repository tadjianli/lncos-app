/**
 * LN COS — Génération IA produit & blog (Anthropic SDK)
 */

import {
  anthropicComplete,
  anthropicCompleteWithVision,
  resolveAnthropicModelForGeneration,
  type AnthropicCompletionResult,
} from "@/lib/ai-anthropic-client";
import { loadVisionImages } from "@/lib/ai-vision-images";
import { parseJsonFromLlm } from "@/lib/ai-json";
import type { AiGenerateAction, AiLanguage, AiSettings, AiTone } from "@/lib/ai-settings";
import {
  AI_TONE_LABELS,
  defaultModelForProvider,
  descriptionLengthHint,
  languagePrompt,
  tonePrompt,
} from "@/lib/ai-settings";
import { buildBlogPrompt, buildGeneratePrompt } from "@/lib/ai-prompts";
import { completeAi } from "@/lib/ai-provider-client";
import type { BlogContentBlock } from "@/lib/contracts/blog";
import { markdownToBlogBlocks, parseBlogBody } from "@/lib/blog-blocks";

const BRAND = "LN COS";

export interface ProductSEOContext {
  productName: string;
  category?: string;
  brand?: string;
  price?: string;
  ml?: string;
  variants?: string[];
  tag?: string;
  keywords?: string;
  ingredients?: string;
  benefits?: string;
  usage?: string;
  existingDescription?: string;
  /** URLs images (principale + galerie) pour contexte visuel textuel */
  imageUrls?: string[];
  imageAltHint?: string;
}

export interface ProductSeoFaqItem {
  question: string;
  answer: string;
}

export interface ProductSEOResult {
  optimizedName: string;
  seoTitle: string;
  metaDescription: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  imageAlt: string;
  keywords: string[];
  benefits: string[];
  faq: ProductSeoFaqItem[];
}

export interface BlogArticleContext {
  topic: string;
  title?: string;
  primaryKeyword?: string;
  wordCount?: number;
  tone?: AiSettings["tone"];
}

export interface BlogArticleResult {
  title: string;
  slug: string;
  excerpt: string;
  metaDescription: string;
  seoTitle: string;
  seoKeyword: string;
  tags: string[];
  body: BlogContentBlock[];
  contentMarkdown?: string;
  faq: { question: string; answer: string }[];
  schemaArticle: Record<string, unknown> | null;
  imageSuggestions: { caption: string; alt: string }[];
}

export interface AiGenerationMeta {
  tokensInput: number;
  tokensOutput: number;
  model: string;
  provider: string;
  visionUsed?: boolean;
}

type ResolvedAiConfig = {
  apiKey: string;
  model: string;
  settings: AiSettings;
};

async function aiCompleteJson(
  config: ResolvedAiConfig,
  opts: { system: string; user: string; maxTokens?: number; imageUrls?: string[] }
): Promise<AnthropicCompletionResult & { visionUsed?: boolean }> {
  if (config.settings.provider === "anthropic") {
    const model = await anthropicModel(config);
    const imageUrls = opts.imageUrls?.filter(Boolean) ?? [];
    if (imageUrls.length > 0) {
      const images = await loadVisionImages(imageUrls);
      if (images.length > 0) {
        const result = await anthropicCompleteWithVision({
          apiKey: config.apiKey,
          model,
          system: opts.system,
          user: opts.user,
          maxTokens: opts.maxTokens,
          images,
        });
        return { ...result, visionUsed: true };
      }
    }
    return anthropicComplete({
      apiKey: config.apiKey,
      model,
      system: opts.system,
      user: opts.user,
      maxTokens: opts.maxTokens,
    });
  }

  const model = config.model.trim() || defaultModelForProvider(config.settings.provider);
  const result = await completeAi({
    provider: config.settings.provider,
    apiKey: config.apiKey,
    model,
    system: opts.system,
    user: opts.user,
    maxTokens: opts.maxTokens,
  });

  return {
    text: result.text,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    model,
  };
}

function assertAiConfigured(config: ResolvedAiConfig): void {
  if (!config.apiKey) {
    throw new Error("Configurez une clé API IA dans Paramètres → IA");
  }
}

async function anthropicModel(config: ResolvedAiConfig): Promise<string> {
  return resolveAnthropicModelForGeneration(config.apiKey, config.model);
}

function productSeoSystem(lang: string, tone: string): string {
  return `Tu es expert SEO e-commerce beauté pour ${BRAND}.
Langue: ${lang}. Ton: ${tone}.
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans commentaire, sans texte avant ou après.`;
}

function buildProductSeoUserPrompt(
  ctx: ProductSEOContext,
  descriptionLength: AiSettings["descriptionLength"]
): string {
  const imageContext =
    ctx.imageUrls && ctx.imageUrls.length > 0
      ? `${ctx.imageUrls.length} image(s) produit jointe(s) — analyse visuelle pour description, bénéfices et ALT.`
      : null;

  const lines = [
    `Produit: ${ctx.productName}`,
    ctx.category ? `Catégorie: ${ctx.category}` : null,
    ctx.brand ? `Marque: ${ctx.brand}` : null,
    ctx.price ? `Prix: ${ctx.price}` : null,
    ctx.ml ? `Contenance: ${ctx.ml}` : null,
    ctx.variants?.length ? `Variantes: ${ctx.variants.join(", ")}` : null,
    ctx.tag ? `Tag boutique: ${ctx.tag}` : null,
    ctx.keywords ? `Mot-clé principal: ${ctx.keywords}` : null,
    ctx.ingredients ? `Ingrédients: ${ctx.ingredients}` : null,
    ctx.benefits ? `Bénéfices: ${ctx.benefits}` : null,
    ctx.usage ? `Usage: ${ctx.usage}` : null,
    ctx.existingDescription ? `Description existante: ${ctx.existingDescription}` : null,
    ctx.imageAltHint ? `Alt image actuel: ${ctx.imageAltHint}` : null,
    imageContext,
    `Longueur description courte: ${descriptionLengthHint("short")}`,
    `Longueur description longue: ${descriptionLengthHint(descriptionLength)} (350–500 mots, markdown H2 autorisé)`,
    "",
    "Génère ce JSON exact:",
    `{`,
    `  "optimizedName": "nom produit optimisé SEO (lisible, avec mot-clé principal)",`,
    `  "seoTitle": "titre SEO 50-60 caractères",`,
    `  "metaDescription": "méta description 150-160 caractères",`,
    `  "slug": "slug-url-minuscules-tirets-sans-accents",`,
    `  "shortDescription": "description courte / extrait (120-200 car.)",`,
    `  "longDescription": "description longue markdown avec ## sous-titres",`,
    `  "benefits": ["bénéfice clé 1", "bénéfice clé 2", "bénéfice clé 3", "bénéfice clé 4"],`,
    `  "imageAlt": "texte ALT image accessible et SEO",`,
    `  "keywords": ["mot-clé principal", "mot2", "mot3", "mot4", "mot5"],`,
    `  "faq": [`,
    `    {"question": "Question SEO 1 ?", "answer": "Réponse concise."},`,
    `    {"question": "Question SEO 2 ?", "answer": "Réponse concise."},`,
    `    {"question": "Question SEO 3 ?", "answer": "Réponse concise."}`,
    `  ]`,
    `}`,
    "",
    `Marque obligatoire dans le titre SEO : ${BRAND}. FAQ : 3 à 5 entrées. benefits : 4 à 5 puces courtes. Slug sans accents.`,
  ];
  return lines.filter(Boolean).join("\n");
}

function normalizeFaq(raw: unknown): ProductSeoFaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question = String(row.question ?? "").trim();
      const answer = String(row.answer ?? "").trim();
      if (!question && !answer) return null;
      return { question, answer };
    })
    .filter((item): item is ProductSeoFaqItem => item !== null)
    .slice(0, 6);
}

function normalizeProductSeo(raw: ProductSEOResult): ProductSEOResult {
  return {
    optimizedName: String(raw.optimizedName ?? "").trim(),
    seoTitle: String(raw.seoTitle ?? "").trim(),
    metaDescription: String(raw.metaDescription ?? "").trim(),
    slug: String(raw.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
    shortDescription: String(raw.shortDescription ?? "").trim(),
    longDescription: String(raw.longDescription ?? "").trim(),
    imageAlt: String(raw.imageAlt ?? "").trim(),
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords.map((k) => String(k).trim()).filter(Boolean)
      : [],
    benefits: Array.isArray((raw as { benefits?: unknown }).benefits)
      ? (raw as { benefits: unknown[] }).benefits.map((b) => String(b).trim()).filter(Boolean).slice(0, 8)
      : [],
    faq: normalizeFaq((raw as { faq?: unknown }).faq),
  };
}

function blogSystem(lang: string, tone: string): string {
  return `Tu es rédacteur magazine beauté pour ${BRAND}. Langue: ${lang}. Ton: ${tone}.
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown autour du JSON.`;
}

function buildBlogJsonUserPrompt(opts: {
  topic: string;
  primaryKeyword?: string;
  wordCount: number;
  toneLabel: string;
}): string {
  const kw = opts.primaryKeyword?.trim();
  return `Rédige un article magazine beauté LN COS d'environ ${opts.wordCount} mots.
Sujet: ${opts.topic}
${kw ? `Mot-clé principal SEO (à intégrer naturellement): ${kw}` : ""}
Ton rédactionnel: ${opts.toneLabel}

Structure obligatoire dans "body": un seul H1, plusieurs H2 et H3, paragraphes (type "p"). Pas de markdown dans body — uniquement des blocs JSON.

Retourne ce JSON exact:
{
  "title": "titre accrocheur (H1)",
  "slug": "slug-url-seo-minuscules-tirets",
  "excerpt": "chapô 2-3 phrases",
  "metaDescription": "méta description 150-160 caractères",
  "seoTitle": "titre SEO 50-60 caractères incluant LN COS",
  "seoKeyword": "mot-clé principal",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "body": [
    {"type":"h1","text":"Titre principal"},
    {"type":"p","text":"Introduction…"},
    {"type":"h2","text":"Section"},
    {"type":"h3","text":"Sous-section"},
    {"type":"p","text":"Paragraphe…"}
  ],
  "faq": [
    {"question":"Question SEO ?","answer":"Réponse concise."}
  ],
  "schemaArticle": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "…",
    "description": "…",
    "author": {"@type": "Person", "name": "Équipe LN COS"},
    "publisher": {"@type": "Organization", "name": "LN COS"}
  }
}

faq: 3 à 5 entrées. tags: 4 à 8 mots-clés pertinents. Marque LN COS dans seoTitle.`;
}

function normalizeBlogBody(raw: unknown, title: string, contentMarkdown?: string): BlogContentBlock[] {
  const fromBlocks = parseBlogBody(raw);
  if (fromBlocks.length > 0) {
    if (fromBlocks[0].type !== "h1" && title) {
      return [{ type: "h1", text: title }, ...fromBlocks];
    }
    return fromBlocks;
  }
  if (contentMarkdown?.trim()) {
    return markdownToBlogBlocks(contentMarkdown, title);
  }
  return title ? [{ type: "h1", text: title }] : [];
}

function normalizeBlogArticle(raw: BlogArticleResult & { contentMarkdown?: string }): BlogArticleResult {
  const title = String(raw.title ?? "").trim();
  const contentMarkdown = String(raw.contentMarkdown ?? "").trim();
  const body = normalizeBlogBody((raw as { body?: unknown }).body, title, contentMarkdown);

  return {
    title,
    slug: String(raw.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
    excerpt: String(raw.excerpt ?? "").trim(),
    metaDescription: String(raw.metaDescription ?? "").trim(),
    seoTitle: String(raw.seoTitle ?? "").trim() || title,
    seoKeyword: String(raw.seoKeyword ?? "").trim(),
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
      : [],
    body,
    contentMarkdown: contentMarkdown || undefined,
    faq: Array.isArray(raw.faq)
      ? raw.faq
          .map((f) => ({
            question: String(f.question ?? "").trim(),
            answer: String(f.answer ?? "").trim(),
          }))
          .filter((f) => f.question && f.answer)
      : [],
    schemaArticle:
      raw.schemaArticle && typeof raw.schemaArticle === "object" ? raw.schemaArticle : null,
    imageSuggestions: Array.isArray(raw.imageSuggestions)
      ? raw.imageSuggestions.map((i) => ({
          caption: String(i.caption ?? "").trim(),
          alt: String(i.alt ?? "").trim(),
        }))
      : [],
  };
}

/** Génère l'ensemble des champs SEO produit en un appel JSON structuré. */
export async function generateProductSEO(
  config: ResolvedAiConfig,
  context: ProductSEOContext
): Promise<{ data: ProductSEOResult; meta: AiGenerationMeta }> {
  assertAiConfigured(config);

  const lang = languagePrompt(config.settings.language);
  const tone = tonePrompt(config.settings.tone);

  const completion = await aiCompleteJson(config, {
    system: productSeoSystem(lang, tone),
    user: buildProductSeoUserPrompt(context, config.settings.descriptionLength),
    maxTokens: 4096,
    imageUrls: context.imageUrls,
  });

  const parsed = normalizeProductSeo(parseJsonFromLlm<ProductSEOResult>(completion.text));

  return {
    data: parsed,
    meta: {
      tokensInput: completion.tokensInput,
      tokensOutput: completion.tokensOutput,
      model: completion.model,
      provider: config.settings.provider,
      visionUsed: completion.visionUsed ?? false,
    },
  };
}

/** Génère un article de blog structuré en JSON. */
export async function generateBlogArticle(
  config: ResolvedAiConfig,
  context: BlogArticleContext
): Promise<{ data: BlogArticleResult; meta: AiGenerationMeta }> {
  assertAiConfigured(config);

  const topic = (context.topic ?? context.title ?? "").trim();
  if (!topic) {
    throw new Error("Sujet ou titre requis");
  }

  const lang = languagePrompt(config.settings.language);
  const toneKey = context.tone ?? config.settings.tone;
  const toneLabel = AI_TONE_LABELS[toneKey] ?? tonePrompt(toneKey);
  const wordCount = context.wordCount ?? config.settings.blogWordCount;

  const completion = await aiCompleteJson(config, {
    system: blogSystem(lang, toneLabel),
    user: buildBlogJsonUserPrompt({
      topic,
      primaryKeyword: context.primaryKeyword,
      wordCount,
      toneLabel,
    }),
    maxTokens: Math.min(8192, wordCount * 4),
  });

  const parsed = normalizeBlogArticle(parseJsonFromLlm<BlogArticleResult>(completion.text));

  return {
    data: parsed,
    meta: {
      tokensInput: completion.tokensInput,
      tokensOutput: completion.tokensOutput,
      model: completion.model,
      provider: config.settings.provider,
    },
  };
}

/** Génération d'un seul champ (Anthropic SDK ou fallback multi-fournisseur). */
export async function generateSingleField(
  config: ResolvedAiConfig,
  action: AiGenerateAction,
  context: Record<string, unknown>
): Promise<{ text: string; meta: AiGenerationMeta }> {
  const prompt = buildGeneratePrompt({
    action,
    tone: config.settings.tone,
    language: config.settings.language,
    descriptionLength: config.settings.descriptionLength,
    context,
  });

  let result: AnthropicCompletionResult | { text: string; tokensInput: number; tokensOutput: number; model?: string };

  if (config.settings.provider === "anthropic") {
    const model = await anthropicModel(config);
    result = await anthropicComplete({
      apiKey: config.apiKey,
      model,
      system: prompt.system,
      user: prompt.user,
      maxTokens: prompt.maxTokens,
    });
  } else {
    const generic = await completeAi({
      provider: config.settings.provider,
      apiKey: config.apiKey,
      model: config.model,
      system: prompt.system,
      user: prompt.user,
      maxTokens: prompt.maxTokens,
    });
    result = { ...generic, model: config.model };
  }

  return {
    text: result.text,
    meta: {
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      model: result.model ?? config.model,
      provider: config.settings.provider,
    },
  };
}

/** Blog markdown legacy (non-JSON) — conservé pour compatibilité interne. */
export async function generateBlogMarkdown(
  config: ResolvedAiConfig,
  topic: string
): Promise<{ content: string; meta: AiGenerationMeta }> {
  const prompt = buildBlogPrompt({
    topic,
    tone: config.settings.tone,
    language: config.settings.language,
    wordCount: config.settings.blogWordCount,
    includeFaq: config.settings.blogIncludeFaq,
    includeSchema: config.settings.blogIncludeSchema,
    includeImages: config.settings.blogImageSuggestions,
  });

  if (config.settings.provider === "anthropic") {
    const model = await anthropicModel(config);
    const result = await anthropicComplete({
      apiKey: config.apiKey,
      model,
      system: prompt.system,
      user: prompt.user,
      maxTokens: prompt.maxTokens,
    });
    return {
      content: result.text,
      meta: {
        tokensInput: result.tokensInput,
        tokensOutput: result.tokensOutput,
        model: result.model,
        provider: "anthropic",
      },
    };
  }

  const result = await completeAi({
    provider: config.settings.provider,
    apiKey: config.apiKey,
    model: config.model,
    system: prompt.system,
    user: prompt.user,
    maxTokens: prompt.maxTokens,
  });

  return {
    content: result.text,
    meta: {
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      model: config.model,
      provider: config.settings.provider,
    },
  };
}
