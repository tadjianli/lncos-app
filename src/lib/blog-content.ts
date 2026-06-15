/**
 * LN COS — Contenu blog (statique → futur CMS / Supabase)
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

/** Articles de démonstration — remplacés par l'admin à terme */
export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "blog-1",
    slug: "rituel-eclat-matin",
    title: "Le rituel éclat du matin en 5 minutes",
    excerpt: "Réveillez votre peau avec des gestes simples et des textures LN COS pensées pour un glow naturel.",
    categoryId: "conseils",
    publishedAt: "2026-06-01",
    readMinutes: 4,
    featured: true,
    published: true,
  },
  {
    id: "blog-2",
    slug: "erreurs-skincare-eviter",
    title: "5 erreurs skincare à éviter absolument",
    excerpt: "Sur-nettoyage, sur-exfoliation… Les pièges qui sabotent votre routine et comment les corriger.",
    categoryId: "skincare",
    publishedAt: "2026-05-28",
    readMinutes: 6,
    featured: true,
    published: true,
  },
  {
    id: "blog-3",
    slug: "manucure-french-parfaite",
    title: "Tutoriel : la French manucure parfaite",
    excerpt: "De la préparation de l'ongle au fini ultra net — la technique institut à reproduire chez vous.",
    categoryId: "tutoriels",
    publishedAt: "2026-05-25",
    readMinutes: 8,
    published: true,
  },
  {
    id: "blog-4",
    slug: "tendance-glow-skin",
    title: "Tendance 2026 : le glow skin minimaliste",
    excerpt: "Peau lumineuse, maquillage léger — la direction beauté que LN COS adopte cette année.",
    categoryId: "tendances",
    publishedAt: "2026-05-20",
    readMinutes: 5,
    published: true,
  },
  {
    id: "blog-5",
    slug: "lancement-serum-or",
    title: "Nouveau : Sérum Or 24K — édition limitée",
    excerpt: "Découvrez notre dernière innovation anti-âge, enrichie en particules d'or et actifs botaniques.",
    categoryId: "nouveautes",
    publishedAt: "2026-06-08",
    readMinutes: 3,
    featured: true,
    published: true,
  },
  {
    id: "blog-6",
    slug: "hydratation-peaux-seches",
    title: "Astuce : booster l'hydratation des peaux sèches",
    excerpt: "Layering, textures et moment d'application — nos recommandations expertes.",
    categoryId: "skincare",
    publishedAt: "2026-05-15",
    readMinutes: 5,
    published: true,
  },
];

export function getBlogCategory(id: BlogCategoryId): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.id === id);
}

/** Articles publiés, triés du plus récent au plus ancien */
export function getPublishedBlogArticles(): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.published).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
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
