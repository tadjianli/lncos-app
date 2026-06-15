"use client";

import { Icon } from "@/components/shared/Icon";
import { BLOG_CATEGORIES } from "@/lib/blog-content";
import type { BlogCategoryId } from "@/lib/contracts/blog";

interface BlogCategoryPillsProps {
  active: BlogCategoryId | "all";
  onChange: (id: BlogCategoryId | "all") => void;
}

export function BlogCategoryPills({ active, onChange }: BlogCategoryPillsProps) {
  const pills: { id: BlogCategoryId | "all"; label: string }[] = [
    { id: "all", label: "Tout" },
    ...BLOG_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
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

export function BlogCategoryOverview() {
  return (
    <div className="blog-categories-grid">
      {BLOG_CATEGORIES.map((cat, i) => (
        <div
          key={cat.id}
          className="blog-category-tile"
          style={{ animationDelay: `${0.1 + i * 0.05}s` }}
        >
          <span className="blog-category-tile__icon">
            <Icon name={cat.icon} size={20} color="var(--gold)" />
          </span>
          <div className="blog-category-tile__label">{cat.label}</div>
          <p className="blog-category-tile__desc">{cat.description}</p>
        </div>
      ))}
    </div>
  );
}
