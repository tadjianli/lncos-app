"use client";

import { Icon } from "@/components/shared/Icon";
import { BLOG_CATEGORIES } from "@/lib/blog-content";
import type { BlogCategory, BlogCategoryId } from "@/lib/contracts/blog";

interface BlogCategoryPillsProps {
  active: BlogCategoryId | "all";
  onChange: (id: BlogCategoryId | "all") => void;
  categories?: BlogCategory[];
}

export function BlogCategoryPills({
  active,
  onChange,
  categories = BLOG_CATEGORIES,
}: BlogCategoryPillsProps) {
  const enabled = categories.filter((c) => ("enabled" in c ? (c as { enabled?: boolean }).enabled !== false : true));
  const pills: { id: BlogCategoryId | "all"; label: string }[] = [
    { id: "all", label: "Tout" },
    ...enabled.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <div className="blog-pills noscroll" role="tablist" aria-label="Catégories du blog">
      {pills.map((pill) => {
        const selected = active === pill.id;
        return (
          <button
            key={pill.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`blog-pill${selected ? " blog-pill--active" : ""}`}
            onClick={() => onChange(pill.id)}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}

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
    <div className="blog-categories-grid">
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
