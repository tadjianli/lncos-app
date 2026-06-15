"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  beautyVideoToDb,
  dbToBeautyVideo,
  type DbBeautyVideo,
} from "@/lib/beauty-videos";
import type { BeautyVideo } from "@/lib/contracts/beauty-videos";
import { emptyBeautyVideo } from "@/lib/contracts/beauty-videos";
import { slugifyTitle } from "@/lib/content-pages";

export function useAdminBeautyVideos() {
  const [videos, setVideos] = useState<BeautyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setVideos([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    const { data } = await supabase
      .from("beauty_videos")
      .select("*")
      .order("position")
      .order("published_at", { ascending: false });

    setVideos(data?.length ? (data as DbBeautyVideo[]).map(dbToBeautyVideo) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const supabase = getSupabase();
    const channel = supabase
      .channel("beauty-videos-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "beauty_videos" }, load)
      .subscribe();
    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [load]);

  const upsertVideo = useCallback(
    async (video: BeautyVideo) => {
      setSaving(true);
      const { error } = await getSupabase()
        .from("beauty_videos")
        .upsert(beautyVideoToDb(video));
      setSaving(false);
      if (error) return { error: error.message };
      await load();
      return { error: null };
    },
    [load]
  );

  const createVideo = useCallback(
    async (partial: Omit<BeautyVideo, "id" | "slug"> & { slug?: string }) => {
      const id = `bv-${Date.now()}`;
      const slug = partial.slug ?? slugifyTitle(partial.title);
      const video = emptyBeautyVideo({ ...partial, id, slug });
      return upsertVideo(video);
    },
    [upsertVideo]
  );

  const deleteVideo = useCallback(
    async (id: string) => {
      const { error } = await getSupabase().from("beauty_videos").delete().eq("id", id);
      if (error) return { error: error.message };
      await load();
      return { error: null };
    },
    [load]
  );

  return {
    videos,
    loading,
    saving,
    upsertVideo,
    createVideo,
    deleteVideo,
    reload: load,
  };
}

export function usePublicBeautyVideos() {
  const [videos, setVideos] = useState<BeautyVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("beauty_videos")
        .select("*")
        .eq("published", true)
        .order("position")
        .order("published_at", { ascending: false });

      setVideos(data?.length ? (data as DbBeautyVideo[]).map(dbToBeautyVideo) : []);
      setLoading(false);
    };

    void load();
  }, []);

  return { videos, loading };
}

export async function incrementBeautyVideoViews(videoId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await getSupabase().rpc("increment_beauty_video_views", { p_id: videoId });
  } catch {
    /* non bloquant */
  }
}
