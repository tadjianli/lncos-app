"use client";

import type { BeautyVideo } from "@/lib/contracts/beauty-videos";
import { getVideoEmbedUrl, isHostedVideoUrl } from "@/lib/beauty-video-embed";

interface BeautyVideoPlayerProps {
  video: BeautyVideo;
  className?: string;
}

export function BeautyVideoPlayer({ video, className = "" }: BeautyVideoPlayerProps) {
  const embedUrl = getVideoEmbedUrl(video.videoType, video.videoUrl);
  const hosted =
    video.videoType === "hosted" ||
    (video.videoUrl.trim() && isHostedVideoUrl(video.videoUrl));

  if (hosted && video.videoUrl.trim()) {
    return (
      <div className={`beauty-video-player ${className}`.trim()}>
        <video
          src={video.videoUrl}
          controls
          playsInline
          preload="metadata"
          className="beauty-video-player__hosted"
        />
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className={`beauty-video-player beauty-video-player--embed ${className}`.trim()}>
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="beauty-video-player__iframe"
        />
      </div>
    );
  }

  return (
    <div className={`beauty-video-player beauty-video-player--empty ${className}`.trim()}>
      <p>Vidéo indisponible — vérifiez l&apos;URL dans l&apos;administration.</p>
    </div>
  );
}
