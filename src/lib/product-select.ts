/**
 * LN COS — Sélecteurs produits Supabase (résilients aux migrations en retard)
 */

const PRODUCT_SELECT_BASE =
  "id,name,cat,price,old_price,ml,rating,reviews,tag,stock,variants,description,ingredients,usage_tips,section_toggles,extra_sections,commitments,active,image_url,main_image_url,gallery_images,thumbnail_images,home_visibility,video_url,seo_keyword,seo_title,meta_description,seo_slug,image_alt,created_at,product_variants(id,product_id,name,price,stock,sku,image_url,position)";

/** Schéma complet (après migration benefits) */
export const PRODUCT_SELECT =
  `${PRODUCT_SELECT_BASE},benefits`;

/** Schéma legacy — si la colonne benefits n'est pas encore migrée */
export const PRODUCT_SELECT_LEGACY = PRODUCT_SELECT_BASE;

export function isMissingColumnError(message: string, column: string): boolean {
  const m = message.toLowerCase();
  return m.includes(column.toLowerCase()) && (m.includes("column") || m.includes("does not exist"));
}
