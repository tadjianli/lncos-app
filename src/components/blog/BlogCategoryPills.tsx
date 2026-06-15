"use client";

import { Icon } from "@/components/shared/Icon";
import { BLOG_CATEGORIES } from "@/lib/blog-content";
import type { BlogCategory, BlogCategoryId } from "@/lib/contracts/blog";

interface BlogCategoryOverviewProps {
  categories?: BlogCategory[];
  active?: BlogCategoryId | "all";
  onSelect?: (id: BlogCategoryId) => void;
}

export function BlogCategoryOverview({
  categories = BLOG_CATEGORIES,
  active,
  onSelect,
}: BlogCategoryOverviewProps) {
  const enabled = categories.filter((c) => ("enabled" in c ? (c as { enabled?: boolean }).enabled !== false : true));

  return (
    <div className="blog-categories-grid" role="group" aria-label="Catégories du blog">
      {enabled.map((cat, i) => {
        const selected = active === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            className={`blog-category-tile blog-category-tile--btn${selected ? " blog-category-tile--active" : ""}`}
            style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            onClick={() => onSelect?.(cat.id)}
            aria-pressed={selected}
          >
            <span className="blog-category-tile__icon">
              <Icon name={cat.icon} size={20} color="var(--gold)" />
            </span>
            <div className="blog-category-tile__label">{cat.label}</div>
            <p className="blog-category-tile__desc">{cat.description}</p>
          </button>
        );
      })}
    </div>
  );
}
