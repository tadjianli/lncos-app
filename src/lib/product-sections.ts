/**
 * LN COS — Sections éditoriales fiche produit
 */

export type ProductExtraSectionType = "text" | "steps" | "list";

export interface ProductSectionToggles {
  description: boolean;
  usageTips: boolean;
  benefits: boolean;
  /** Sélecteur contenance / teinte sur la fiche produit */
  variants: boolean;
  /** Ligne « Réf. … » sous les avis */
  reference: boolean;
}

export interface ProductExtraSection {
  id: string;
  title: string;
  type: ProductExtraSectionType;
  /** Texte libre (type text) */
  body: string;
  /** Lignes numérotées ou puces (steps / list) */
  items: string[];
  enabled: boolean;
}

export const DEFAULT_SECTION_TOGGLES: ProductSectionToggles = {
  description: true,
  usageTips: true,
  benefits: true,
  variants: true,
  reference: true,
};

/** Valeurs initiales à la création — l'admin active uniquement ce dont il a besoin. */
export const NEW_PRODUCT_SECTION_TOGGLES: ProductSectionToggles = {
  description: false,
  usageTips: false,
  benefits: false,
  variants: false,
  reference: false,
};

export function normalizeSectionToggles(raw: unknown): ProductSectionToggles {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SECTION_TOGGLES };
  const o = raw as Record<string, unknown>;
  return {
    description: o.description !== false,
    usageTips: o.usageTips !== false,
    benefits: o.benefits !== false,
    variants: o.variants !== false,
    reference: o.reference !== false,
  };
}

export function normalizeExtraSections(raw: unknown): ProductExtraSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s) => s && typeof s === "object")
    .map((s, i) => {
      const row = s as Record<string, unknown>;
      const type = (row.type === "steps" || row.type === "list" ? row.type : "text") as ProductExtraSectionType;
      return {
        id: typeof row.id === "string" ? row.id : `extra-${i}-${Date.now()}`,
        title: typeof row.title === "string" ? row.title : "Section",
        type,
        body: typeof row.body === "string" ? row.body : "",
        items: Array.isArray(row.items) ? row.items.filter((x): x is string => typeof x === "string") : [],
        enabled: row.enabled !== false,
      };
    });
}

export function newExtraSection(): ProductExtraSection {
  return {
    id: `extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    type: "text",
    body: "",
    items: [],
    enabled: true,
  };
}
