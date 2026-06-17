/**
 * Prompts Claude — assistant SEO produit (lecture seule du contenu marketing).
 */

import { getAppName } from "@/lib/branding";
import type { ReadOnlyProductSeoContext } from "./context";
import { formatContextForPrompt } from "./context";

const BRAND = () => getAppName();

export function analyzeSeoSystemPrompt(language: string): string {
  return `Tu es un expert SEO e-commerce pour ${BRAND()}.
Langue de réponse: ${language}.

RÈGLES ABSOLUES:
- Le contenu produit (nom, descriptions, caractéristiques, conseils) est READ ONLY.
- Tu ne dois JAMAIS proposer de réécrire ou remplacer les textes marketing.
- Tu analyses uniquement et tu recommandes des améliorations SEO exploitables par le marchand.
- Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après.`;
}

export function analyzeSeoUserPrompt(ctx: ReadOnlyProductSeoContext): string {
  return `${formatContextForPrompt(ctx)}

Analyse le référencement de cette fiche produit.

Critères de score (sur 100): mot-clé principal, titre SEO, meta description, longueur et structure du contenu, richesse sémantique, alt image, lisibilité, maillage interne suggéré, densité mot-clé raisonnable.

Retourne ce JSON exact:
{
  "score": 78,
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1", "point faible 2"],
  "recommendations": ["recommandation actionnable 1", "recommandation 2"]
}

recommendations: 4 à 8 conseils concrets que le marchand peut appliquer manuellement sur son contenu ou ses métadonnées. Ne propose pas de texte de remplacement pour les descriptions.`;
}

export function optimizeSeoSystemPrompt(language: string): string {
  return `Tu es un expert SEO e-commerce pour ${BRAND()}.
Langue: ${language}.

RÈGLES ABSOLUES:
- Le contenu marketing (nom, descriptions longues/courtes, bénéfices, caractéristiques, conseils) est INTERDIT à modifier.
- Tu génères UNIQUEMENT les métadonnées SEO listées ci-dessous.
- Base-toi sur le contenu existant comme source de vérité.
- Réponds UNIQUEMENT avec un objet JSON valide, sans markdown.`;
}

export function optimizeSeoUserPrompt(ctx: ReadOnlyProductSeoContext): string {
  return `${formatContextForPrompt(ctx)}

Génère des métadonnées SEO optimisées à partir du contenu existant.

Retourne ce JSON exact:
{
  "seoTitle": "titre SEO 50-60 caractères incluant le mot-clé principal",
  "metaDescription": "méta description 140-160 caractères",
  "focusKeyword": "mot-clé principal",
  "secondaryKeywords": ["mot2", "mot3", "mot4", "mot5"],
  "slug": "slug-url-minuscules-sans-accents",
  "imageAlt": "texte alt image descriptif et accessible",
  "predictedScore": 85
}

predictedScore: estimation du score SEO sur 100 après application de ces métadonnées (entier 0-100).
Ne modifie pas le nom produit ni les descriptions — métadonnées SEO uniquement.
Slug sans accents ni caractères spéciaux.`;
}
