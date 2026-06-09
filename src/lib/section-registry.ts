/**
 * LN COS — Section Registry
 *
 * Declares the canonical schema for each SectionType:
 *   • which fields are editable in the App Builder
 *   • field types and validation constraints
 *   • builder display metadata (label, icon, description)
 *
 * This file is pure data — no React imports.
 * See src/components/home/SectionRenderer.tsx for the render side.
 *
 * Future App Builder consumes SECTION_SCHEMA_REGISTRY to auto-generate
 * edit forms for each section type.
 */

import type { SectionType, HomeSection } from "@/lib/home-sections";

/* ─── Field schema ──────────────────────────────────────────────────── */

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "boolean"
  | "image"
  | "date"
  | "product_source";

export interface FieldSchema {
  key: keyof HomeSection;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];      // for "select" type
  placeholder?: string;
  helpText?: string;
}

/* ─── Section schema ────────────────────────────────────────────────── */

export interface SectionSchema {
  type: SectionType;
  /** Display name in App Builder sidebar */
  label: string;
  /** Builder icon name (matches Icon component) */
  icon: string;
  /** Short description shown in the builder section list */
  description: string;
  /** Editable fields shown in the builder properties panel */
  fields: FieldSchema[];
  /** Whether multiple instances of this type are allowed */
  allowMultiple: boolean;
  /** Sections that this section should not appear immediately after */
  notAfter?: SectionType[];
}

/* ─── Registry ──────────────────────────────────────────────────────── */

export const SECTION_SCHEMA_REGISTRY: Record<SectionType, SectionSchema> = {
  hero: {
    type: "hero",
    label: "Bannière héro",
    icon: "sparkle",
    description: "Grande bannière en haut de la page avec CTA principal.",
    allowMultiple: false,
    fields: [
      { key: "title",        label: "Titre",           type: "text",    required: true },
      { key: "titleAccent",  label: "Accent du titre", type: "text" },
      { key: "eyebrow",      label: "Eyebrow",         type: "text" },
      { key: "cta",          label: "Texte du bouton", type: "text" },
      { key: "img",          label: "Image de fond",   type: "image" },
    ],
  },
  trust: {
    type: "trust",
    label: "Bandeau confiance",
    icon: "check",
    description: "Strip de badges de confiance (paiement sécurisé, livraison, etc.).",
    allowMultiple: false,
    fields: [
      { key: "variant", label: "Variante", type: "select", options: ["pills", "bar"] },
    ],
  },
  products: {
    type: "products",
    label: "Carrousel produits",
    icon: "bag",
    description: "Carousel ou grille de produits filtrés par source.",
    allowMultiple: true,
    fields: [
      { key: "title",   label: "Titre de section",   type: "text",           required: true },
      { key: "source",  label: "Source produits",    type: "product_source", required: true,
        options: ["flash", "best", "reco", "new", "all"],
        helpText: "flash = ventes flash · best = best-sellers · reco = recommandés · new = nouveautés · all = catalogue complet" },
      { key: "variant", label: "Mise en page",       type: "select",  options: ["carousel", "grid"] },
    ],
  },
  routine: {
    type: "routine",
    label: "Rituel beauté",
    icon: "star",
    description: "Module routine avec étapes produits et bundle add-to-cart.",
    allowMultiple: false,
    fields: [
      { key: "title",    label: "Titre",   type: "text" },
      { key: "eyebrow",  label: "Eyebrow", type: "text" },
    ],
  },
  promo: {
    type: "promo",
    label: "Bloc éditorial promo",
    icon: "flame",
    description: "Grand bloc éditorial avec visuel, headline et CTA.",
    allowMultiple: true,
    fields: [
      { key: "eyebrow",   label: "Eyebrow",      type: "text" },
      { key: "title",     label: "Titre",         type: "text",     required: true },
      { key: "titleAccent", label: "Accent",      type: "text" },
      { key: "subtitle",  label: "Sous-titre",    type: "textarea" },
      { key: "cta",       label: "Texte CTA",     type: "text" },
      { key: "img",       label: "Image de fond", type: "image",
        helpText: "Visuel éditorial affiché en arrière-plan du bloc promo" },
    ],
  },
  bento: {
    type: "bento",
    label: "Univers LN COS (Bento)",
    icon: "heart",
    description: "Grille bento pour mettre en avant les univers de la marque.",
    allowMultiple: false,
    fields: [
      { key: "title",    label: "Titre",   type: "text" },
      { key: "subtitle", label: "Eyebrow", type: "text" },
    ],
  },
  quote: {
    type: "quote",
    label: "Citation immersive",
    icon: "info",
    description: "Bloc citation de marque avec ambiance dorée.",
    allowMultiple: false,
    fields: [
      { key: "title", label: "Citation", type: "textarea", required: true },
    ],
  },
  reviews: {
    type: "reviews",
    label: "Avis clients",
    icon: "star",
    description: "Section d'avis et témoignages clients.",
    allowMultiple: false,
    fields: [
      { key: "title", label: "Titre de section", type: "text" },
    ],
  },
  reels: {
    type: "reels",
    label: "Reels beauté",
    icon: "play",
    description: "Carousel de vidéos courtes / reels.",
    allowMultiple: false,
    fields: [
      { key: "title",   label: "Titre",           type: "text" },
      { key: "variant", label: "Disposition",     type: "select", options: ["vertical", "horizontal"] },
    ],
  },
  newsletter: {
    type: "newsletter",
    label: "Newsletter / Club",
    icon: "bell",
    description: "Bloc d'inscription newsletter et club VIP.",
    allowMultiple: false,
    fields: [
      { key: "eyebrow",  label: "Eyebrow",      type: "text" },
      { key: "title",    label: "Titre",         type: "text",     required: true },
      { key: "subtitle", label: "Sous-titre",    type: "textarea" },
      { key: "cta",      label: "Texte bouton",  type: "text" },
    ],
  },
  categories: {
    type: "categories",
    label: "Grille catégories",
    icon: "grid",
    description: "Grille ou liste des catégories produits.",
    allowMultiple: false,
    fields: [
      { key: "title",   label: "Titre",        type: "text" },
      { key: "variant", label: "Disposition",  type: "select", options: ["grid", "list"] },
    ],
  },
  cta: {
    type: "cta",
    label: "Bouton d'action",
    icon: "arrowR",
    description: "Bouton principal (ex. Prendre rendez-vous).",
    allowMultiple: true,
    fields: [
      { key: "title",    label: "Titre au-dessus", type: "text" },
      { key: "subtitle", label: "Sous-titre",      type: "text" },
      { key: "cta",      label: "Texte du bouton", type: "text", required: true },
    ],
  },
};

/* ─── Utility ───────────────────────────────────────────────────────── */

/** Validate a HomeSection patch against its schema required fields */
export function validateSection(
  type: SectionType,
  patch: Partial<HomeSection>
): { valid: boolean; missing: string[] } {
  const schema = SECTION_SCHEMA_REGISTRY[type];
  const missing = schema.fields
    .filter((f) => f.required && !patch[f.key])
    .map((f) => f.label);
  return { valid: missing.length === 0, missing };
}
