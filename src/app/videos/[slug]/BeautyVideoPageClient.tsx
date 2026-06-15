"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { Icon } from "@/components/shared/Icon";
import { BeautyVideoPlayer } from "@/components/videos/BeautyVideoPlayer";
import { BeautyVideoProducts } from "@/components/videos/BeautyVideoProducts";
import { BeautyVideoShareBar } from "@/components/videos/BeautyVideoShareBar";
import type { BeautyVideo } from "@/lib/contracts/beauty-videos";
import { getBeautyVideoCategoryLabel, formatVideoCount } from "@/lib/beauty-videos";
import { incrementBeautyVideoViews } from "@/lib/beauty-videos-hooks";
import { absoluteUrl } from "@/lib/site-url";
import { getBeautyVideoPath } from "@/lib/contracts/beauty-videos";

interface BeautyVideoPageClientProps {
  video: BeautyVideo;
}

function formatPublishedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function BeautyVideoPageClient({ video }: BeautyVideoPageClientProps) {
  useEffect(() => {
    void incrementBeautyVideoViews(video.id);
  }, [video.id]);

  const shareUrl = absoluteUrl(getBeautyVideoPath(video.slug));
  const categoryLabel = getBeautyVideoCategoryLabel(video.category);

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18}>
        <Link href="/videos" className="beauty-video-back">
          <Icon name="chevL" size={16} />
          Toutes les vidéos
        </Link>

        <article className="beauty-video-detail">
          <BeautyVideoPlayer video={video} />

          <header className="beauty-video-detail__head">
            <span className="beauty-video-detail__category">{categoryLabel}</span>
            <h1 className="beauty-video-detail__title">{video.title}</h1>
            <div className="beauty-video-detail__meta">
              <span>
                <Icon name="calendar" size={13} />
                {formatPublishedDate(video.publishedAt)}
              </span>
              <span>
                <Icon name="eye" size={13} />
                {formatVideoCount(video.views)} vues
              </span>
              <span>
                <Icon name="heart" size={13} color="var(--pink)" fill="var(--pink)" />
                {formatVideoCount(video.likes)}
              </span>
            </div>
          </header>

          {video.description ? (
            <p className="beauty-video-detail__desc">{video.description}</p>
          ) : null}

          <BeautyVideoShareBar title={video.title} url={shareUrl} />

          <BeautyVideoProducts productIds={video.relatedProductIds} />
        </article>
      </ScrollRegion>
    </AppShell>
  );
}
