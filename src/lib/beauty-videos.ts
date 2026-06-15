/**
 * LN COS — Vidéos Beauté (mappers DB ↔ app)
 */

import type {
  BeautyVideo,
  BeautyVideoCategory,
  BeautyVideoType,
} from "./contracts/beauty-videos";

export interface DbBeautyVideo {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  video_type: BeautyVideoType;
  video_url: string;
  category: BeautyVideoCategory;
  published: boolean;
  featured: boolean;
  views: number;
  likes: number;
  related_product_ids: string[];
  published_at: string;
  position: number;
  created_at: string;
  updated_at: string;
}

const VIDEO_TYPES: BeautyVideoType[] = [
  "hosted",
  "tiktok",
  "instagram_reel",
  "youtube_short",
];

const CATEGORIES: BeautyVideoCategory[] = [
  "routine",
  "tutoriel",
  "avant_apres",
  "unboxing",
  "astuce",
  "nouveaute",
  "maquillage",
  "skincare",
];

function parseVideoType(raw: string): BeautyVideoType {
  return VIDEO_TYPES.includes(raw as BeautyVideoType)
    ? (raw as BeautyVideoType)
    : "hosted";
}

function parseCategory(raw: string): BeautyVideoCategory {
  return CATEGORIES.includes(raw as BeautyVideoCategory)
    ? (raw as BeautyVideoCategory)
    : "routine";
}

export function dbToBeautyVideo(row: DbBeautyVideo): BeautyVideo {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    thumbnailUrl: row.thumbnail_url,
    videoType: parseVideoType(row.video_type),
    videoUrl: row.video_url ?? "",
    category: parseCategory(row.category),
    published: row.published,
    featured: row.featured,
    views: row.views ?? 0,
    likes: row.likes ?? 0,
    relatedProductIds: row.related_product_ids ?? [],
    publishedAt: row.published_at,
    position: row.position ?? 0,
  };
}

export function beautyVideoToDb(v: Partial<BeautyVideo> & { id: string; slug: string; title: string }) {
  return {
    id: v.id,
    slug: v.slug,
    title: v.title,
    description: v.description ?? "",
    thumbnail_url: v.thumbnailUrl ?? null,
    video_type: v.videoType ?? "hosted",
    video_url: v.videoUrl ?? "",
    category: v.category ?? "routine",
    published: v.published ?? false,
    featured: v.featured ?? false,
    views: v.views ?? 0,
    likes: v.likes ?? 0,
    related_product_ids: v.relatedProductIds ?? [],
    published_at: v.publishedAt ?? new Date().toISOString().slice(0, 10),
    position: v.position ?? 0,
    updated_at: new Date().toISOString(),
  };
}

export function getBeautyVideoCategoryLabel(category: BeautyVideoCategory): string {
  const map: Record<BeautyVideoCategory, string> = {
    routine: "Routine",
    tutoriel: "Tutoriel",
    avant_apres: "Avant / Après",
    unboxing: "Unboxing",
    astuce: "Astuce beauté",
    nouveaute: "Nouveauté",
    maquillage: "Maquillage",
    skincare: "Skincare",
  };
  return map[category] ?? category;
}

export function formatVideoCount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}k`;
  }
  return String(n);
}

export function filterBeautyVideosByCategory(
  videos: BeautyVideo[],
  category: BeautyVideoCategory | "all"
): BeautyVideo[] {
  if (category === "all") return videos;
  return videos.filter((v) => v.category === category);
}
