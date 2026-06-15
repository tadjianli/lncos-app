/**
 * LN COS — Générateur SEO produit V2 (contenu unique par fiche)
 */

import type { ProductExtraSection } from "@/lib/product-sections";
import type { DeliveryZoneSettings } from "@/lib/delivery-zones";
import { DEFAULT_DELIVERY_ZONES, getSeoDeliveryPhrase } from "@/lib/delivery-zones";
import type { ProductSeoFields, SeoOptimizeMode } from "@/lib/seo-core";
import {
  countWords,
  generateSeoImageFilename,
  slugifySeo,
  TITLE_GEN_MAX,
  TITLE_GEN_MIN,
  META_GEN_MAX,
  META_GEN_MIN,
  DESC_WORD_MIN,
  DESC_WORD_TARGET_MIN,
  DESC_WORD_TARGET_MAX,
  SEO_FAQ_SECTION_ID_PREFIX,
} from "@/lib/seo-core";

const BRAND = "LN COS";

const CATEGORY_SEO: Record<string, { label: string; angle: string; benefitPool: string[] }> = {
  maquillage: {
    label: "maquillage",
    angle: "pigments et fini maquillage",
    benefitPool: [
      "pigments intenses pour un regard ou un teint sublimé",
      "texture fondante facile à estomper",
      "tenue maquillage optimisée toute la journée",
      "fini lumineux sans effet masque",
    ],
  },
  skincare: {
    label: "soin visage",
    angle: "soin et confort cutané",
    benefitPool: [
      "hydratation ciblée pour un teint éclatant",
      "texture légère qui pénètre rapidement",
      "barrière cutanée respectée au quotidien",
      "geste soin simple à intégrer le matin et le soir",
    ],
  },
  corps: {
    label: "soin corps",
    angle: "rituel corps sensoriel",
    benefitPool: [
      "parfum délicat et sensation de fraîcheur",
      "hydratation durable après la douche",
      "texture non grasse, confort immédiat",
      "format pratique pour un usage quotidien",
    ],
  },
  ongles: {
    label: "onglerie",
    angle: "manucure et finition ongles",
    benefitPool: [
      "application nette pour un rendu salon",
      "tenue renforcée sur l'ongle naturel",
      "séchage maîtrisé et brillance uniforme",
      "résultat soigné même à la maison",
    ],
  },
  parfum: {
    label: "parfum",
    angle: "sillage et signature olfactive",
    benefitPool: [
      "notes équilibrées qui évoluent en douceur",
      "sillage présent sans être entêtant",
      "flacon élégant pensé pour le quotidien",
      "signature olfactive distinctive LN COS",
    ],
  },
  cheveux: {
    label: "soin cheveux",
    angle: "cheveux brillants et disciplinés",
    benefitPool: [
      "cheveux plus souples au toucher",
      "brillance naturelle sans alourdir",
      "application rapide sur longueurs et pointes",
      "routine capillaire simplifiée",
    ],
  },
};

const FORBIDDEN_GENERIC_SNIPPETS = [
  "formule premium, résultats visibles et routine beauté simplifiée",
  "clientes exigeantes à la recherche de",
  "résultat visible dès les premières utilisations",
  "Texture agréable et fini élégant, pensé pour le quotidien à",
  "Qualité premium LN COS, adapté aux peaux sensibles",
  "Livraison rapide à La Réunion",
  "Cosmétiques La Réunion",
];

export interface ProductSeoGenerationInput {
  fields: ProductSeoFields;
  categoryId?: string;
  categoryName?: string;
  ml?: string;
  variants?: string[];
  tag?: string | null;
  productId?: string;
  deliveryZones?: DeliveryZoneSettings;
}

