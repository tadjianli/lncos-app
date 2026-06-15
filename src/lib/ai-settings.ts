/**
 * LN COS — Types et config Intelligence Artificielle (admin)
 */

export type AiProvider = "anthropic" | "openai" | "gemini" | "mistral";

export type AiLanguage = "fr" | "en" | "es" | "de";

export type AiTone =
  | "professional"
  | "luxe"
  | "beauty"
  | "cosmetic"
  | "marketing"
  | "ecommerce";

export type AiDescriptionLength = "short" | "medium" | "long";

export type AiGenerateAction =
  | "seo_title"
  | "short_description"
  | "long_description"
  | "meta_description"
  | "seo_slug"
  | "image_alt"
  | "keywords"
  | "rewrite"
  | "translate";

export interface AiProviderModel {
  id: string;
  label: string;
}

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  anthropic: "Anthropic Claude",
  openai: "OpenAI ChatGPT",
  gemini: "Google Gemini",
  mistral: "Mistral AI",
};

export const AI_PROVIDER_MODELS: Record<AiProvider, AiProviderModel[]> = {
  anthropic: [
    { id: "claude-opus-4-20250514", label: "Claude Opus" },
    { id: "claude-sonnet-4-20250514", label: "Claude Sonnet" },
  ],
  openai: [
    { id: "gpt-4.1", label: "GPT-5" },
    { id: "gpt-4.1-mini", label: "GPT-5 Mini" },
  ],
  gemini: [
    { id: "gemini-1.5-pro", label: "Gemini Pro" },
    { id: "gemini-2.0-flash", label: "Gemini Flash" },
  ],
  mistral: [
    { id: "mistral-large-latest", label: "Mistral Large" },
    { id: "mistral-small-latest", label: "Mistral Small" },
  ],
};

export const AI_TONE_LABELS: Record<AiTone, string> = {
  professional: "Professionnel",
  luxe: "Luxe",
  beauty: "Beauté",
  cosmetic: "Cosmétique",
  marketing: "Marketing",
  ecommerce: "E-commerce",
};

export const AI_LANGUAGE_LABELS: Record<AiLanguage, string> = {
  fr: "Français",
  en: "Anglais",
  es: "Espagnol",
  de: "Allemand",
};

export const AI_DESCRIPTION_LENGTH_LABELS: Record<AiDescriptionLength, string> = {
  short: "Courte",
  medium: "Moyenne",
  long: "Longue",
};

export interface AiSettings {
  provider: AiProvider;
  model: string;
  language: AiLanguage;
  tone: AiTone;
  descriptionLength: AiDescriptionLength;
  seoEnabled: boolean;
  seoAutoTitle: boolean;
  seoAutoMeta: boolean;
  seoAutoSlug: boolean;
  seoAutoAlt: boolean;
  seoAutoKeywords: boolean;
  blogEnabled: boolean;
  blogWordCount: 500 | 1000 | 1500 | 2000;
  blogIncludeFaq: boolean;
  blogIncludeSchema: boolean;
  blogImageSuggestions: boolean;
  lastTestOk: boolean;
  lastTestAt: string | null;
  /** Masqué côté client — ex. sk-••••abcd */
  apiKeyMasked: string | null;
  hasApiKey: boolean;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  language: "fr",
  tone: "luxe",
  descriptionLength: "medium",
  seoEnabled: false,
  seoAutoTitle: true,
  seoAutoMeta: true,
  seoAutoSlug: true,
  seoAutoAlt: true,
  seoAutoKeywords: true,
  blogEnabled: false,
  blogWordCount: 1000,
  blogIncludeFaq: true,
  blogIncludeSchema: true,
  blogImageSuggestions: true,
  lastTestOk: false,
  lastTestAt: null,
  apiKeyMasked: null,
  hasApiKey: false,
};

export interface AiSettingsInput extends Omit<AiSettings, "apiKeyMasked" | "hasApiKey" | "lastTestOk" | "lastTestAt"> {
  /** Nouvelle clé — envoyée uniquement si l'admin la saisit */
  apiKey?: string;
}

