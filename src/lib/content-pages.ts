/**
 * LN COS — Pages contenu (Ventes Flash, Blog, Réseaux sociaux)
 * Types, valeurs par défaut et mappers Supabase.
 */

import type { BlogArticle, BlogCategory, BlogFaqItem } from "./contracts/blog";
import { parseBlogBody } from "./blog-blocks";
import type { Json } from "./database.types";
import type { SocialNetworkLink } from "./social-links";
import { BLOG_CATEGORIES as STATIC_BLOG_CATEGORIES } from "./blog-content";
import { SOCIAL_NETWORK_LINKS as STATIC_SOCIAL_LINKS } from "./social-links";

/* ── Flash sales settings ─────────────────────────────────────────────────── */

export interface FlashSalesSettings {
  pageEnabled: boolean;
  bannerEyebrow: string;
  bannerTitle: string;
  /** Placeholder {{count}} pour le nombre de promotions */
  bannerSubtitleTemplate: string;
  countdownLabel: string;
  emptyEyebrow: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCtaLabel: string;
  emptyCtaHref: string;
}

export const DEFAULT_FLASH_SALES_SETTINGS: FlashSalesSettings = {
  pageEnabled: true,
  bannerEyebrow: "Offres limitées",
  bannerTitle: "Ventes Flash LN COS",
  bannerSubtitleTemplate:
    "{{count}} promotion(s) en cours — prix exclusifs, stocks limités.",
  countdownLabel: "Se termine dans",
  emptyEyebrow: "🔥 Ventes Flash LN COS",
  emptyTitle: "Aucune vente flash disponible",
  emptyBody:
    "Aucune vente flash n'est disponible pour le moment. De nouvelles offres exclusives arrivent bientôt.",
  emptyCtaLabel: "Découvrir nos produits",
  emptyCtaHref: "/discover",
};

export interface DbFlashSalesSettings {
  id: string;
  page_enabled: boolean;
  banner_eyebrow: string;
  banner_title: string;
  banner_subtitle_template: string;
  countdown_label: string;
  empty_eyebrow: string;
  empty_title: string;
  empty_body: string;
  empty_cta_label: string;
  empty_cta_href: string;
}

export function dbToFlashSalesSettings(
  row: DbFlashSalesSettings | null
): FlashSalesSettings {
  if (!row) return DEFAULT_FLASH_SALES_SETTINGS;
  return {
    pageEnabled: row.page_enabled,
    bannerEyebrow: row.banner_eyebrow,
    bannerTitle: row.banner_title,
    bannerSubtitleTemplate: row.banner_subtitle_template,
    countdownLabel: row.countdown_label,
    emptyEyebrow: row.empty_eyebrow,
    emptyTitle: row.empty_title,
    emptyBody: row.empty_body,
    emptyCtaLabel: row.empty_cta_label,
    emptyCtaHref: row.empty_cta_href,
  };
}

export function flashSalesSettingsToDb(s: FlashSalesSettings) {
  return {
    page_enabled: s.pageEnabled,
    banner_eyebrow: s.bannerEyebrow,
    banner_title: s.bannerTitle,
    banner_subtitle_template: s.bannerSubtitleTemplate,
    countdown_label: s.countdownLabel,
    empty_eyebrow: s.emptyEyebrow,
    empty_title: s.emptyTitle,
    empty_body: s.emptyBody,
    empty_cta_label: s.emptyCtaLabel,
    empty_cta_href: s.emptyCtaHref,
  };
}

export function formatFlashBannerSubtitle(template: string, count: number): string {
  const plural = count > 1 ? "s" : "";
  return template
    .replace(/\{\{count\}\}/g, String(count))
    .replace(/\(s\)/g, plural ? "s" : "");
}

/* ── Blog page settings ───────────────────────────────────────────────────── */

export interface BlogPageSettings {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  articlesSectionTitle: string;
  articlesSectionHint: string;
}

export const DEFAULT_BLOG_PAGE_SETTINGS: BlogPageSettings = {
  heroEyebrow: "Magazine beauté",
  heroTitle: "Blog LN COS",
  heroSubtitle:
    "Conseils beauté, tutoriels, astuces skincare, tendances et nouveautés — curated by LN COS.",
  articlesSectionTitle: "Derniers articles",
  articlesSectionHint: "",
};

export interface DbBlogPageSettings {
  id: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  articles_section_title: string;
  articles_section_hint: string;
}

export function dbToBlogPageSettings(row: DbBlogPageSettings | null): BlogPageSettings {
  if (!row) return DEFAULT_BLOG_PAGE_SETTINGS;
  return {
    heroEyebrow: row.hero_eyebrow,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    articlesSectionTitle: row.articles_section_title,
    articlesSectionHint: row.articles_section_hint,
  };
}

export function blogPageSettingsToDb(s: BlogPageSettings) {
  return {
    hero_eyebrow: s.heroEyebrow,
    hero_title: s.heroTitle,
    hero_subtitle: s.heroSubtitle,
    articles_section_title: s.articlesSectionTitle,
    articles_section_hint: s.articlesSectionHint,
  };
}

/* ── Blog categories & articles ───────────────────────────────────────────── */

export interface AdminBlogCategory extends BlogCategory {
  position: number;
  enabled: boolean;
}

export interface DbBlogCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  position: number;
  enabled: boolean;
}

export interface DbBlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category_id: string;
  published_at: string;
  read_minutes: number;
  featured: boolean;
  cover_url: string | null;
  published: boolean;
  position: number;
  body?: unknown;
  author_name?: string;
  seo_title?: string | null;
  meta_description?: string | null;
  seo_keyword?: string | null;
  canonical_url?: string | null;
  faq?: unknown;
  related_product_ids?: string[] | null;
}