interface ProductAnalysis {
  seed: string;
  productName: string;
  keyword: string;
  keywordTitle: string;
  categoryId: string;
  categoryLabel: string;
  categoryAngle: string;
  formatSpec: string;
  variantSummary: string;
  tagLabel: string;
  traits: string[];
  primaryBenefit: string;
  secondaryBenefit: string;
  existingBenefits: string[];
  usageTips: string[];
  descSnippet: string;
  deliveryPhrase: string;
}

function simpleHash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickBySeed<T>(seed: string, salt: string, options: T[]): T {
  if (options.length === 0) throw new Error("pickBySeed: empty options");
  const idx = simpleHash(`${seed}:${salt}`) % options.length;
  return options[idx];
}

function titleCaseKeyword(keyword: string): string {
  return keyword
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function stripBrandFromName(name: string): string {
  return name
    .replace(/\bln\s*cos\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function deriveKeyword(name: string, categoryLabel: string, existing?: string | null): string {
  const fromField = existing?.trim().toLowerCase();
  if (fromField && fromField.length >= 3) return fromField;

  let base = stripBrandFromName(name)
    .replace(/\([^)]*\)/g, "")
    .replace(/\b\d+\s*(ml|g|gr|cl|l)\b/gi, "")
    .trim();

  if (base.length < 3) base = stripBrandFromName(name) || name.trim();
  if (base.length < 3 && categoryLabel) base = `${categoryLabel} ${name}`.trim();

  return base.toLowerCase();
}

function resolveCategoryMeta(categoryId?: string, categoryName?: string) {
  const id = (categoryId ?? categoryName ?? "soin").toLowerCase().trim();
  const direct = CATEGORY_SEO[id];
  if (direct) return { id, ...direct };

  const nameNorm = normalize(categoryName ?? id);
  for (const [key, meta] of Object.entries(CATEGORY_SEO)) {
    if (nameNorm.includes(key) || nameNorm.includes(normalize(meta.label))) {
      return { id: key, ...meta };
    }
  }

  return {
    id: "soin",
    label: categoryName?.trim() || "soin beauté",
    angle: "rituel beauté LN COS",
    benefitPool: [
      "qualité maison LN COS pour un usage quotidien",
      "texture soignée et résultat harmonieux",
      "formule pensée pour simplifier votre routine",
      "finition élégante adaptée à toutes les occasions",
    ],
  };
}

function firstSentence(text: string, maxLen = 160): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  const sentence = (match?.[0] ?? trimmed).trim();
  return sentence.length > maxLen ? `${sentence.slice(0, maxLen - 1).trimEnd()}…` : sentence;
}

function extractTraits(input: ProductSeoGenerationInput, categoryMeta: ReturnType<typeof resolveCategoryMeta>): string[] {
  const traits: string[] = [];
  const ml = input.ml?.trim();
  if (ml) traits.push(`Format ${ml}`);
  const variants = input.variants?.filter((v) => v.trim()) ?? [];
  if (variants.length === 1) traits.push(`Variante ${variants[0]}`);
  if (variants.length > 1) traits.push(`${variants.length} déclinaisons disponibles`);
  if (input.tag?.trim()) traits.push(`Offre ${input.tag.trim()}`);
  if (input.fields.desc?.trim()) {
    const snippet = firstSentence(input.fields.desc, 90);
    if (snippet.length > 20) traits.push(snippet.replace(/\.$/, ""));
  }
  for (const b of categoryMeta.benefitPool.slice(0, 2)) {
    traits.push(b.charAt(0).toUpperCase() + b.slice(1));
  }
  return [...new Set(traits)].slice(0, 6);
}

function analyzeProduct(input: ProductSeoGenerationInput): ProductAnalysis {
  const fields = input.fields;
  const productName = fields.name.trim();
  const categoryMeta = resolveCategoryMeta(input.categoryId, input.categoryName);
  const deliveryZones = input.deliveryZones ?? DEFAULT_DELIVERY_ZONES;
  const deliveryPhrase = getSeoDeliveryPhrase(deliveryZones);
  const keyword = deriveKeyword(productName, categoryMeta.label, fields.seoKeyword);
  const keywordTitle = titleCaseKeyword(keyword);
  const formatSpec = input.ml?.trim() || "";
  const variants = input.variants?.filter((v) => v.trim()) ?? [];
  const variantSummary = variants.length > 0 ? variants.slice(0, 3).join(", ") : "";
  const existingBenefits = fields.benefits?.map((b) => b.trim()).filter(Boolean) ?? [];
  const usageTips = fields.usageTips?.map((t) => t.trim()).filter(Boolean) ?? [];
  const traits = extractTraits(input, categoryMeta);

  const primaryBenefit =
    existingBenefits[0] ??
    pickBySeed(productName, "benefit-a", categoryMeta.benefitPool);
  const secondaryBenefit =
    existingBenefits[1] ??
    pickBySeed(productName, "benefit-b", categoryMeta.benefitPool.filter((b) => b !== primaryBenefit));

  const descSnippet = fields.desc?.trim()
    ? firstSentence(fields.desc, 200)
    : `${keywordTitle} ${BRAND} réunit ${categoryMeta.angle}${formatSpec ? ` (${formatSpec})` : ""}.`;

  return {
    seed: input.productId?.trim() || slugifySeo(productName) || keyword,
    productName,
    keyword,
    keywordTitle,
    categoryId: categoryMeta.id,
    categoryLabel: categoryMeta.label,
    categoryAngle: categoryMeta.angle,
    formatSpec,
    variantSummary,
    tagLabel: input.tag?.trim() ?? "",
    traits,
    primaryBenefit,
    secondaryBenefit,
    existingBenefits,
    usageTips,
    descSnippet,
    deliveryPhrase,
  };
}

function fitCharLength(text: string, min: number, max: number, fillers: string[] = []): string {
  let result = text.trim();
  if (result.length > max) {
    const cut = result.slice(0, max - 1).trimEnd();
    const lastSpace = cut.lastIndexOf(" ");
    result = (lastSpace > min ? cut.slice(0, lastSpace) : cut).trimEnd();
  }
  let fillerIdx = 0;
  while (result.length < min && fillerIdx < fillers.length) {
    const next = `${result}${fillers[fillerIdx]}`;
    if (next.length <= max) result = next;
    fillerIdx += 1;
  }
  return result.slice(0, max);
}

export function generateUniqueSeoTitle(analysis: ProductAnalysis): string {
  const { productName, keywordTitle, categoryLabel, formatSpec, seed, deliveryPhrase } = analysis;
  const formatPart = formatSpec ? ` — ${formatSpec}` : "";

  const templates = [
    `${productName}${formatPart} | ${BRAND}`,
    `${keywordTitle} ${categoryLabel} | ${BRAND}`,
    `${keywordTitle}${formatPart} · ${BRAND}`,
    `${productName} — ${categoryLabel} ${BRAND}`,
    `${keywordTitle} en ligne | ${BRAND}`,
  ];

  const picked = pickBySeed(seed, "title", templates);
  return fitCharLength(picked, TITLE_GEN_MIN, TITLE_GEN_MAX, [
    ` · ${BRAND}`,
    ` | ${BRAND}`,
    deliveryPhrase.length <= 22 ? ` · ${deliveryPhrase}` : "",
  ].filter(Boolean));
}

export function generateUniqueMetaDescription(analysis: ProductAnalysis): string {
  const {
    productName,
    keywordTitle,
    primaryBenefit,
    formatSpec,
    variantSummary,
    deliveryPhrase,
    seed,
    categoryLabel,
  } = analysis;

  const formatBit = formatSpec ? ` (${formatSpec})` : "";
  const variantBit = variantSummary ? ` — ${variantSummary}` : "";

  const templates = [
    `${productName}${formatBit} : ${primaryBenefit}. ${deliveryPhrase}. Commandez chez ${BRAND}.`,
    `${keywordTitle}, ${categoryLabel} ${BRAND}${formatBit}. ${primaryBenefit.charAt(0).toUpperCase()}${primaryBenefit.slice(1)}. ${deliveryPhrase}.`,
    `Découvrez ${keywordTitle.toLowerCase()}${formatBit}${variantBit}. ${primaryBenefit}. ${deliveryPhrase} avec ${BRAND}.`,
    `${productName} chez ${BRAND} : ${primaryBenefit}. ${formatSpec ? `Format ${formatSpec}. ` : ""}${deliveryPhrase}.`,
    `Achetez ${keywordTitle.toLowerCase()} — ${primaryBenefit}. ${BRAND}, ${categoryLabel}.${formatBit ? ` ${formatSpec}.` : ""} ${deliveryPhrase}.`,
  ];

  const picked = pickBySeed(seed, "meta", templates);
  return fitCharLength(picked, META_GEN_MIN, META_GEN_MAX);
}

export function generateUniqueImageAlt(analysis: ProductAnalysis): string {
  const { productName, keywordTitle, formatSpec, categoryLabel, seed } = analysis;
  const templates = [
    `${productName}${formatSpec ? `, ${formatSpec}` : ""} — ${categoryLabel} ${BRAND}`,
    `${keywordTitle}${formatSpec ? ` ${formatSpec}` : ""}, photo officielle ${BRAND}`,
    `Image ${productName} — ${categoryLabel} premium ${BRAND}`,
    `${keywordTitle} ${BRAND}${formatSpec ? ` (${formatSpec})` : ""} — vue produit`,
  ];
  const picked = pickBySeed(seed, "alt", templates);
  return fitCharLength(picked, 24, 125);
}

function generateUniqueBenefits(analysis: ProductAnalysis): string[] {
  if (analysis.existingBenefits.length >= 3) {
    return analysis.existingBenefits.slice(0, 5);
  }

  const { keywordTitle, formatSpec, variantSummary, categoryLabel, seed, traits } = analysis;
  const pool = [
    `${keywordTitle} : ${analysis.primaryBenefit}`,
    formatSpec ? `Format ${formatSpec} adapté à un usage ${categoryLabel} régulier` : `${categoryLabel.charAt(0).toUpperCase()}${categoryLabel.slice(1)} : ${analysis.secondaryBenefit}`,
    variantSummary ? `Choix de déclinaisons : ${variantSummary}` : analysis.secondaryBenefit.charAt(0).toUpperCase() + analysis.secondaryBenefit.slice(1),
    traits[0] ? traits[0].endsWith(".") ? traits[0] : `${traits[0]}.` : `Sélection ${BRAND} pour un rendu soigné au quotidien`,
    `Idéal pour compléter votre routine ${categoryLabel} avec ${BRAND}`,
  ];

  const start = simpleHash(`${seed}:benefits`) % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  return [...new Set(rotated.map((b) => b.trim()).filter(Boolean))].slice(0, 5);
}

function generateUniqueFaqSection(analysis: ProductAnalysis): ProductExtraSection {
  const { keyword, keywordTitle, productName, formatSpec, categoryLabel, deliveryPhrase, seed } = analysis;
  const slug = slugifySeo(keyword) || "produit";

  const faqSets = [
    [
      `À quoi sert ${keywordTitle} ? ${productName} est conçu pour la catégorie ${categoryLabel} : ${analysis.primaryBenefit}.`,
      `Comment utiliser ${productName} ? Suivez les gestes indiqués sur la fiche${formatSpec ? ` (${formatSpec})` : ""} pour un résultat optimal.`,
      `${deliveryPhrase} — commandez ${keywordTitle.toLowerCase()} directement sur ${BRAND}.`,
    ],
    [
      `${keywordTitle} convient-il aux débutantes ? Oui, ${productName} a été pensé pour une prise en main simple.`,
      `Quelle quantité prévoir ? ${formatSpec ? `Le format ${formatSpec} ` : "Le format "}convient à un usage régulier en ${categoryLabel}.`,
      `Pourquoi ${BRAND} ? Qualité maison, fiche produit détaillée et ${deliveryPhrase.toLowerCase()}.`,
    ],
  ];

  const items = pickBySeed(seed, "faq", faqSets);

  return {
    id: `${SEO_FAQ_SECTION_ID_PREFIX}${slug}`,
    title: `Questions sur ${productName}`,
    type: "list",
    body: "",
    enabled: true,
    items,
  };
}

function truncateToWordCount(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ");
}

export function generateUniqueLongDescription(analysis: ProductAnalysis): string {
  const {
    productName,
    keyword,
    keywordTitle,
    categoryLabel,
    categoryAngle,
    formatSpec,
    variantSummary,
    primaryBenefit,
    secondaryBenefit,
    usageTips,
    existingBenefits,
    deliveryPhrase,
    seed,
    descSnippet,
  } = analysis;

  const introVariants = [
    `${descSnippet} ${productName} s'inscrit dans notre sélection ${categoryLabel} et met l'accent sur ${categoryAngle}. Dès ce premier paragraphe, le mot-clé ${keyword} structure une fiche dédiée, pensée pour répondre aux attentes réelles autour de ${keywordTitle.toLowerCase()}.`,
    `${productName} chez ${BRAND} : ${primaryBenefit}. ${descSnippet} Cette page détaille ${keywordTitle.toLowerCase()} avec des informations spécifiques à la catégorie ${categoryLabel}, sans contenu générique.`,
    `Vous recherchez ${keywordTitle.toLowerCase()} ? ${productName}${formatSpec ? ` (${formatSpec})` : ""} combine ${categoryAngle} et une approche ${BRAND} exigeante. ${descSnippet}`,
  ];

  let text = `${pickBySeed(seed, "intro", introVariants)}\n\n`;

  const sections: Array<{ heading: string; body: string }> = [
    {
      heading: `${productName} : points clés`,
      body: `${keywordTitle}${formatSpec ? ` se distingue par son format ${formatSpec}` : " se distingue par sa formulation"} et par ${primaryBenefit}. ${secondaryBenefit.charAt(0).toUpperCase()}${secondaryBenefit.slice(1)}. ${variantSummary ? `Déclinaisons proposées : ${variantSummary}.` : ""} Chaque élément de cette fiche ${categoryLabel} est calibré pour ${productName}, et non pour un modèle standard.`,
    },
    {
      heading: `Caractéristiques de ${keywordTitle}`,
      body: buildCharacteristicsParagraph(analysis),
    },
    {
      heading: `Bénéfices ${categoryLabel}`,
      body: buildBenefitsParagraph(analysis),
    },
    {
      heading: `Utilisation de ${productName}`,
      body: buildUsageParagraph(analysis),
    },
    {
      heading: `Commander ${keywordTitle} chez ${BRAND}`,
      body: `${deliveryPhrase} pour ${productName}. Passez commande en ligne en toute confiance : fiche transparente, avis clients et accompagnement ${BRAND}. ${formatSpec ? `Le format ${formatSpec} ` : "Ce produit "}s'intègre facilement à votre routine ${categoryLabel} actuelle.`,
    },
  ];

  for (const section of sections) {
    text += `## ${section.heading}\n\n${section.body}\n\n`;
  }

  if (existingBenefits.length === 0 && usageTips.length === 0) {
    text += `## Pourquoi ${keywordTitle} chez ${BRAND}\n\nNotre équipe valide ${productName} pour son rapport qualité-usage en ${categoryLabel}. ${primaryBenefit}. ${deliveryPhrase}.\n\n`;
  }

  let enrichIdx = 0;
  const enrichments = [
    `${productName} : une réponse concrète en ${categoryLabel}, avec ${keyword} au cœur de la promesse produit.`,
    `Les clientes ${BRAND} apprécient ${keywordTitle.toLowerCase()} pour ${secondaryBenefit}.`,
    `${formatSpec ? `Avec ${formatSpec}, ` : ""}${productName} reste cohérent avec l'univers ${categoryLabel} de la maison.`,
  ];

  while (countWords(text) < DESC_WORD_TARGET_MIN && enrichIdx < enrichments.length) {
    text += `${enrichments[enrichIdx]}\n\n`;
    enrichIdx += 1;
  }

  while (countWords(text) < DESC_WORD_MIN) {
    text += `${keywordTitle} ${BRAND} — ${primaryBenefit}. Fiche ${categoryLabel} dédiée à ${productName}${formatSpec ? ` (${formatSpec})` : ""}. ${deliveryPhrase}.\n\n`;
  }

  if (countWords(text) > DESC_WORD_TARGET_MAX) {
    text = truncateToWordCount(text, DESC_WORD_TARGET_MAX);
  }

  return text.trim();
}

function buildCharacteristicsParagraph(analysis: ProductAnalysis): string {
  const parts: string[] = [];
  if (analysis.formatSpec) parts.push(`Format : ${analysis.formatSpec}`);
  if (analysis.variantSummary) parts.push(`Déclinaisons : ${analysis.variantSummary}`);
  if (analysis.tagLabel) parts.push(`Badge boutique : ${analysis.tagLabel}`);
  for (const trait of analysis.traits.slice(0, 3)) {
    parts.push(trait.endsWith(".") ? trait : `${trait}.`);
  }
  if (parts.length === 0) {
    return `${analysis.productName} appartient à la catégorie ${analysis.categoryLabel} et répond à une utilisation ${analysis.categoryAngle}.`;
  }
  return `${analysis.productName} — ${parts.join(" ")}`;
}

function buildBenefitsParagraph(analysis: ProductAnalysis): string {
  const benefits =
    analysis.existingBenefits.length > 0
      ? analysis.existingBenefits
      : generateUniqueBenefits(analysis);

  if (benefits.length === 0) {
    return `${analysis.primaryBenefit}. ${analysis.secondaryBenefit.charAt(0).toUpperCase()}${analysis.secondaryBenefit.slice(1)}.`;
  }

  return benefits.map((b, i) => `${i + 1}. ${b.endsWith(".") ? b : `${b}.`}`).join(" ");
}

function buildUsageParagraph(analysis: ProductAnalysis): string {
  if (analysis.usageTips.length > 0) {
    return analysis.usageTips
      .map((tip, i) => `Étape ${i + 1} — ${tip.endsWith(".") ? tip : `${tip}.`}`)
      .join(" ");
  }

  const { keywordTitle, productName, categoryLabel, formatSpec } = analysis;
  return `Appliquez ${keywordTitle.toLowerCase()} sur une peau ou une base propre selon les besoins de ${categoryNamePhrase(categoryLabel)}. ${productName}${formatSpec ? ` (${formatSpec})` : ""} s'utilise en couche modérée ; laissez poser ou estompez selon le rendu souhaité. En cas de doute, référez-vous aux indications de la fiche ${categoryLabel}.`;
}

function categoryNamePhrase(categoryLabel: string): string {
  if (categoryLabel.includes("soin")) return "votre routine soin";
  if (categoryLabel.includes("maquillage")) return "votre maquillage";
  if (categoryLabel.includes("ongle")) return "votre manucure";
  return `votre rituel ${categoryLabel}`;
}

export function isGenericSeoDescription(text: string | null | undefined): boolean {
  if (!text?.trim()) return true;
  const norm = normalize(text);
  return FORBIDDEN_GENERIC_SNIPPETS.some((snippet) => norm.includes(normalize(snippet)));
}

function generateUniqueSeoSlug(keyword: string, productName: string, formatSpec: string): string {
  const parts = [slugifySeo(keyword), formatSpec ? slugifySeo(formatSpec) : ""].filter(Boolean);
  const combined = parts.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (combined.length >= 3) return combined.length <= 80 ? combined : combined.slice(0, 80).replace(/-$/, "");
  const fromName = slugifySeo(productName);
  return fromName.length <= 80 ? fromName : fromName.slice(0, 80).replace(/-$/, "");
}

function mergeExtraSections(
  existing: ProductExtraSection[] | undefined,
  faq: ProductExtraSection,
  mode: SeoOptimizeMode
): ProductExtraSection[] {
  const list = [...(existing ?? [])];
  const faqIdx = list.findIndex((s) => s.id.startsWith(SEO_FAQ_SECTION_ID_PREFIX));

  if (mode === "maximal") {
    return [...list.filter((s) => !s.id.startsWith(SEO_FAQ_SECTION_ID_PREFIX)), faq];
  }

  if (faqIdx >= 0) {
    list[faqIdx] = { ...list[faqIdx], ...faq, enabled: true };
    return list;
  }
  return [...list, faq];
}

function shouldRegenerateDescription(
  fields: ProductSeoFields,
  keyword: string,
  mode: SeoOptimizeMode
): boolean {
  if (mode === "maximal") return true;
  const desc = fields.desc?.trim() ?? "";
  if (isGenericSeoDescription(desc)) return true;
  const words = countWords(desc);
  if (words < DESC_WORD_MIN) return true;
  const first = desc.split(/\n\n+/)[0] ?? "";
  const kw = keyword.toLowerCase();
  if (kw && !normalize(first).includes(normalize(kw.split(/\s+/)[0] ?? kw))) return true;
  if (!/^#{2}\s/m.test(desc)) return true;
  return false;
}

function shouldRegenerateBenefits(fields: ProductSeoFields, mode: SeoOptimizeMode): boolean {
  if (mode === "maximal") return true;
  const benefits = fields.benefits?.filter((b) => b.trim()) ?? [];
  if (benefits.length < 3) return true;
  return benefits.some((b) => isGenericSeoDescription(b));
}

export interface ProductSeoGenerationResult {
  seoKeyword: string;
  seoTitle: string;
  metaDescription: string;
  seoSlug: string;
  imageAlt: string;
  seoImageFilename: string;
  desc: string;
  benefits: string[];
  extraSections: ProductExtraSection[];
}

export function generateProductSeoV2(
  input: ProductSeoGenerationInput,
  mode: SeoOptimizeMode = "standard"
): ProductSeoGenerationResult | null {
  const productName = input.fields.name?.trim();
  if (!productName) return null;

  const analysis = analyzeProduct(input);
  const seoKeyword = analysis.keyword;
  const seoTitle = generateUniqueSeoTitle(analysis);
  const metaDescription = generateUniqueMetaDescription(analysis);
  const seoSlug = generateUniqueSeoSlug(seoKeyword, productName, analysis.formatSpec);
  const imageAlt = generateUniqueImageAlt(analysis);
  const seoImageFilename = generateSeoImageFilename(seoKeyword);

  const desc = shouldRegenerateDescription(input.fields, seoKeyword, mode)
    ? generateUniqueLongDescription(analysis)
    : (input.fields.desc?.trim() ?? generateUniqueLongDescription(analysis));

  const benefits = shouldRegenerateBenefits(input.fields, mode)
    ? generateUniqueBenefits(analysis)
    : (input.fields.benefits?.filter((b) => b.trim()) ?? generateUniqueBenefits(analysis));

  const faq = generateUniqueFaqSection(analysis);
  const extraSections = mergeExtraSections(input.fields.extraSections, faq, mode);

  return {
    seoKeyword,
    seoTitle,
    metaDescription,
    seoSlug,
    imageAlt,
    seoImageFilename,
    desc,
    benefits,
    extraSections,
  };
}
