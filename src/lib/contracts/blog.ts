/**
 * LN COS — Blog contracts (prêt pour publication admin)
 */

export type BlogCategoryId =
  | "conseils"
  | "tutoriels"
  | "skincare"
  | "tendances"
  | "nouveautes";

export interface BlogCategory {
  id: BlogCategoryId;
  label: string;
  description: string;
  icon: string;
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
}
