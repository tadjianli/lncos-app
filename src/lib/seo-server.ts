/**
 * LN COS — Fetch SEO côté serveur (sitemap, metadata, pages produit/catégorie)
 */

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { products as STATIC_PRODUCTS, type Product, type Category } from "@/lib/data";
import type { ProductVariant } from "@/lib/product-catalog";
import { normalizeCommitments, normalizeExtraSections, normalizeSectionToggles } from "@/lib/product-sections";
import { normalizeHomeVisibility } from "@/lib/product-home-visibility";
import { getProductSeoPath, getCategorySeoPath } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

const PRODUCT_SELECT =
  "id,name,cat,price,old_price,ml,rating,reviews,tag,stock,variants,description,ingredients,usage_tips,section_toggles,extra_sections,commitments,active,image_url,main_image_url,gallery_images,thumbnail_images,home_visibility,video_url,seo_keyword,seo_title,meta_description,seo_slug,image_alt,product_variants(id,product_id,name,price,stock,sku,image_url,position)";

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

type DbProductRow = {
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
  ingredients: string[];
  usage_tips?: string[] | null;
  section_toggles?: unknown;
  extra_sections?: unknown;
  commitments?: unknown;
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
};

function mapProductRow(row: DbProductRow): Product {
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

  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    price: Number(row.price),
    old: row.old_price !== null ? Number(row.old_price) : null,
    ml: row.ml,
    rating: Number(row.rating),
    reviews: row.reviews,
    tag: row.tag,
    stock: row.stock,
    variants: richVariants.length > 0 ? richVariants.map((v) => v.name) : (row.variants ?? []),
    desc: row.description,
    ingredients: row.ingredients ?? [],
    usageTips: row.usage_tips ?? [],
    sectionToggles: normalizeSectionToggles(row.section_toggles),
    extraSections: normalizeExtraSections(row.extra_sections),
    commitments: normalizeCommitments(row.commitments),
    mainImageUrl: row.main_image_url ?? row.image_url ?? null,
    galleryImages: row.gallery_images?.length ? row.gallery_images : (row.thumbnail_images ?? []),
    videoUrl: row.video_url ?? null,
    imageUrl: row.image_url ?? null,
    productVariants: richVariants,
    homeVisibility: normalizeHomeVisibility(row.home_visibility, row.tag),
    active: row.active ?? true,
    seoKeyword: row.seo_keyword ?? null,
    seoTitle: row.seo_title ?? null,
    metaDescription: row.meta_description ?? null,
    seoSlug: row.seo_slug ?? null,
    imageAlt: row.image_alt ?? null,
  };
}

type DbCategoryRow = {
  id: string;
  name: string;
  count: number;
  cover_url?: string | null;
  seo_keyword?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  seo_slug?: string | null;
  image_alt?: string | null;
};

function mapCategoryRow(row: DbCategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    count: row.count,
    coverUrl: row.cover_url ?? null,
    seoKeyword: row.seo_keyword ?? null,
    seoTitle: row.seo_title ?? null,
    metaDescription: row.meta_description ?? null,
    seoSlug: row.seo_slug ?? null,
    imageAlt: row.image_alt ?? null,
  };
}

function findStaticProductBySlug(slug: string): Product | null {
  const match = STATIC_PRODUCTS.find(
    (p) => p.seoSlug === slug || p.id === slug
  );
  return match ? { ...match, active: true } : null;
}

export async function fetchProductBySeoSlug(
  slug: string,
  options?: { preview?: boolean }
): Promise<Product | null> {
  const normalizedSlug = decodeURIComponent(slug).trim();
  const preview = options?.preview ?? false;

  if (!normalizedSlug) {
    console.warn("[fetchProductBySeoSlug] slug vide");
    return null;
  }

  if (!isSupabaseConfigured()) {
    console.warn("[fetchProductBySeoSlug] Supabase non configuré, slug:", normalizedSlug);
    return findStaticProductBySlug(normalizedSlug);
  }

  const supabase = await createClient();

  const queryProduct = async (column: "seo_slug" | "id") => {
    let q = supabase.from("products").select(PRODUCT_SELECT).eq(column, normalizedSlug);
    if (!preview) q = q.eq("active", true);
    const result = await q.maybeSingle();
    if (result.error) {
      console.error(
        `[fetchProductBySeoSlug] Erreur Supabase (${column}=${normalizedSlug}, preview=${preview}):`,
        result.error.message
      );
    } else {
      console.log(
        `[fetchProductBySeoSlug] ${column}=${normalizedSlug} preview=${preview} →`,
        result.data ? `trouvé (id=${(result.data as DbProductRow).id})` : "non trouvé"
      );
    }
    return result;
  };

  const { data: bySlug } = await queryProduct("seo_slug");
  if (bySlug) return mapProductRow(bySlug as DbProductRow);

  const { data: byId } = await queryProduct("id");
  if (byId) return mapProductRow(byId as DbProductRow);

  console.warn("[fetchProductBySeoSlug] Produit introuvable, slug:", normalizedSlug);
  return findStaticProductBySlug(normalizedSlug);
}

export async function fetchCategoryBySeoSlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data: bySlug } = await supabase
    .from("categories")
    .select("id,name,count,cover_url,seo_keyword,seo_title,meta_description,seo_slug,image_alt")
    .eq("seo_slug", slug)
    .maybeSingle();
  if (bySlug) return mapCategoryRow(bySlug as DbCategoryRow);

  const { data: byId } = await supabase
    .from("categories")
    .select("id,name,count,cover_url,seo_keyword,seo_title,meta_description,seo_slug,image_alt")
    .eq("id", slug)
    .maybeSingle();
  if (byId) return mapCategoryRow(byId as DbCategoryRow);

  return null;
}

export async function fetchProductsByCategory(catId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("cat", catId)
    .order("name");
  return (data ?? []).map((r) => mapProductRow(r as DbProductRow));
}

export async function fetchSitemapEntries(): Promise<{ url: string; lastModified?: Date }[]> {
  const supabase = await createClient();
  const entries: { url: string; lastModified?: Date }[] = [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/boutique") },
    { url: absoluteUrl("/discover") },
  ];

  const { data: products } = await supabase
    .from("products")
    .select("id,name,seo_slug,updated_at")
    .eq("active", true);

  for (const p of products ?? []) {
    const path = getProductSeoPath({
      id: p.id,
      name: p.name,
      seoSlug: p.seo_slug,
    });
    entries.push({
      url: absoluteUrl(path),
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    });
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id,seo_slug");

  for (const c of categories ?? []) {
    entries.push({
      url: absoluteUrl(getCategorySeoPath({ id: c.id, seoSlug: c.seo_slug })),
    });
  }

  return entries;
}

export function productMetadata(product: Product) {
  const title = product.seoTitle?.trim() || `${product.name} | LN COS`;
  const description =
    product.metaDescription?.trim() ||
    product.desc?.trim().slice(0, 160) ||
    `Découvrez ${product.name} sur LN COS.`;
  const path = getProductSeoPath(product);
  const canonical = absoluteUrl(path);
  const image = product.mainImageUrl ?? undefined;

  return { title, description, canonical, path, image };
}

export function categoryMetadata(category: Category) {
  const title = category.seoTitle?.trim() || `${category.name} | LN COS`;
  const description =
    category.metaDescription?.trim() ||
    `Découvrez la catégorie ${category.name} — cosmétiques premium LN COS.`;
  const path = getCategorySeoPath(category);
  const canonical = absoluteUrl(path);

  return { title, description, canonical, path };
}
