/**
 * LN COS — Blog contracts (Phase 2 : contenu, SEO, FAQ, produits liés)
 */

/** Identifiant catégorie (admin : texte libre, ex. conseils, tutoriels) */
export type BlogCategoryId = string;

export interface BlogCategory {
  id: BlogCategoryId;
  label: string;
  description: string;
  icon: string;
}

export type BlogContentBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "img"; url: string; alt?: string; caption?: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "ul" | "ol"; items: string[] };

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryId: BlogCategoryId;
  publishedAt: string;
  readMinutes: number;
  featured?: boolean;
  coverUrl?: string | null;
  /** false = brouillon admin (masqué côté public) */
  published: boolean;
  authorName: string;
  body: BlogContentBlock[];
  seoTitle?: string | null;
  metaDescription?: string | null;
  seoKeyword?: string | null;
  canonicalUrl?: string | null;
  faq: BlogFaqItem[];
  relatedProductIds: string[];
  /** Tags éditoriaux / SEO (ex. cils magnétiques, tutoriel) */
  tags?: string[];
  /** Schema.org Article (JSON-LD) généré ou édité */
  schemaArticle?: Record<string, unknown> | null;
}

export function getBlogArticlePath(slug: string): string {
  return `/blog/${slug}`;
}

export function emptyBlogArticle(
  partial: Partial<BlogArticle> & Pick<BlogArticle, "id" | "slug" | "title" | "categoryId">
): BlogArticle {
  return {
    excerpt: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    readMinutes: 5,
    published: false,
    featured: false,
    coverUrl: null,
    authorName: "Équipe LN COS",
    body: [],
    faq: [],
    relatedProductIds: [],
    tags: [],
    schemaArticle: null,
    ...partial,
  };
}
