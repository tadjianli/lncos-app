/**
 * LN COS — Extraction d'IDs et URLs d'intégration vidéo
 */

import type { BeautyVideoType } from "./contracts/beauty-videos";

export function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const shorts = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shorts) return shorts[1];

  const watch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch) return watch[1];

  const youtu = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (youtu) return youtu[1];

  const embed = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];

  return null;
}

export function extractTikTokVideoId(url: string): string | null {
  const match = url.trim().match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  return match?.[1] ?? null;
}

export function extractInstagramReelCode(url: string): string | null {
  const trimmed = url.trim();
  const reel = trimmed.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  return reel?.[1] ?? null;
}

export function getVideoEmbedUrl(videoType: BeautyVideoType, videoUrl: string): string | null {
  switch (videoType) {
    case "youtube_short": {
      const id = extractYoutubeId(videoUrl);
      return id ? `https://www.youtube.com/embed/${id}?playsinline=1&rel=0` : null;
    }
    case "tiktok": {
      const id = extractTikTokVideoId(videoUrl);
      return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
    }
    case "instagram_reel": {
      const code = extractInstagramReelCode(videoUrl);
      return code ? `https://www.instagram.com/reel/${code}/embed` : null;
    }
    default:
      return null;
  }
}

export function isHostedVideoUrl(url: string): boolean {
  const lower = url.trim().toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.includes(".mp4?") ||
    lower.startsWith("blob:") ||
    (lower.startsWith("http") &&
      !lower.includes("youtube.com") &&
      !lower.includes("youtu.be") &&
      !lower.includes("tiktok.com") &&
      !lower.includes("instagram.com"))
  );
}
