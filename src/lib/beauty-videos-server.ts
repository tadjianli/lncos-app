/**
 * LN COS — Vidéos Beauté côté serveur
 */

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { dbToBeautyVideo, type DbBeautyVideo } from "@/lib/beauty-videos";
import type { BeautyVideo } from "@/lib/contracts/beauty-videos";
import { getBeautyVideoPath } from "@/lib/contracts/beauty-videos";
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

export async function resolveBeautyVideoThumbnailServer(
  video: Pick<BeautyVideo, "thumbnailUrl" | "relatedProductIds">
): Promise<string | null> {
  const custom = video.thumbnailUrl?.trim();
  if (custom) return custom;

  for (const id of video.relatedProductIds) {
    const img = await fetchLinkedProductImage(id);
    if (img) return img;
  }
  return null;
}

export async function fetchBeautyVideoBySlug(slug: string): Promise<BeautyVideo | null> {
  const normalized = slug.trim().toLowerCase();
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beauty_videos")
    .select("*")
    .eq("slug", normalized)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return dbToBeautyVideo(data as DbBeautyVideo);
}

export async function fetchPublishedBeautyVideos(): Promise<BeautyVideo[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beauty_videos")
    .select("*")
    .eq("published", true)
    .order("position")
    .order("published_at", { ascending: false });

  if (error || !data?.length) return [];
  return (data as DbBeautyVideo[]).map(dbToBeautyVideo);
}

export async function beautyVideoMetadata(video: BeautyVideo) {
  const title = `${video.title} | Vidéos Beauté LN COS`;
  const description =
    video.description.trim().slice(0, 160) ||
    `Regardez ${video.title} sur LN COS — conseils et démonstrations beauté.`;
  const path = getBeautyVideoPath(video.slug);
  const canonical = absoluteUrl(path);
  const image = (await resolveBeautyVideoThumbnailServer(video)) ?? undefined;

  return { title, description, canonical, path, image };
}

export async function fetchBeautyVideoSitemapEntries(): Promise<
  { url: string; lastModified?: Date }[]
> {
  const videos = await fetchPublishedBeautyVideos();
  return [
    { url: absoluteUrl("/videos") },
    ...videos.map((v) => ({
      url: absoluteUrl(getBeautyVideoPath(v.slug)),
      lastModified: v.publishedAt ? new Date(v.publishedAt) : undefined,
    })),
  ];
}
