/**
 * LN COS — Sections éditoriales fiche produit
 */

export type ProductExtraSectionType = "text" | "steps" | "list";

export interface ProductSectionToggles {
  description: boolean;
  usageTips: boolean;
  ingredients: boolean;
  commitments: boolean;
}

export interface ProductCommitment {
  id: string;
  icon: string;
  label: string;
  enabled: boolean;
}

/** Icônes disponibles pour les engagements produit */
export const COMMITMENT_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "sparkle", label: "Éclat / Vegan" },
  { value: "check", label: "Certifié" },
  { value: "star", label: "Premium" },
  { value: "pin", label: "Made in France" },
  { value: "heart", label: "Cruelty-free" },
  { value: "crown", label: "Luxe" },
  { value: "flame", label: "Naturel / Bio" },
  { value: "calCheck", label: "Testé cliniquement" },
  { value: "gift", label: "Coffret cadeau" },
  { value: "bolt", label: "Haute efficacité" },
  { value: "lock", label: "Sûr / Sécurisé" },
  { value: "truck", label: "Livraison rapide" },
  { value: "tag", label: "Édition limitée" },
  { value: "info", label: "Information" },
  { value: "shop", label: "Exclusivité boutique" },
];

export const DEFAULT_COMMITMENTS: ProductCommitment[] = [
  { id: "c-vegan", icon: "sparkle", label: "Vegan", enabled: true },
  { id: "c-fr", icon: "pin", label: "Made in France", enabled: true },
  { id: "c-dermo", icon: "calCheck", label: "Dermatologiquement testé", enabled: true },
];

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
  ingredients: true,
  commitments: true,
};

export function normalizeSectionToggles(raw: unknown): ProductSectionToggles {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SECTION_TOGGLES };
  const o = raw as Record<string, unknown>;
  return {
    description: o.description !== false,
    usageTips: o.usageTips !== false,
    ingredients: o.ingredients !== false,
    commitments: o.commitments !== false,
  };
}

const COMMITMENT_ICON_SET = new Set(COMMITMENT_ICON_OPTIONS.map((o) => o.value));

export function normalizeCommitments(raw: unknown): ProductCommitment[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_COMMITMENTS.map((c) => ({ ...c }));
  return raw
    .filter((c) => c && typeof c === "object")
    .map((c, i) => {
      const row = c as Record<string, unknown>;
      const icon = typeof row.icon === "string" && COMMITMENT_ICON_SET.has(row.icon) ? row.icon : "check";
      return {
        id: typeof row.id === "string" ? row.id : `commitment-${i}`,
        icon,
        label: typeof row.label === "string" ? row.label : "",
        enabled: row.enabled !== false,
      };
    });
}

export function newCommitment(): ProductCommitment {
  return {
    id: `commitment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    icon: "sparkle",
    label: "",
    enabled: true,
  };
}

export function visibleCommitments(items: ProductCommitment[]): ProductCommitment[] {
  return items.filter((c) => c.enabled && c.label.trim());
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
