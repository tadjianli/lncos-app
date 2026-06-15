/**
 * LN COS — Fetch SEO côté serveur (sitemap, metadata, pages produit/catégorie)
 */

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { products as STATIC_PRODUCTS, type Product, type Category } from "@/lib/data";
import type { ProductVariant } from "@/lib/product-catalog";
import { normalizeExtraSections, normalizeSectionToggles } from "@/lib/product-sections";
import { normalizeHomeVisibility } from "@/lib/product-home-visibility";
import { getProductSeoPath, getCategorySeoPath, slugifySeo } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import { applyCategoryProductCounts } from "@/lib/category-product-counts";
import { fetchBlogSitemapEntries } from "@/lib/blog-server";
import {
  PRODUCT_SELECT,
  PRODUCT_SELECT_LEGACY,
  isMissingColumnError,
} from "@/lib/product-select";

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
    usageTips: row.usage_tips ?? [],
    benefits: row.benefits ?? [],
    sectionToggles: normalizeSectionToggles(row.section_toggles),
    extraSections: normalizeExtraSections(row.extra_sections),
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
    count: 0,
    coverUrl: row.cover_url ?? null,
    seoKeyword: row.seo_keyword ?? null,
    seoTitle: row.seo_title ?? null,
    metaDescription: row.meta_description ?? null,
    seoSlug: row.seo_slug ?? null,
    imageAlt: row.image_alt ?? null,
  };
}

function productMatchesSlug(
  row: { id: string; name: string; seo_slug?: string | null },
  slug: string
): boolean {
  const normalized = slug.trim().toLowerCase();
  const seoSlug = row.seo_slug?.trim().toLowerCase();
  if (seoSlug === normalized) return true;
  if (row.id.toLowerCase() === normalized) return true;
  if (slugifySeo(row.name) === normalized) return true;
  if (seoSlug && slugifySeo(seoSlug) === normalized) return true;
  return false;
}

function findStaticProductBySlug(slug: string): Product | null {
  const match = STATIC_PRODUCTS.find((p) =>
    productMatchesSlug({ id: p.id, name: p.name, seo_slug: p.seoSlug ?? null }, slug)
  );
  return match ? { ...match, active: true } : null;
}

async function queryProductRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  select: string,
  column: "seo_slug" | "id",
  value: string,
  preview: boolean
) {
  let q = supabase.from("products").select(select).eq(column, value);
  if (!preview) q = q.eq("active", true);
  return q.maybeSingle();
}

async function fetchProductRowBySlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  preview: boolean
): Promise<DbProductRow | null> {
  const selects = [PRODUCT_SELECT, PRODUCT_SELECT_LEGACY];

  for (const select of selects) {
    for (const column of ["seo_slug", "id"] as const) {
      const result = await queryProductRow(supabase, select, column, slug, preview);
      if (result.error) {
        if (isMissingColumnError(result.error.message, "benefits") && select === PRODUCT_SELECT) {
          continue;
        }
        console.error(
          `[fetchProductBySeoSlug] Erreur (${column}=${slug}):`,
          result.error.message
        );
        continue;
      }
      if (result.data) return result.data as unknown as DbProductRow;
    }
    if (select === PRODUCT_SELECT_LEGACY) break;
  }

  for (const select of selects) {
    let q = supabase.from("products").select(select);
    if (!preview) q = q.eq("active", true);
    const { data, error } = await q;
    if (error) {
      if (isMissingColumnError(error.message, "benefits") && select === PRODUCT_SELECT) continue;
      break;
    }
    const match = (data as unknown as DbProductRow[] | null)?.find((row) =>
      productMatchesSlug(row, slug)
    );
    if (match) return match;
    if (select === PRODUCT_SELECT_LEGACY) break;
  }

  return null;
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
    return findStaticProductBySlug(normalizedSlug);
  }

  const supabase = await createClient();
  const row = await fetchProductRowBySlug(supabase, normalizedSlug, preview);
  if (row) return mapProductRow(row);

  console.warn("[fetchProductBySeoSlug] Produit introuvable, slug:", normalizedSlug);
  return findStaticProductBySlug(normalizedSlug);
}

export async function fetchCategoryBySeoSlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data: bySlug } = await supabase
    .from("categories")
    .select("id,name,cover_url,seo_keyword,seo_title,meta_description,seo_slug,image_alt")
    .eq("seo_slug", slug)
    .maybeSingle();
  const row = bySlug
    ?? (
      await supabase
        .from("categories")
        .select("id,name,cover_url,seo_keyword,seo_title,meta_description,seo_slug,image_alt")
        .eq("id", slug)
        .maybeSingle()
    ).data;

  if (!row) return null;

  const products = await fetchAllActiveProducts();
  return applyCategoryProductCounts([mapCategoryRow(row as DbCategoryRow)], products)[0];
}

async function fetchAllActiveProducts(): Promise<Product[]> {
  const supabase = await createClient();
  for (const select of [PRODUCT_SELECT, PRODUCT_SELECT_LEGACY]) {
    const { data, error } = await supabase
      .from("products")
      .select(select)
      .eq("active", true)
      .order("name");
    if (!error && data) {
      return (data as unknown as DbProductRow[]).map((r) => mapProductRow(r));
    }
    if (!isMissingColumnError(error?.message ?? "", "benefits")) break;
  }
  return [];
}

export async function fetchProductsByCategory(catId: string): Promise<Product[]> {
  const products = await fetchAllActiveProducts();
  return products.filter((p) => p.active !== false && p.cat === catId);
}

/** Audit catalogue — pages produit accessibles vs cassées */
export async function auditProductCatalog(): Promise<{
  total: number;
  accessible: number;
  broken: { id: string; name: string; seoSlug: string | null; reason: string }[];
  invalidSlugs: { id: string; name: string; seoSlug: string | null }[];
}> {
  if (!isSupabaseConfigured()) {
    const staticTotal = STATIC_PRODUCTS.length;
    return {
      total: staticTotal,
      accessible: staticTotal,
      broken: [],
      invalidSlugs: [],
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id,name,seo_slug,active")
    .eq("active", true);

  const rows = data ?? [];
  const broken: { id: string; name: string; seoSlug: string | null; reason: string }[] = [];
  const invalidSlugs: { id: string; name: string; seoSlug: string | null }[] = [];

  for (const row of rows) {
    const slug = row.seo_slug?.trim() || null;
    const isUuidSlug =
      slug &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    if (!slug || isUuidSlug) {
      invalidSlugs.push({ id: row.id, name: row.name, seoSlug: slug });
    }

    const resolved = await fetchProductBySeoSlug(slug || row.id);
    const pathSlug = slug || slugifySeo(row.name) || row.id;
    const resolvedByPath = await fetchProductBySeoSlug(pathSlug);
    if (!resolved && !resolvedByPath) {
      broken.push({
        id: row.id,
        name: row.name,
        seoSlug: slug,
        reason: "fetchProductBySeoSlug retourne null",
      });
    }
  }

  return {
    total: rows.length,
    accessible: rows.length - broken.length,
    broken,
    invalidSlugs,
  };
}

export async function fetchSitemapEntries(): Promise<{ url: string; lastModified?: Date }[]> {
  const supabase = await createClient();
  const entries: { url: string; lastModified?: Date }[] = [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/boutique") },
    { url: absoluteUrl("/discover") },
    { url: absoluteUrl("/rdv") },
    { url: absoluteUrl("/blog") },
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

  const blogEntries = await fetchBlogSitemapEntries();
  for (const entry of blogEntries) {
    if (entry.url.endsWith("/blog")) continue;
    entries.push(entry);
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
