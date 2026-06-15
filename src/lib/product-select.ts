/**
 * LN COS — Sélecteurs produits Supabase (résilients aux migrations en retard)
 */

const PRODUCT_SELECT_BASE =
  "id,name,cat,price,old_price,ml,rating,reviews,tag,stock,variants,description,usage_tips,section_toggles,extra_sections,active,image_url,main_image_url,gallery_images,thumbnail_images,home_visibility,video_url,seo_keyword,seo_title,meta_description,seo_slug,image_alt,seo_secondary_keywords,seo_excerpt,created_at,product_variants(id,product_id,name,price,stock,sku,image_url,position)";

/** Schéma complet (benefits + champs SEO IA) */
export const PRODUCT_SELECT =
  `${PRODUCT_SELECT_BASE},benefits`;

/** Sans colonnes SEO IA (migration en retard) */
export const PRODUCT_SELECT_NO_AI =
  `${PRODUCT_SELECT_BASE.replace(",seo_secondary_keywords,seo_excerpt", "")},benefits`;

/** Schéma legacy — si la colonne benefits n'est pas encore migrée */
export const PRODUCT_SELECT_LEGACY = PRODUCT_SELECT_BASE.replace(",seo_secondary_keywords,seo_excerpt", "");

export function isMissingColumnError(message: string, column: string): boolean {
  const m = message.toLowerCase();
  const col = column.toLowerCase();
  return (
    m.includes(col) &&
    (m.includes("column") ||
      m.includes("does not exist") ||
      m.includes("schema cache"))
  );
}

/** Retire benefits d'un payload DB si la colonne n'est pas encore migrée */
export function omitBenefitsFromRow<T extends { benefits?: unknown }>(row: T): Omit<T, "benefits"> {
  const { benefits: _omit, ...rest } = row;
  return rest;
}
