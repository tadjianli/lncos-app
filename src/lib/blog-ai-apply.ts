/**
 * LN COS — Conversion réponse IA blog → article admin
 */

import type { BlogArticle } from "@/lib/contracts/blog";
import { emptyBlogArticle } from "@/lib/contracts/blog";
import type { BlogArticleResult } from "@/lib/ai-generate";
import { estimateReadMinutes } from "@/lib/blog-blocks";
import { slugifyTitle } from "@/lib/content-pages";

export function buildBlogArticleFromAi(
  data: BlogArticleResult,
  categoryId: string
): BlogArticle {
  const slug = data.slug.trim() || slugifyTitle(data.title);
  const body = data.body.length > 0 ? data.body : [{ type: "h1" as const, text: data.title }];

  return emptyBlogArticle({
    id: `blog-${Date.now()}`,
    slug,
    title: data.title,
    categoryId,
    excerpt: data.excerpt,
    seoTitle: data.seoTitle || data.title,
    metaDescription: data.metaDescription || data.excerpt,
    seoKeyword: data.seoKeyword || data.tags[0] || null,
    faq: data.faq,
    body,
    tags: data.tags,
    schemaArticle: data.schemaArticle,
    published: false,
    readMinutes: estimateReadMinutes(body),
  });
}
