"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { HorizontalScrollRow } from "@/components/carousels/HorizontalScrollRow";
import { Icon } from "@/components/shared/Icon";
import { BeautyVideoCard } from "@/components/videos/BeautyVideoCard";
import { BeautyVideoCategoryPills } from "@/components/videos/BeautyVideoCategoryPills";
import { usePublicBeautyVideos } from "@/lib/beauty-videos-hooks";
import { filterBeautyVideosByCategory } from "@/lib/beauty-videos";
import type { BeautyVideoCategory } from "@/lib/contracts/beauty-videos";

export default function VideosPage() {
  const [category, setCategory] = useState<BeautyVideoCategory | "all">("all");
  const { videos, loading } = usePublicBeautyVideos();

  const filtered = useMemo(
    () => filterBeautyVideosByCategory(videos, category),
    [videos, category]
  );

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18}>
        <header className="beauty-videos-hero">
          <div className="beauty-videos-hero__glow" aria-hidden />
          <span className="beauty-videos-hero__eyebrow">
            <Icon name="play" size={13} color="var(--gold)" />
            Shorts beauté
          </span>
          <h1 className="beauty-videos-hero__title">🎥 Vidéos Beauté</h1>
          <p className="beauty-videos-hero__sub">
            Découvrez nos conseils, démonstrations, nouveautés, routines et astuces beauté en vidéo.
          </p>
        </header>

        <BeautyVideoCategoryPills active={category} onChange={setCategory} />

        {loading ? (
          <div className="flash-sales-loading" aria-busy="true">
            <div className="flash-sales-loading__bar" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="beauty-videos-empty">
            <p>Aucune vidéo dans cette catégorie pour le moment.</p>
            <button type="button" className="beauty-videos-empty__link" onClick={() => setCategory("all")}>
              Voir toutes les vidéos
            </button>
          </div>
        ) : (
          <HorizontalScrollRow
            className="beauty-videos-grid-hsc"
            trackClassName="beauty-videos-grid"
          >
            {filtered.map((video) => (
              <BeautyVideoCard
                key={video.id}
                video={video}
                featured={video.featured}
                className="beauty-videos-grid__card"
              />
            ))}
          </HorizontalScrollRow>
        )}
      </ScrollRegion>
    </AppShell>
  );
}
