"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import type { BeautyVideo } from "@/lib/contracts/beauty-videos";
import { getBeautyVideoPath } from "@/lib/contracts/beauty-videos";
import {
  formatVideoCount,
  getBeautyVideoCategoryLabel,
} from "@/lib/beauty-videos";
import { usePublicProducts } from "@/lib/client-supabase";
import { resolveArticleCoverUrl } from "@/lib/blog-products";

interface BeautyVideoCardProps {
  video: BeautyVideo;
  className?: string;
  featured?: boolean;
}

export function BeautyVideoCard({ video, className = "", featured }: BeautyVideoCardProps) {
  const { byId } = usePublicProducts();

  const thumbnail = useMemo(
    () =>
      resolveArticleCoverUrl(
        { coverUrl: video.thumbnailUrl, relatedProductIds: video.relatedProductIds },
        byId
      ),
    [video.thumbnailUrl, video.relatedProductIds, byId]
  );

  const categoryLabel = getBeautyVideoCategoryLabel(video.category);
  const path = getBeautyVideoPath(video.slug);

  return (
    <Link
      href={path}
      className={`reel-card reel-card--fill snap beauty-video-card ${className}`.trim()}
      aria-label={`Lire la vidéo : ${video.title}`}
    >
      <div className="reel-bg">
        {thumbnail ? (
          <FadeImage
            src={thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 480px) 42vw, 158px"
            style={{ objectFit: "cover" }}
            fallbackLabel={video.title}
          />
        ) : (
          <ProductImagePlaceholder label={video.title} />
        )}
      </div>

      <div className="beauty-video-card__shade" aria-hidden />

      {featured ? (
        <span className="beauty-video-card__featured" aria-label="À la une">
          <Icon name="star" size={10} color="var(--gold)" fill="var(--gold)" />
        </span>
      ) : null}

      <span className="reel-tag">#{categoryLabel}</span>

      <span className="reel-play" aria-hidden>
        <Icon name="play" size={15} color="#fff" fill="#fff" />
      </span>

      <div className="reel-meta">
        <div className="reel-title">{video.title}</div>
        <div className="reel-stats">
          <span className="reel-stat">
            <Icon name="eye" size={11} color="#fff" />
            {formatVideoCount(video.views)}
          </span>
          <span className="reel-stat">
            <Icon name="heart" size={11} color="var(--pink)" fill="var(--pink)" />
            {formatVideoCount(video.likes)}
          </span>
        </div>
      </div>
    </Link>
  );
}
