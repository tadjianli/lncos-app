/**
 * LN COS — Contenu blog : catégories et helpers (articles = Supabase uniquement)
 */

import type { BlogArticle, BlogCategory, BlogCategoryId } from "./contracts/blog";

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "conseils",
    label: "Conseils beauté",
    description: "Rituels, gestes pro et inspiration au quotidien.",
    icon: "sparkle",
  },
  {
    id: "tutoriels",
    label: "Tutoriels",
    description: "Pas à pas maquillage, onglerie et soins.",
    icon: "play",
  },
  {
    id: "skincare",
    label: "Astuces skincare",
    description: "Peau éclatante, routines adaptées à chaque besoin.",
    icon: "heart",
  },
  {
    id: "tendances",
    label: "Tendances",
    description: "Ce qui fait vibrer la beauté cette saison.",
    icon: "flame",
  },
  {
    id: "nouveautes",
    label: "Nouveautés LN COS",
    description: "Lancements, coulisses et exclusivités maison.",
    icon: "star",
  },
];

export function getBlogCategory(
  id: BlogCategoryId,
  categories: BlogCategory[] = BLOG_CATEGORIES
): BlogCategory | undefined {
  return categories.find((c) => c.id === id);
}

export function filterBlogArticlesByCategory(
  articles: BlogArticle[],
  categoryId: BlogCategoryId | "all"
): BlogArticle[] {
  if (categoryId === "all") return articles;
  return articles.filter((a) => a.categoryId === categoryId);
}

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function searchBlogArticles(articles: BlogArticle[], query: string): BlogArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return articles;

  return articles.filter((article) => {
    const haystack = [
      article.title,
      article.excerpt,
      article.seoKeyword ?? "",
      article.body
        .map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : ""))
        .join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
