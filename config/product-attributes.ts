/**
 * Schémas d'attributs produits extensibles par vertical.
 * Les variantes Supabase existantes restent compatibles ; ce fichier guide l'admin et les futurs champs JSON.
 */

import type { BrandingVertical } from "./branding";

export type ProductAttributeFieldType =
  | "select"
  | "multiselect"
  | "text"
  | "number"
  | "color"
  | "dimension";

export interface ProductAttributeField {
  key: string;
  label: string;
  type: ProductAttributeFieldType;
  required?: boolean;
  /** Options pour select / multiselect */
  options?: string[];
  unit?: string;
  group?: "variant" | "spec" | "custom";
}

export const verticalAttributePresets: Record<BrandingVertical, ProductAttributeField[]> = {
  beauty: [
    { key: "variant", label: "Variante", type: "select", group: "variant", required: true },
    { key: "volume", label: "Contenance", type: "text", group: "spec", unit: "ml" },
    { key: "shade", label: "Teinte", type: "color", group: "variant" },
  ],
  fashion: [
    { key: "size", label: "Taille", type: "select", group: "variant", required: true, options: ["XS", "S", "M", "L", "XL", "XXL"] },
    { key: "color", label: "Couleur", type: "color", group: "variant", required: true },
    { key: "material", label: "Matière", type: "text", group: "spec" },
  ],
  furniture: [
    { key: "dimensions", label: "Dimensions (L×l×H)", type: "dimension", group: "spec", required: true, unit: "cm" },
    { key: "material", label: "Matière", type: "select", group: "spec", options: ["Bois", "Métal", "Tissu", "Verre", "Mixte"] },
    { key: "color", label: "Couleur", type: "select", group: "variant" },
  ],
  restaurant: [
    { key: "size", label: "Format", type: "select", group: "variant", options: ["S", "M", "L", "XL"] },
    { key: "ingredients", label: "Ingrédients", type: "multiselect", group: "spec" },
    { key: "supplements", label: "Suppléments", type: "multiselect", group: "custom" },
  ],
  electronics: [
    { key: "model", label: "Modèle", type: "text", group: "variant", required: true },
    { key: "storage", label: "Stockage", type: "select", group: "variant", options: ["64 Go", "128 Go", "256 Go", "512 Go", "1 To"] },
    { key: "color", label: "Couleur", type: "select", group: "variant" },
    { key: "warranty", label: "Garantie", type: "text", group: "spec", unit: "mois" },
  ],
};

export function getAttributePresetForVertical(vertical: BrandingVertical): ProductAttributeField[] {
  return verticalAttributePresets[vertical] ?? verticalAttributePresets.beauty;
}
