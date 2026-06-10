/**
 * LN COS — Assistant SEO e-commerce (scoring, analyse, génération gratuite)
 */

import type { ProductExtraSection } from "@/lib/product-sections";
import { slugifyProductId } from "@/lib/product-catalog";

export interface ProductSeoFields {
  name: string;
  desc?: string;
  seoKeyword?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  seoSlug?: string | null;
  imageAlt?: string | null;
  mainImageUrl?: string | null;
  imageUrl?: string | null;
  galleryImages?: string[];
  benefits?: string[];
  usageTips?: string[];
  extraSections?: ProductExtraSection[];
  active?: boolean;
}

export type SeoLevel = "poor" | "medium" | "good" | "excellent";

export type LengthBarStatus = "short" | "ok" | "ideal";

export interface SeoCheck {
  id: string;
  label: string;
  ok: boolean;
  points: number;
  maxPoints: number;
}

export interface SeoScoreResult {
  score: number;
  level: SeoLevel;
  checks: SeoCheck[];
  breakdown: {
    title: number;
    meta: number;
    slug: number;
    alt: number;
    description: number;
    keyword: number;
    images: number;
  };
}

export interface GooglePreviewData {
  title: string;
  url: string;
  description: string;
}

const BRAND = "LN COS";
const REGION = "La Réunion";

const TITLE_IDEAL_MIN = 30;
const TITLE_IDEAL_MAX = 60;
const TITLE_DISPLAY_MAX = 60;
const TITLE_GEN_MIN = 40;
const TITLE_GEN_MAX = 60;
const META_IDEAL_MIN = 120;
const META_IDEAL_MAX = 160;
const META_DISPLAY_MAX = 160;
const META_GEN_MIN = 140;
const META_GEN_MAX = 160;
const DESC_WORD_MIN = 300;
const DESC_WORD_TARGET_MIN = 350;
const DESC_WORD_TARGET_MAX = 500;
const SEO_FAQ_SECTION_ID_PREFIX = "seo-faq-";

export function slugifySeo(text: string): string {
  return slugifyProductId(text);
}

export function generateSeoSlugFromName(name: string): string {
  return slugifySeo(name);
}

export function generateSeoImageFilename(keyword: string, ext = "webp"): string {
  const base = slugifySeo(keyword || "produit");
  return `${base}-ln-cos.${ext}`;
}

function extractMainKeyword(name: string): string {
  return name.trim().toLowerCase();
}

function capitalizeKeyword(keyword: string): string {
  if (!keyword) return keyword;
  return keyword.charAt(0).toUpperCase() + keyword.slice(1);
}

