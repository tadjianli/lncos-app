"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { HorizontalScrollRow } from "@/components/carousels/HorizontalScrollRow";
import { SectionHead } from "@/components/shared/ActionButtons";
import { BeautyVideoCard } from "@/components/videos/BeautyVideoCard";
import { usePublicBeautyVideos } from "@/lib/beauty-videos-hooks";

interface HomeBeautyVideosSectionProps {
  title?: string;
  subtitle?: string;
  cta?: string;
}

export function HomeBeautyVideosSection({
  title = "🎥 Vidéos Beauté",
  subtitle = "Découvrez nos conseils, démonstrations, nouveautés, routines et astuces beauté en vidéo.",
  cta = "Tout voir",
}: HomeBeautyVideosSectionProps) {
  const router = useRouter();
  const { videos, loading } = usePublicBeautyVideos();

  const featured = useMemo(() => {
    const list = [...videos];
    list.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.position - b.position;
    });
    return list.slice(0, 6);
  }, [videos]);

  if (!loading && featured.length === 0) return null;

  return (
    <div className="home-reels">
      <SectionHead
        title={title}
        subtitle={subtitle}
        action={cta}
        onAction={() => router.push("/videos")}
      />

      {loading ? (
        <div className="flash-sales-loading home-reels-hsc" aria-busy="true">
          <div className="flash-sales-loading__bar" />
        </div>
      ) : (
        <HorizontalScrollRow className="home-reels-hsc" trackClassName="home-reels-row">
          {featured.map((video) => (
            <BeautyVideoCard key={video.id} video={video} featured={video.featured} />
          ))}
        </HorizontalScrollRow>
      )}
    </div>
  );
}