export interface DbAiSettings {
  id: string;
  provider: AiProvider;
  api_key_encrypted: string | null;
  model: string;
  language: AiLanguage;
  tone: AiTone;
  description_length: AiDescriptionLength;
  seo_enabled: boolean;
  seo_auto_title: boolean;
  seo_auto_meta: boolean;
  seo_auto_slug: boolean;
  seo_auto_alt: boolean;
  seo_auto_keywords: boolean;
  blog_enabled: boolean;
  blog_word_count: number;
  blog_include_faq: boolean;
  blog_include_schema: boolean;
  blog_image_suggestions: boolean;
  last_test_ok: boolean;
  last_test_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiUsageLogRow {
  id: string;
  user_email: string | null;
  action: string;
  provider: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_eur: number;
  created_at: string;
}

export interface AiUsageStats {
  todayEur: number;
  weekEur: number;
  monthEur: number;
  totalRequests: number;
}

export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 3)}••••${trimmed.slice(-4)}`;
}

export function dbToAiSettings(row: DbAiSettings | null, decryptedKey?: string | null): AiSettings {
  if (!row) return { ...DEFAULT_AI_SETTINGS };
  const hasKey = Boolean(row.api_key_encrypted);
  return {
    provider: row.provider,
    model: row.model,
    language: row.language,
    tone: row.tone,
    descriptionLength: row.description_length,
    seoEnabled: row.seo_enabled,
    seoAutoTitle: row.seo_auto_title,
    seoAutoMeta: row.seo_auto_meta,
    seoAutoSlug: row.seo_auto_slug,
    seoAutoAlt: row.seo_auto_alt,
    seoAutoKeywords: row.seo_auto_keywords,
    blogEnabled: row.blog_enabled,
    blogWordCount: row.blog_word_count as AiSettings["blogWordCount"],
    blogIncludeFaq: row.blog_include_faq,
    blogIncludeSchema: row.blog_include_schema,
    blogImageSuggestions: row.blog_image_suggestions,
    lastTestOk: row.last_test_ok,
    lastTestAt: row.last_test_at,
    hasApiKey: hasKey,
    apiKeyMasked: decryptedKey ? maskApiKey(decryptedKey) : hasKey ? "••••••••" : null,
  };
}

export function aiSettingsToDb(
  s: AiSettingsInput,
  apiKeyEncrypted?: string | null
): Partial<DbAiSettings> {
  return {
    provider: s.provider,
    model: s.model,
    language: s.language,
    tone: s.tone,
    description_length: s.descriptionLength,
    seo_enabled: s.seoEnabled,
    seo_auto_title: s.seoAutoTitle,
    seo_auto_meta: s.seoAutoMeta,
    seo_auto_slug: s.seoAutoSlug,
    seo_auto_alt: s.seoAutoAlt,
    seo_auto_keywords: s.seoAutoKeywords,
    blog_enabled: s.blogEnabled,
    blog_word_count: s.blogWordCount,
    blog_include_faq: s.blogIncludeFaq,
    blog_include_schema: s.blogIncludeSchema,
    blog_image_suggestions: s.blogImageSuggestions,
    ...(apiKeyEncrypted !== undefined ? { api_key_encrypted: apiKeyEncrypted } : {}),
  };
}

export function defaultModelForProvider(provider: AiProvider): string {
  return AI_PROVIDER_MODELS[provider][0]?.id ?? DEFAULT_AI_SETTINGS.model;
}

export function tonePrompt(tone: AiTone): string {
  return AI_TONE_LABELS[tone] ?? "Professionnel";
}

export function languagePrompt(lang: AiLanguage): string {
  const map: Record<AiLanguage, string> = {
    fr: "français",
    en: "anglais",
    es: "espagnol",
    de: "allemand",
  };
  return map[lang];
}

export function descriptionLengthHint(length: AiDescriptionLength): string {
  switch (length) {
    case "short":
      return "2 à 3 phrases maximum";
    case "long":
      return "3 à 5 paragraphes détaillés";
    default:
      return "1 à 2 paragraphes";
  }
}
