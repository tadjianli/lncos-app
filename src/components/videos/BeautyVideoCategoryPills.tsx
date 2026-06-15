"use client";

import type { BeautyVideoCategory } from "@/lib/contracts/beauty-videos";
import { BEAUTY_VIDEO_CATEGORIES } from "@/lib/contracts/beauty-videos";

interface BeautyVideoCategoryPillsProps {
  active: BeautyVideoCategory | "all";
  onChange: (category: BeautyVideoCategory | "all") => void;
}

const FILTER_CATEGORIES = BEAUTY_VIDEO_CATEGORIES.filter(
  (c) => c.id === "all" || c.filterLabel
);

export function BeautyVideoCategoryPills({ active, onChange }: BeautyVideoCategoryPillsProps) {
  return (
    <div className="beauty-videos-pills" role="tablist" aria-label="Filtrer par catégorie">
      {FILTER_CATEGORIES.map((cat) => {
        const id = cat.id as BeautyVideoCategory | "all";
        const label = cat.filterLabel ?? cat.label;
        const isActive = active === id;

        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`beauty-videos-pill${isActive ? " beauty-videos-pill--active" : ""}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