export function dbToBlogCategory(row: DbBlogCategory): AdminBlogCategory {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    icon: row.icon,
    position: row.position,
    enabled: row.enabled,
  };
}

export function blogCategoryToDb(c: Partial<AdminBlogCategory> & { id: string }) {
  return {
    id: c.id,
    label: c.label ?? "",
    description: c.description ?? "",
    icon: c.icon ?? "sparkle",
    position: c.position ?? 0,
    enabled: c.enabled ?? true,
  };
}

function parseBlogFaq(raw: unknown): BlogFaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is BlogFaqItem => {
      if (!item || typeof item !== "object") return false;
      const row = item as { question?: unknown; answer?: unknown };
      return typeof row.question === "string" && typeof row.answer === "string";
    })
    .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
    .filter((item) => item.question && item.answer);
}

export function dbToBlogArticle(row: DbBlogArticle): BlogArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    categoryId: row.category_id,
    publishedAt: row.published_at,
    readMinutes: row.read_minutes,
    featured: row.featured,
    coverUrl: row.cover_url,
    published: row.published,
    authorName: row.author_name ?? "Équipe LN COS",
    body: parseBlogBody(row.body),
    seoTitle: row.seo_title ?? null,
    metaDescription: row.meta_description ?? null,
    seoKeyword: row.seo_keyword ?? null,
    canonicalUrl: row.canonical_url ?? null,
    faq: parseBlogFaq(row.faq),
    relatedProductIds: row.related_product_ids ?? [],
  };
}

export function blogArticleToDb(a: Partial<BlogArticle> & { id: string; slug: string; title: string; categoryId: string }) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? "",
    category_id: a.categoryId,
    published_at: a.publishedAt ?? new Date().toISOString().slice(0, 10),
    read_minutes: a.readMinutes ?? 5,
    featured: a.featured ?? false,
    cover_url: a.coverUrl ?? null,
    published: a.published ?? false,
    position: 0,
    body: (a.body ?? []) as unknown as Json,
    author_name: a.authorName ?? "Équipe LN COS",
    seo_title: a.seoTitle ?? null,
    meta_description: a.metaDescription ?? null,
    seo_keyword: a.seoKeyword ?? null,
    canonical_url: a.canonicalUrl ?? null,
    faq: (a.faq ?? []) as unknown as Json,
    related_product_ids: a.relatedProductIds ?? [],
  };
}

export function staticBlogCategories(): AdminBlogCategory[] {
  return STATIC_BLOG_CATEGORIES.map((c, i) => ({
    ...c,
    position: i,
    enabled: true,
  }));
}

export function staticBlogArticles(): BlogArticle[] {
  return [];
}

/* ── Social page settings ─────────────────────────────────────────────────── */

export interface SocialPageSettings {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  footnote: string;
}

export const DEFAULT_SOCIAL_PAGE_SETTINGS: SocialPageSettings = {
  heroEyebrow: "Communauté LN COS",
  heroTitle: "Réseaux sociaux",
  heroSubtitle:
    "Suivez LN COS au quotidien — inspiration beauté, coulisses, tutoriels et lancements en exclusivité.",
  footnote:
    "Statistiques et dernières publications affichées automatiquement dès la connexion admin.",
};

export interface DbSocialPageSettings {
  id: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  footnote: string;
}

export function dbToSocialPageSettings(row: DbSocialPageSettings | null): SocialPageSettings {
  if (!row) return DEFAULT_SOCIAL_PAGE_SETTINGS;
  return {
    heroEyebrow: row.hero_eyebrow,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    footnote: row.footnote,
  };
}

export function socialPageSettingsToDb(s: SocialPageSettings) {
  return {
    hero_eyebrow: s.heroEyebrow,
    hero_title: s.heroTitle,
    hero_subtitle: s.heroSubtitle,
    footnote: s.footnote,
  };
}

/* ── Social network links ─────────────────────────────────────────────────── */

export interface AdminSocialLink extends SocialNetworkLink {
  position: number;
  enabled: boolean;
}

export interface DbSocialNetworkLink {
  id: string;
  name: string;
  handle: string;
  url: string;
  accent: string;
  followers: number | null;
  latest_post: string | null;
  latest_video: string | null;
  position: number;
  enabled: boolean;
}

export function dbToSocialLink(row: DbSocialNetworkLink): AdminSocialLink {
  return {
    id: row.id as SocialNetworkLink["id"],
    name: row.name,
    handle: row.handle,
    url: row.url,
    accent: row.accent,
    followers: row.followers,
    latestPost: row.latest_post,
    latestVideo: row.latest_video,
    position: row.position,
    enabled: row.enabled,
  };
}

export function socialLinkToDb(l: Partial<AdminSocialLink> & { id: string; name: string; url: string }) {
  return {
    id: l.id,
    name: l.name,
    handle: l.handle ?? "",
    url: l.url,
    accent: l.accent ?? "#D4AF37",
    followers: l.followers ?? null,
    latest_post: l.latestPost ?? null,
    latest_video: l.latestVideo ?? null,
    position: l.position ?? 0,
    enabled: l.enabled ?? true,
  };
}

export function staticSocialLinks(): AdminSocialLink[] {
  return STATIC_SOCIAL_LINKS.map((l, i) => ({
    ...l,
    position: i,
    enabled: true,
  }));
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || `article-${Date.now()}`;
}
