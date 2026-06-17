/**
 * Service Claude — analyse et optimisation SEO produit.
 */

import {
  anthropicComplete,
  resolveAnthropicModelForGeneration,
} from "@/lib/ai-anthropic-client";
import { parseJsonFromLlm } from "@/lib/ai-json";
import { languagePrompt } from "@/lib/ai-settings";
import type { AiSettings } from "@/lib/ai-settings";
import type {
  ProductSeoAnalysisResult,
  ProductSeoOptimizationResult,
  ReadOnlyProductSeoContext,
} from "./context";
import {
  analyzeSeoSystemPrompt,
  analyzeSeoUserPrompt,
  optimizeSeoSystemPrompt,
  optimizeSeoUserPrompt,
} from "./prompts";
import { slugifySeo } from "@/lib/seo-core";

export interface SeoClaudeConfig {
  apiKey: string;
  model: string;
  settings: AiSettings;
}

export interface SeoClaudeMeta {
  tokensInput: number;
  tokensOutput: number;
  model: string;
  provider: "anthropic";
}

function clampScore(n: unknown): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function normalizeAnalysis(raw: ProductSeoAnalysisResult): ProductSeoAnalysisResult {
  return {
    score: clampScore(raw.score),
    strengths: Array.isArray(raw.strengths)
      ? raw.strengths.map((s) => String(s).trim()).filter(Boolean).slice(0, 12)
      : [],
    weaknesses: Array.isArray(raw.weaknesses)
      ? raw.weaknesses.map((s) => String(s).trim()).filter(Boolean).slice(0, 12)
      : [],
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.map((s) => String(s).trim()).filter(Boolean).slice(0, 12)
      : [],
  };
}

function normalizeOptimization(raw: ProductSeoOptimizationResult): ProductSeoOptimizationResult {
  const secondary = Array.isArray(raw.secondaryKeywords)
    ? raw.secondaryKeywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 10)
    : [];

  return {
    seoTitle: String(raw.seoTitle ?? "").trim(),
    metaDescription: String(raw.metaDescription ?? "").trim(),
    focusKeyword: String(raw.focusKeyword ?? "").trim(),
    secondaryKeywords: secondary,
    slug: slugifySeo(String(raw.slug ?? "")),
    imageAlt: String(raw.imageAlt ?? "").trim(),
    predictedScore: clampScore(raw.predictedScore),
  };
}

async function resolveModel(config: SeoClaudeConfig): Promise<string> {
  const model = config.model.trim();
  if (model) return resolveAnthropicModelForGeneration(config.apiKey, model);
  return resolveAnthropicModelForGeneration(config.apiKey, "");
}

export async function analyzeProductSeoWithClaude(
  config: SeoClaudeConfig,
  ctx: ReadOnlyProductSeoContext,
): Promise<{ data: ProductSeoAnalysisResult; meta: SeoClaudeMeta }> {
  if (!config.apiKey.trim()) {
    throw new Error("Configurez une clé API Anthropic dans Paramètres → IA");
  }

  const lang = languagePrompt(config.settings.language);
  const model = await resolveModel(config);

  const completion = await anthropicComplete({
    apiKey: config.apiKey,
    model,
    system: analyzeSeoSystemPrompt(lang),
    user: analyzeSeoUserPrompt(ctx),
    maxTokens: 2048,
  });

  const data = normalizeAnalysis(parseJsonFromLlm<ProductSeoAnalysisResult>(completion.text));

  return {
    data,
    meta: {
      tokensInput: completion.tokensInput,
      tokensOutput: completion.tokensOutput,
      model: completion.model,
      provider: "anthropic",
    },
  };
}

export async function optimizeProductSeoWithClaude(
  config: SeoClaudeConfig,
  ctx: ReadOnlyProductSeoContext,
): Promise<{ data: ProductSeoOptimizationResult; meta: SeoClaudeMeta }> {
  if (!config.apiKey.trim()) {
    throw new Error("Configurez une clé API Anthropic dans Paramètres → IA");
  }

  const lang = languagePrompt(config.settings.language);
  const model = await resolveModel(config);

  const completion = await anthropicComplete({
    apiKey: config.apiKey,
    model,
    system: optimizeSeoSystemPrompt(lang),
    user: optimizeSeoUserPrompt(ctx),
    maxTokens: 2048,
  });

  const data = normalizeOptimization(parseJsonFromLlm<ProductSeoOptimizationResult>(completion.text));

  return {
    data,
    meta: {
      tokensInput: completion.tokensInput,
      tokensOutput: completion.tokensOutput,
      model: completion.model,
      provider: "anthropic",
    },
  };
}
