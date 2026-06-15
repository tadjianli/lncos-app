/**
 * LN COS — Vidéos Beauté (TikTok / Reels / Shorts)
 */

export type BeautyVideoType = "hosted" | "tiktok" | "instagram_reel" | "youtube_short";

export type BeautyVideoCategory =
  | "routine"
  | "tutoriel"
  | "avant_apres"
  | "unboxing"
  | "astuce"
  | "nouveaute"
  | "maquillage"
  | "skincare";

export interface BeautyVideo {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  videoType: BeautyVideoType;
  videoUrl: string;
  category: BeautyVideoCategory;
  published: boolean;
  featured: boolean;
  views: number;
  likes: number;
  relatedProductIds: string[];
  publishedAt: string;
  position: number;
}

export const BEAUTY_VIDEO_CATEGORIES: {
  id: BeautyVideoCategory | "all";
  label: string;
  filterLabel?: string;
}[] = [
  { id: "all", label: "Tout" },
  { id: "routine", label: "Routine", filterLabel: "Routine" },
  { id: "tutoriel", label: "Tutoriel", filterLabel: "Tutoriels" },
  { id: "avant_apres", label: "Avant / Après", filterLabel: "Avant / Après" },
  { id: "unboxing", label: "Unboxing", filterLabel: "Unboxing" },
  { id: "astuce", label: "Astuce beauté", filterLabel: "Astuces" },
  { id: "nouveaute", label: "Nouveauté", filterLabel: "Nouveautés" },
  { id: "maquillage", label: "Maquillage" },
  { id: "skincare", label: "Skincare" },
];

export const BEAUTY_VIDEO_TYPE_LABELS: Record<BeautyVideoType, string> = {
  hosted: "Vidéo hébergée",
  tiktok: "TikTok",
  instagram_reel: "Instagram Reel",
  youtube_short: "YouTube Short",
};

export function getBeautyVideoPath(slug: string): string {
  return `/videos/${slug}`;
}

export function emptyBeautyVideo(
  partial: Partial<BeautyVideo> & Pick<BeautyVideo, "id" | "slug" | "title">
): BeautyVideo {
  return {
    description: "",
    thumbnailUrl: null,
    videoType: "hosted",
    videoUrl: "",
    category: "routine",
    published: false,
    featured: false,
    views: 0,
    likes: 0,
    relatedProductIds: [],
    publishedAt: new Date().toISOString().slice(0, 10),
    position: 0,
    ...partial,
  };
}
