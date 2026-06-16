/**
 * LN COS — Estimation coût IA (client + serveur)
 */

import type { AiProvider } from "@/lib/ai-settings";

const RATES: Record<AiProvider, { in: number; out: number }> = {
  anthropic: { in: 0.000003, out: 0.000015 },
  openai: { in: 0.000002, out: 0.000008 },
  gemini: { in: 0.000001, out: 0.000004 },
  mistral: { in: 0.000002, out: 0.000006 },
};

export const PRODUCT_SEO_TOKEN_ESTIMATE = {
  tokensInput: 1_200,
  tokensOutput: 3_200,
} as const;

export const BLOG_ARTICLE_TOKEN_ESTIMATE = {
  tokensInput: 1_500,
  tokensOutput: 4_500,
} as const;

export function estimateAiCostEur(
  provider: AiProvider,
  tokensInput: number,
  tokensOutput: number
): number {
  const r = RATES[provider];
  return Number(((tokensInput * r.in + tokensOutput * r.out) * 0.92).toFixed(6));
}

export function estimateProductSeoCostEur(provider: AiProvider): number {
  return estimateAiCostEur(
    provider,
    PRODUCT_SEO_TOKEN_ESTIMATE.tokensInput,
    PRODUCT_SEO_TOKEN_ESTIMATE.tokensOutput
  );
}

export function estimateBlogArticleCostEur(provider: AiProvider): number {
  return estimateAiCostEur(
    provider,
    BLOG_ARTICLE_TOKEN_ESTIMATE.tokensInput,
    BLOG_ARTICLE_TOKEN_ESTIMATE.tokensOutput
  );
}

export function formatAiCostEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}