function titleCaseKeyword(keyword: string): string {
  return keyword
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function fitCharLength(text: string, min: number, max: number): string {
  let result = text.trim();
  if (result.length > max) {
    const cut = result.slice(0, max - 1).trimEnd();
    const lastSpace = cut.lastIndexOf(" ");
    result = (lastSpace > min ? cut.slice(0, lastSpace) : cut).trimEnd();
    if (result.length < min && text.length >= min) {
      result = text.slice(0, max).trimEnd();
    }
  }
  const fillers = [
    ` — ${BRAND}`,
    ` | ${BRAND}`,
    ` · ${REGION}`,
    ` · Livraison rapide`,
    ` · Qualité premium`,
    ` · Résultats visibles`,
  ];
  let fillerIdx = 0;
  while (result.length < min && fillerIdx < fillers.length) {
    const next = `${result}${fillers[fillerIdx]}`;
    if (next.length <= max) result = next;
    fillerIdx += 1;
  }
  if (result.length < min) {
    result = result.padEnd(min, ".").slice(0, max);
  }
  return result.slice(0, max);
}

function truncateToWordCount(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ");
}

function keywordInFirstParagraph(desc: string, keyword: string): boolean {
  const first = desc.split(/\n\n+/)[0]?.trim() ?? "";
  return containsKeyword(first, keyword);
}

function keywordInH2(desc: string, keyword: string): boolean {
  const headings = desc.match(/^#{2}\s+.+$/gm) ?? [];
  return headings.some((h) => containsKeyword(h, keyword));
}

function resolvePrimaryKeyword(fields: ProductSeoFields): string {
  const fromField = fields.seoKeyword?.trim();
  if (fromField && fromField.length >= 3) return fromField.toLowerCase();
  return extractMainKeyword(fields.name);
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function containsKeyword(haystack: string | null | undefined, keyword: string | null | undefined): boolean {
  if (!haystack || !keyword) return false;
  const k = normalize(keyword.trim());
  if (!k) return false;
  const words = k.split(/\s+/).filter(Boolean);
  const hay = normalize(haystack);
  return words.every((w) => hay.includes(w));
}

export function countWords(text: string | null | undefined): number {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getLengthBarStatus(
  length: number,
  idealMin: number,
  idealMax: number
): LengthBarStatus {
  if (length >= idealMin && length <= idealMax) return "ideal";
  if (length === 0 || length < idealMin * 0.6 || length > idealMax * 1.25) return "short";
  return "ok";
}

export function lengthBarColor(status: LengthBarStatus): string {
  switch (status) {
    case "ideal":
      return "#2F9E68";
    case "ok":
      return "#C77A33";
    default:
      return "#C2557A";
  }
}

export function hasProductImage(fields: ProductSeoFields): boolean {
  return Boolean(
    fields.mainImageUrl?.trim() ||
    fields.imageUrl?.trim() ||
    (fields.galleryImages?.length ?? 0) > 0
  );
}

export function hasGalleryImage(fields: ProductSeoFields): boolean {
  return (fields.galleryImages?.length ?? 0) > 0;
}

function hasSubheadings(fields: ProductSeoFields): boolean {
  const extras = fields.extraSections?.filter((s) => s.enabled && s.title.trim()) ?? [];
  if (extras.length > 0) return true;
  if ((fields.usageTips?.length ?? 0) > 0) return true;
  if ((fields.benefits?.length ?? 0) > 0) return true;
  const desc = fields.desc ?? "";
  return /^#{2,3}\s/m.test(desc) || /^[A-ZÀ-Ÿ][^\n]{2,40}$/m.test(desc);
}

function hasBulletLists(fields: ProductSeoFields): boolean {
  if ((fields.benefits?.length ?? 0) > 0) return true;
  if ((fields.usageTips?.length ?? 0) > 0) return true;
  return (fields.extraSections ?? []).some(
    (s) => s.enabled && (s.type === "list" || s.type === "steps") && s.items.some((i) => i.trim())
  );
}

function isSlugOptimized(slug: string): boolean {
  const s = slug.trim();
  if (s.length < 3 || s.length > 80) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

function isSeoFilenameOptimized(filename: string, keyword: string): boolean {
  const f = filename.toLowerCase();
  if (!f.endsWith(".webp") && !f.endsWith(".jpg") && !f.endsWith(".png")) return false;
  if (!f.includes("-ln-cos")) return false;
  return containsKeyword(f.replace(/\.[a-z]+$/, "").replace(/-/g, " "), keyword);
}

function scoreFromParts(parts: { ideal: boolean; ok: boolean; max: number }): number {
  if (parts.ideal) return parts.max;
  if (parts.ok) return Math.round(parts.max * 0.55);
  return 0;
}

export function computeProductSeoScore(fields: ProductSeoFields): SeoScoreResult {
  const keyword = fields.seoKeyword?.trim() ?? "";
  const title = fields.seoTitle?.trim() ?? "";
  const meta = fields.metaDescription?.trim() ?? "";
  const slug = fields.seoSlug?.trim() ?? "";
  const alt = fields.imageAlt?.trim() ?? "";
  const desc = fields.desc?.trim() ?? "";
  const wordCount = countWords(desc);
  const imageFilename = generateSeoImageFilename(keyword || fields.name);
  const hasImage = hasProductImage(fields);
  const hasGallery = hasGalleryImage(fields);
  const indexable = fields.active !== false;

  const titleLen = title.length;
  const metaLen = meta.length;
  const titleIdeal = titleLen >= TITLE_IDEAL_MIN && titleLen <= TITLE_IDEAL_MAX;
  const titleOk = titleLen >= 20 && titleLen <= 70;
  const metaIdeal = metaLen >= META_IDEAL_MIN && metaLen <= META_IDEAL_MAX;
  const metaOk = metaLen >= 90 && metaLen <= 180;

  const kwInTitle = containsKeyword(title, keyword);
  const kwInMeta = containsKeyword(meta, keyword);
  const kwInSlug = containsKeyword(slug.replace(/-/g, " "), keyword);
  const kwInAlt = containsKeyword(alt, keyword);
  const kwInDesc = containsKeyword(desc, keyword);
  const kwSet = keyword.length >= 3;

  const titlePts = Math.min(
    15,
    scoreFromParts({ ideal: titleIdeal, ok: titleOk, max: 8 }) +
      (kwInTitle ? 7 : 0)
  );
  const metaPts = Math.min(
    15,
    scoreFromParts({ ideal: metaIdeal, ok: metaOk, max: 8 }) +
      (kwInMeta ? 7 : 0)
  );
  const slugPts = Math.min(10, (isSlugOptimized(slug) ? 5 : 0) + (kwInSlug ? 5 : 0));
  const altPts = Math.min(10, (alt.length > 0 ? 5 : 0) + (kwInAlt ? 5 : 0));

  let descPts = 0;
  if (wordCount >= 300) descPts += 8;
  else if (wordCount >= 150) descPts += 4;
  if (kwInDesc) descPts += 4;
  if (hasSubheadings(fields)) descPts += 4;
  if (hasBulletLists(fields)) descPts += 4;
  descPts = Math.min(20, descPts);

  let kwPts = 0;
  if (kwSet) kwPts += 3;
  const placements = [kwInTitle, kwInMeta, kwInSlug, kwInAlt, kwInDesc].filter(Boolean).length;
  kwPts += Math.min(12, placements * 2.4);
  kwPts = Math.min(15, Math.round(kwPts));

  let imgPts = 0;
  if (hasImage) imgPts += 10;
  if (hasGallery || hasImage) imgPts += 5;
  imgPts = Math.min(15, imgPts);

  const breakdown = {
    title: titlePts,
    meta: metaPts,
    slug: slugPts,
    alt: altPts,
    description: descPts,
    keyword: kwPts,
    images: imgPts,
  };

  const score = Math.min(
    100,
    breakdown.title +
      breakdown.meta +
      breakdown.slug +
      breakdown.alt +
      breakdown.description +
      breakdown.keyword +
      breakdown.images
  );

  const kwInFirstPara = keywordInFirstParagraph(desc, keyword);
  const kwInH2Heading = keywordInH2(desc, keyword);

  const checks: SeoCheck[] = [
    { id: "kw-title", label: "Mot-clé dans le titre SEO", ok: kwInTitle, points: kwInTitle ? 1 : 0, maxPoints: 1 },
    { id: "kw-meta", label: "Mot-clé dans la meta description", ok: kwInMeta, points: kwInMeta ? 1 : 0, maxPoints: 1 },
    { id: "kw-slug", label: "Mot-clé dans le slug", ok: kwInSlug, points: kwInSlug ? 1 : 0, maxPoints: 1 },
    { id: "kw-alt", label: "Mot-clé dans l'alt image", ok: kwInAlt, points: kwInAlt ? 1 : 0, maxPoints: 1 },
    { id: "kw-desc", label: "Mot-clé dans la description produit", ok: kwInDesc, points: kwInDesc ? 1 : 0, maxPoints: 1 },
    { id: "kw-first-para", label: "Mot-clé dans le premier paragraphe", ok: kwInFirstPara, points: kwInFirstPara ? 1 : 0, maxPoints: 1 },
    { id: "kw-h2", label: "Mot-clé dans au moins un H2", ok: kwInH2Heading, points: kwInH2Heading ? 1 : 0, maxPoints: 1 },
    { id: "desc-words", label: "Longueur description > 300 mots", ok: wordCount >= 300, points: wordCount >= 300 ? 1 : 0, maxPoints: 1 },
    { id: "subheadings", label: "Présence de sous-titres", ok: hasSubheadings(fields), points: hasSubheadings(fields) ? 1 : 0, maxPoints: 1 },
    { id: "bullets", label: "Présence de listes à puces", ok: hasBulletLists(fields), points: hasBulletLists(fields) ? 1 : 0, maxPoints: 1 },
    { id: "has-image", label: "Présence d'au moins une image", ok: hasImage, points: hasImage ? 1 : 0, maxPoints: 1 },
    { id: "title-len", label: "Titre SEO longueur idéale (30–60)", ok: titleIdeal, points: titleIdeal ? 1 : 0, maxPoints: 1 },
    { id: "meta-len", label: "Meta description longueur idéale (120–160)", ok: metaIdeal, points: metaIdeal ? 1 : 0, maxPoints: 1 },
    { id: "slug-opt", label: "Slug optimisé", ok: isSlugOptimized(slug), points: isSlugOptimized(slug) ? 1 : 0, maxPoints: 1 },
    { id: "indexable", label: "Produit indexable (publié)", ok: indexable, points: indexable ? 1 : 0, maxPoints: 1 },
    { id: "file-opt", label: "Nom de fichier image optimisé", ok: isSeoFilenameOptimized(imageFilename, keyword || fields.name), points: isSeoFilenameOptimized(imageFilename, keyword || fields.name) ? 1 : 0, maxPoints: 1 },
    { id: "file-kw", label: "Mot-clé présent dans le nom de fichier", ok: containsKeyword(imageFilename.replace(/\.[a-z]+$/, "").replace(/-/g, " "), keyword || fields.name), points: containsKeyword(imageFilename.replace(/\.[a-z]+$/, "").replace(/-/g, " "), keyword || fields.name) ? 1 : 0, maxPoints: 1 },
  ];

  const level: SeoLevel =
    score >= 95 ? "excellent" : score >= 80 ? "good" : score >= 50 ? "medium" : "poor";

  return { score, level, checks, breakdown };
}

export function seoLevelColor(level: SeoLevel): string {
  switch (level) {
    case "excellent":
      return "#1B7F4E";
    case "good":
      return "#2F9E68";
    case "medium":
      return "#C77A33";
    default:
      return "#C2557A";
  }
}

export function seoLevelLabel(level: SeoLevel): string {
  switch (level) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Bon";
    case "medium":
      return "Moyen";
    default:
      return "Faible";
  }
}

export type SeoOptimizeMode = "standard" | "maximal";

export interface ProductSeoOptimizationResult {
  seoKeyword: string;
  seoTitle: string;
  metaDescription: string;
  seoSlug: string;
  imageAlt: string;
  seoImageFilename: string;
  desc: string;
  benefits: string[];
  extraSections: ProductExtraSection[];
  predictedScore: number;
  predictedLevel: SeoLevel;
}

function generateSeoTitle(keyword: string, productName: string): string {
  const kwTitle = titleCaseKeyword(keyword);
  const candidates = [
    `${kwTitle} Premium | ${BRAND} — ${REGION}`,
    `${kwTitle} | ${BRAND} · Cosmétiques ${REGION}`,
    `Acheter ${kwTitle} | ${BRAND} — Livraison ${REGION}`,
    `${productName.trim()} | ${BRAND} · ${kwTitle}`,
    `${kwTitle} — Qualité ${BRAND} | ${REGION}`,
  ];
  const picked =
    candidates.find((c) => c.length >= TITLE_GEN_MIN && c.length <= TITLE_GEN_MAX) ??
    candidates[0];
  return fitCharLength(picked, TITLE_GEN_MIN, TITLE_GEN_MAX);
}

function generateMetaDescription(keyword: string): string {
  const kw = keyword.trim();
  const base = `Découvrez ${kw} chez ${BRAND} : formule premium, résultats visibles et routine beauté simplifiée. Livraison rapide à ${REGION}. Commandez en ligne.`;
  return fitCharLength(base, META_GEN_MIN, META_GEN_MAX);
}

function generateImageAlt(keyword: string): string {
  return fitCharLength(
    `${titleCaseKeyword(keyword)} ${BRAND} — photo produit officielle`,
    24,
    125
  );
}

function generateSeoSlug(keyword: string, productName: string): string {
  const fromKeyword = slugifySeo(keyword);
  const fromName = slugifySeo(productName);
  const slug = fromKeyword.length >= 3 ? fromKeyword : fromName;
  return slug.length <= 80 ? slug : slug.slice(0, 80).replace(/-$/, "");
}

function generateBenefits(keyword: string): string[] {
  const kw = titleCaseKeyword(keyword);
  return [
    `${kw} : formule soignée pour un résultat visible dès les premières utilisations`,
    `Texture agréable et fini élégant, pensé pour le quotidien à ${REGION}`,
    `Qualité premium ${BRAND}, adapté aux peaux sensibles et aux routines exigeantes`,
    `Format pratique et tenue optimisée pour accompagner votre rituel beauté`,
    `Sélectionné par l'équipe ${BRAND} pour sa efficacité et sa facilité d'usage`,
  ];
}

function generateFaqSection(keyword: string): ProductExtraSection {
  const kw = keyword.trim();
  const kwCap = titleCaseKeyword(kw);
  return {
    id: `${SEO_FAQ_SECTION_ID_PREFIX}${slugifySeo(kw) || "produit"}`,
    title: `FAQ — ${kwCap}`,
    type: "list",
    body: "",
    enabled: true,
    items: [
      `Qu'est-ce que ${kw} ? ${kwCap} est une solution beauté premium proposée par ${BRAND}, conçue pour offrir des résultats visibles tout en respectant votre peau.`,
      `Comment utiliser ${kw} ? Appliquez ${kw} sur une peau propre selon les indications du produit, en massant délicatement jusqu'à absorption complète.`,
      `Pourquoi choisir ${kw} chez ${BRAND} ? Vous bénéficiez d'une qualité contrôlée, d'une livraison rapide à ${REGION} et d'un accompagnement beauté personnalisé.`,
    ],
  };
}

function generateLongDescription(keyword: string, productName: string): string {
  const kw = keyword.trim();
  const kwCap = titleCaseKeyword(kw);
  const displayName = productName.trim() || kwCap;

  const intro = `${kwCap} par ${BRAND} répond aux attentes des clientes exigeantes à la recherche de ${kw} fiable, confortable et simple à intégrer dans une routine beauté moderne. Dès le premier paragraphe, ${kw} s'impose comme une référence pour sublimer votre look au quotidien, que vous découvriez ${displayName} ou que vous souhaitiez le réapprovisionner.`;

  const sections: Array<{ heading: string; body: string }> = [
    {
      heading: `Pourquoi choisir ${kwCap}`,
      body: `Le marché propose de nombreuses alternatives, mais ${kw} ${BRAND} se distingue par sa formulation étudiée, sa finition soignée et sa régularité d'usage. Chaque détail a été pensé pour vous faire gagner du temps tout en conservant un rendu élégant. Les clientes de ${REGION} apprécient particulièrement la constance du résultat et la sensation de confort, même en utilisation prolongée. En choisissant ${kw}, vous optez pour une expérience premium accessible, sans compromis sur la qualité.`,
    },
    {
      heading: `Les avantages de ${kw}`,
      body: `Avec ${kwCap}, vous profitez d'une tenue maîtrisée, d'une application intuitive et d'un rendu harmonieux. Le produit s'adapte aux routines matinales comme aux préparatifs du soir. Sa texture a été calibrée pour limiter les retouches et offrir une sensation légère sur la peau. ${BRAND} sélectionne des ingrédients et des finitions qui respectent les standards exigeants de la maison, pour que ${kw} devienne un indispensable de votre trousse beauté.`,
    },
    {
      heading: `Comment utiliser ${kwCap} au quotidien`,
      body: `Pour tirer le meilleur parti de ${kw}, commencez par préparer la zone d'application sur une peau propre et sèche. Appliquez une quantité adaptée, puis laissez le produit s'installer quelques instants avant de poursuivre votre maquillage ou votre soin. En cas d'usage répété, ${kwCap} conserve sa performance sans alourdir le résultat. Cette méthode simple convient aux débutantes comme aux habituées des produits ${BRAND}.`,
    },
    {
      heading: `${kwCap} et votre routine beauté`,
      body: `Intégrer ${kw} dans votre rituel permet de structurer vos gestes et d'obtenir un résultat plus cohérent jour après jour. Associé aux autres essentiels ${BRAND}, ${kwCap} complète une routine complète : préparation, mise en valeur et finition. Les clientes partagent souvent une meilleure confiance lorsqu'elles maîtrisent chaque étape. ${displayName} s'inscrit ainsi dans une logique de soin global, où qualité, confort et esthétique avancent ensemble.`,
    },
    {
      heading: `Commander ${kw} en ligne`,
      body: `Passer commande de ${kwCap} sur ${BRAND} est rapide et sécurisé. Nous préparons chaque colis avec soin et assurons une livraison vers ${REGION} dans les meilleurs délais. Vous pouvez suivre votre achat et contacter notre équipe en cas de question sur ${kw}, les modalités d'utilisation ou le choix des compléments. Faites confiance à ${BRAND} pour une expérience d'achat fluide et un service client attentif.`,
    },
  ];

  let text = `${intro}\n\n`;
  for (const section of sections) {
    text += `## ${section.heading}\n\n${section.body}\n\n`;
  }

  const enrichments = [
    `${kwCap} incarne l'ADN ${BRAND} : exigence, douceur et résultat visible. Les retours clientes confirment que ${kw} facilite la mise en beauté et renforce l'assurance au quotidien.`,
    `Que vous soyez à la recherche de ${kw} pour une occasion spéciale ou pour un usage régulier, ${displayName} offre un équilibre rare entre performance et confort.`,
    `Notre équipe teste et valide ${kwCap} avant chaque mise en ligne afin de garantir une expérience cohérente avec les standards ${BRAND}.`,
    `En résumé, ${kw} est le choix idéal si vous souhaitez allier praticité, élégance et fiabilité, avec un service de livraison adapté à ${REGION}.`,
  ];

  let enrichIdx = 0;
  while (countWords(text) < DESC_WORD_TARGET_MIN && enrichIdx < enrichments.length) {
    text += `${enrichments[enrichIdx]}\n\n`;
    enrichIdx += 1;
  }

  while (countWords(text) < DESC_WORD_MIN) {
    text += `${kwCap} ${BRAND} accompagne vos journées avec une formule pensée pour durer, simplifier vos gestes beauté et valoriser votre style naturel, où que vous soyez à ${REGION}.\n\n`;
  }

  if (countWords(text) > DESC_WORD_TARGET_MAX) {
    text = truncateToWordCount(text, DESC_WORD_TARGET_MAX);
  }

  return text.trim();
}

function mergeExtraSections(
  existing: ProductExtraSection[] | undefined,
  faq: ProductExtraSection,
  mode: SeoOptimizeMode
): ProductExtraSection[] {
  const list = [...(existing ?? [])];
  const faqIdx = list.findIndex((s) => s.id.startsWith(SEO_FAQ_SECTION_ID_PREFIX));

  if (mode === "maximal") {
    const withoutFaq = list.filter((s) => !s.id.startsWith(SEO_FAQ_SECTION_ID_PREFIX));
    return [...withoutFaq, faq];
  }

  if (faqIdx >= 0) {
    list[faqIdx] = { ...list[faqIdx], ...faq, enabled: true };
    return list;
  }
  return [...list, faq];
}

function shouldRegenerateDescription(fields: ProductSeoFields, keyword: string, mode: SeoOptimizeMode): boolean {
  if (mode === "maximal") return true;
  const desc = fields.desc?.trim() ?? "";
  const words = countWords(desc);
  if (words < DESC_WORD_MIN) return true;
  if (!keywordInFirstParagraph(desc, keyword)) return true;
  if (!keywordInH2(desc, keyword)) return true;
  if (!hasSubheadings(fields) && !/^#{2}\s/m.test(desc)) return true;
  return false;
}

function shouldRegenerateBenefits(fields: ProductSeoFields, mode: SeoOptimizeMode): boolean {
  if (mode === "maximal") return true;
  return (fields.benefits?.filter((b) => b.trim()).length ?? 0) < 3;
}

/**
 * Moteur d'optimisation SEO — vise 95–100/100 (texte + structure).
 * Sans image produit, le score plafonne à ~85 pts (bloc Images).
 */
export function optimizeProductSeo(
  fields: ProductSeoFields,
  mode: SeoOptimizeMode = "standard"
): ProductSeoOptimizationResult | null {
  const productName = fields.name?.trim();
  if (!productName) return null;

  const keyword = resolvePrimaryKeyword(fields);
  const seoTitle = generateSeoTitle(keyword, productName);
  const metaDescription = generateMetaDescription(keyword);
  const seoSlug = generateSeoSlug(keyword, productName);
  const imageAlt = generateImageAlt(keyword);
  const seoImageFilename = generateSeoImageFilename(keyword);

  const desc = shouldRegenerateDescription(fields, keyword, mode)
    ? generateLongDescription(keyword, productName)
    : (fields.desc?.trim() ?? generateLongDescription(keyword, productName));

  const benefits = shouldRegenerateBenefits(fields, mode)
    ? generateBenefits(keyword)
    : (fields.benefits?.filter((b) => b.trim()) ?? generateBenefits(keyword));

  const faq = generateFaqSection(keyword);
  const extraSections = mergeExtraSections(fields.extraSections, faq, mode);

  const optimized: ProductSeoFields = {
    ...fields,
    seoKeyword: keyword,
    seoTitle,
    metaDescription,
    seoSlug,
    imageAlt,
    desc,
    benefits,
    extraSections,
  };

  const scoreResult = computeProductSeoScore(optimized);

  return {
    seoKeyword: keyword,
    seoTitle,
    metaDescription,
    seoSlug,
    imageAlt,
    seoImageFilename,
    desc,
    benefits,
    extraSections,
    predictedScore: scoreResult.score,
    predictedLevel: scoreResult.level,
  };
}

/** Score prévisionnel après optimisation (sans modifier le formulaire). */
export function previewProductSeoOptimization(
  fields: ProductSeoFields,
  mode: SeoOptimizeMode = "standard"
): ProductSeoOptimizationResult | null {
  return optimizeProductSeo(fields, mode);
}

/** @deprecated Utiliser optimizeProductSeo */
export function generateSeoFieldsFromProduct(name: string): {
  seoKeyword: string;
  seoTitle: string;
  metaDescription: string;
  imageAlt: string;
  seoSlug: string;
  seoImageFilename: string;
} {
  const result = optimizeProductSeo({ name, desc: "" }, "maximal");
  if (!result) {
    const keyword = extractMainKeyword(name);
    return {
      seoKeyword: keyword,
      seoTitle: `${titleCaseKeyword(keyword)} | ${BRAND}`,
      metaDescription: generateMetaDescription(keyword),
      imageAlt: generateImageAlt(keyword),
      seoSlug: generateSeoSlug(keyword, name),
      seoImageFilename: generateSeoImageFilename(keyword),
    };
  }
  return {
    seoKeyword: result.seoKeyword,
    seoTitle: result.seoTitle,
    metaDescription: result.metaDescription,
    imageAlt: result.imageAlt,
    seoSlug: result.seoSlug,
    seoImageFilename: result.seoImageFilename,
  };
}

export function getProductSeoPath(product: Pick<ProductSeoFields, "seoSlug" | "name"> & { id?: string }): string {
  const slug = product.seoSlug?.trim() || product.id || slugifySeo(product.name);
  return `/produit/${encodeURIComponent(slug)}`;
}

export function getCategorySeoPath(category: { seoSlug?: string | null; id: string }): string {
  const slug = category.seoSlug?.trim() || category.id;
  return `/categorie/${encodeURIComponent(slug)}`;
}

export function getGooglePreview(fields: ProductSeoFields, siteUrl: string): GooglePreviewData {
  const title = fields.seoTitle?.trim() || `${fields.name} | ${BRAND}`;
  const path = getProductSeoPath(fields);
  const url = `${siteUrl.replace(/\/$/, "")}${path}`;
  const description =
    fields.metaDescription?.trim() ||
    `Découvrez ${fields.name} sur ${BRAND}. Cosmétiques premium livrés à ${REGION}.`;

  return { title, url, description };
}

export function isProductSeoOptimized(fields: ProductSeoFields): boolean {
  return computeProductSeoScore(fields).score >= 95;
}

export interface SeoDashboardStats {
  total: number;
  optimized: number;
  withoutDescription: number;
  withoutImageAlt: number;
  withoutMetaDescription: number;
  withoutImage: number;
  averageScore: number;
  needsWork: Array<ProductSeoFields & { id: string; score: number; level: SeoLevel }>;
}

export function computeSeoDashboardStats(
  products: Array<ProductSeoFields & { id: string }>
): SeoDashboardStats {
  let optimized = 0;
  let withoutDescription = 0;
  let withoutImageAlt = 0;
  let withoutMetaDescription = 0;
  let withoutImage = 0;
  let scoreSum = 0;
  const needsWork: SeoDashboardStats["needsWork"] = [];

  for (const p of products) {
    const result = computeProductSeoScore(p);
    scoreSum += result.score;
    if (result.score >= 95) optimized += 1;
    if (!p.desc?.trim()) withoutDescription += 1;
    if (!p.imageAlt?.trim()) withoutImageAlt += 1;
    if (!p.metaDescription?.trim()) withoutMetaDescription += 1;
    if (!hasProductImage(p)) withoutImage += 1;
    if (result.score < 95) {
      needsWork.push({ ...p, score: result.score, level: result.level });
    }
  }

  needsWork.sort((a, b) => a.score - b.score);

  return {
    total: products.length,
    optimized,
    withoutDescription,
    withoutImageAlt,
    withoutMetaDescription,
    withoutImage,
    averageScore: products.length ? Math.round(scoreSum / products.length) : 0,
    needsWork,
  };
}
