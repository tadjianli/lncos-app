/**
 * LN COS — Blog côté serveur (metadata, sitemap, fetch par slug)
 */

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  dbToBlogArticle,
  dbToBlogCategory,
  staticBlogCategories,
  type DbBlogArticle,
  type DbBlogCategory,
} from "@/lib/content-pages";
import type { BlogArticle, BlogCategory } from "@/lib/contracts/blog";
import { getBlogArticlePath } from "@/lib/contracts/blog";
import { absoluteUrl } from "@/lib/site-url";

async function fetchLinkedProductImage(productId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("main_image_url, image_url, gallery_images, thumbnail_images")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;
  const row = data as {
    main_image_url?: string | null;
    image_url?: string | null;
    gallery_images?: string[] | null;
    thumbnail_images?: string[] | null;
  };
  return (
    row.main_image_url ??
    row.image_url ??
    row.gallery_images?.[0] ??
    row.thumbnail_images?.[0] ??
    null
  );
}

export async function resolveArticleCoverUrlServer(
  article: Pick<BlogArticle, "coverUrl" | "relatedProductIds">
): Promise<string | null> {
  const custom = article.coverUrl?.trim();
  if (custom) return custom;

  for (const id of article.relatedProductIds) {
    const img = await fetchLinkedProductImage(id);
    if (img) return img;
  }
  return null;
}

export async function blogArticleMetadata(article: BlogArticle, categoryLabel?: string) {
  const title = article.seoTitle?.trim() || `${article.title} | LN COS`;
  const description =
    article.metaDescription?.trim() ||
    article.excerpt.trim().slice(0, 160) ||
    `Découvrez ${article.title} sur le blog LN COS.`;
  const path = getBlogArticlePath(article.slug);
  const canonical = article.canonicalUrl?.trim() || absoluteUrl(path);
  const image = (await resolveArticleCoverUrlServer(article)) ?? undefined;

  return { title, description, canonical, path, image, categoryLabel };
}

export async function fetchBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const normalized = slug.trim().toLowerCase();
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", normalized)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return dbToBlogArticle(data as DbBlogArticle);
}

export async function fetchPublishedBlogArticles(): Promise<BlogArticle[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data?.length) return [];
  return (data as DbBlogArticle[]).map(dbToBlogArticle);
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .eq("enabled", true)
      .order("position");

    if (!error && data?.length) {
      return (data as DbBlogCategory[]).map(dbToBlogCategory);
    }
  }

  return staticBlogCategories();
}

export function getSimilarArticles(
  article: BlogArticle,
  all: BlogArticle[],
  limit = 3
): BlogArticle[] {
  return all
    .filter((a) => a.id !== article.id && a.categoryId === article.categoryId)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function fetchBlogSitemapEntries(): Promise<
  { url: string; lastModified?: Date }[]
> {
  const articles = await fetchPublishedBlogArticles();
  return [
    { url: absoluteUrl("/blog") },
    ...articles.map((a) => ({
      url: absoluteUrl(getBlogArticlePath(a.slug)),
      lastModified: a.publishedAt ? new Date(a.publishedAt) : undefined,
    })),
  ];
}

export function findBlogCategory(
  categories: BlogCategory[],
  id: string
): BlogCategory | undefined {
  return categories.find((c) => c.id === id);
}
