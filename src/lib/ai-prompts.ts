/**
 * LN COS — Prompts génération IA (serveur)
 */

import type { AiGenerateAction, AiLanguage, AiTone } from "./ai-settings";
import { descriptionLengthHint, languagePrompt, tonePrompt } from "./ai-settings";

const BRAND = "LN COS";

export function buildGeneratePrompt(opts: {
  action: AiGenerateAction;
  tone: AiTone;
  language: AiLanguage;
  descriptionLength: "short" | "medium" | "long";
  context: Record<string, unknown>;
}): { system: string; user: string; maxTokens: number } {
  const lang = languagePrompt(opts.language);
  const tone = tonePrompt(opts.tone);
  const system = `Tu es rédacteur e-commerce expert beauté et cosmétiques pour la marque ${BRAND}. Ton: ${tone}. Langue: ${lang}. Réponds uniquement avec le contenu demandé, sans guillemets superflus ni markdown sauf indication contraire.`;

  const name = String(opts.context.productName ?? opts.context.title ?? "Produit");
  const category = String(opts.context.category ?? "beauté");
  const keywords = String(opts.context.keywords ?? "");

  let user = "";
  let maxTokens = 512;

  switch (opts.action) {
    case "seo_title":
      user = `Génère un titre SEO (50-60 caractères) pour: ${name}. Catégorie: ${category}.`;
      maxTokens = 80;
      break;
    case "short_description":
      user = `Description courte produit (${descriptionLengthHint(opts.descriptionLength)}) pour: ${name}.`;
      maxTokens = 256;
      break;
    case "long_description":
      user = `Description longue produit (${descriptionLengthHint(opts.descriptionLength)}) pour: ${name}. Catégorie: ${category}. Inclure bénéfices et usage.`;
      maxTokens = 1200;
      break;
    case "meta_description":
      user = `Méta description SEO (150-160 caractères) pour: ${name}.`;
      maxTokens = 120;
      break;
    case "seo_slug":
      user = `Slug URL SEO (minuscules, tirets, sans accents) pour: ${name}.`;
      maxTokens = 64;
      break;
    case "image_alt":
      user = `Texte ALT image accessible et SEO pour le produit: ${name}.`;
      maxTokens = 120;
      break;
    case "keywords":
      user = `5 mots-clés SEO secondaires séparés par des virgules pour: ${name}. ${keywords ? `Mot-clé principal: ${keywords}` : ""}`;
      maxTokens = 120;
      break;
    case "rewrite":
      user = `Réécris ce contenu en ${lang}, ton ${tone}:\n\n${String(opts.context.text ?? "")}`;
      maxTokens = 1200;
      break;
    case "translate":
      user = `Traduis en ${lang}:\n\n${String(opts.context.text ?? "")}`;
      maxTokens = 1200;
      break;
    default:
      user = `Génère du contenu pour: ${name}`;
  }

  return { system, user, maxTokens };
}

export function buildBlogPrompt(opts: {
  topic: string;
  tone: AiTone;
  language: AiLanguage;
  wordCount: number;
  includeFaq: boolean;
  includeSchema: boolean;
  includeImages: boolean;
}): { system: string; user: string; maxTokens: number } {
  const lang = languagePrompt(opts.language);
  const tone = tonePrompt(opts.tone);
  const system = `Tu es rédacteur magazine beauté pour ${BRAND}. Langue: ${lang}. Ton: ${tone}.`;

  const extras: string[] = [];
  if (opts.includeFaq) extras.push("une section FAQ SEO (3-5 questions/réponses)");
  if (opts.includeSchema) extras.push("un bloc JSON-LD Article schema.org en fin de réponse, séparé par ---SCHEMA---");
  if (opts.includeImages) extras.push("3 suggestions de visuels avec légendes");

  const user = `Rédige un article blog d'environ ${opts.wordCount} mots sur: ${opts.topic}.
Structure: titre accrocheur, introduction, 3-4 sections H2, conclusion avec CTA doux.
${extras.length ? `Inclure: ${extras.join(", ")}.` : ""}
Format: markdown propre.`;

  return { system, user, maxTokens: Math.min(4096, opts.wordCount * 2) };
}
