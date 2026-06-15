import { getSupabase } from "./supabase";
import type { Product } from "./data";
import type { ProductVariant } from "./product-catalog";
import { normalizeExtraSections, normalizeSectionToggles } from "./product-sections";
import { normalizeHomeVisibility } from "./product-home-visibility";
import { deriveIsFlashSale } from "./flash-sales";
import { PRODUCT_SELECT, PRODUCT_SELECT_LEGACY, isMissingColumnError } from "./product-select";

type DbVariantRow = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  image_url: string | null;
  position: number;
};

export function mapProduct(row: {
  id: string;
  name: string;
  cat: string;
  price: number;
  old_price: number | null;
  ml: string;
  rating: number;
  reviews: number;
  tag: string | null;
  stock: number;
  variants: string[];
  description: string;
  usage_tips?: string[] | null;
  benefits?: string[] | null;
  section_toggles?: unknown;
  extra_sections?: unknown;
  active: boolean;
  image_url?: string | null;
  main_image_url?: string | null;
  gallery_images?: string[] | null;
  thumbnail_images?: string[] | null;
  home_visibility?: unknown;
  video_url?: string | null;
  seo_keyword?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  seo_slug?: string | null;
  image_alt?: string | null;
  product_variants?: DbVariantRow[] | null;
}): Product {
  const richVariants: ProductVariant[] = (row.product_variants ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      productId: v.product_id,
      name: v.name,
      price: Number(v.price),
      stock: v.stock,
      sku: v.sku,
      imageUrl: v.image_url,
      position: v.position,
    }));

  const homeVisibility = normalizeHomeVisibility(row.home_visibility, row.tag);

  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    price: row.price,
    old: row.old_price,
    ml: row.ml,
    rating: row.rating,
    reviews: row.reviews,
    tag: row.tag,
    stock: row.stock,
    variants: richVariants.length > 0 ? richVariants.map((v) => v.name) : (row.variants ?? []),
    desc: row.description,
    usageTips: row.usage_tips ?? [],
    benefits: row.benefits ?? [],
    sectionToggles: normalizeSectionToggles(row.section_toggles),
    extraSections: normalizeExtraSections(row.extra_sections),
    mainImageUrl: row.main_image_url ?? row.image_url ?? null,
    galleryImages: row.gallery_images?.length
      ? row.gallery_images
      : (row.thumbnail_images ?? []),
    videoUrl: row.video_url ?? null,
    imageUrl: row.image_url ?? null,
    productVariants: richVariants,
    homeVisibility,
    isFlashSale: deriveIsFlashSale({ homeVisibility, tag: row.tag }),
    active: row.active ?? true,
    seoKeyword: row.seo_keyword ?? null,
    seoTitle: row.seo_title ?? null,
    metaDescription: row.meta_description ?? null,
    seoSlug: row.seo_slug ?? null,
    imageAlt: row.image_alt ?? null,
  };
}

export async function fetchActiveProductsFromDb(): Promise<Product[] | null> {
  for (const select of [PRODUCT_SELECT, PRODUCT_SELECT_LEGACY]) {
    const { data, error } = await getSupabase()
      .from("products")
      .select(select)
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      return (data as unknown as Parameters<typeof mapProduct>[0][]).map(mapProduct);
    }
    if (error && !isMissingColumnError(error.message, "benefits")) {
      console.error("[usePublicProducts] Erreur Supabase:", error.message);
      break;
    }
  }
  return null;
}
