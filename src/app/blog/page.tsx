"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { Icon } from "@/components/shared/Icon";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import {
  BlogCategoryOverview,
  BlogCategoryPills,
} from "@/components/blog/BlogCategoryPills";
import {
  filterBlogArticlesByCategory,
  getPublishedBlogArticles,
} from "@/lib/blog-content";
import type { BlogCategoryId } from "@/lib/contracts/blog";

export default function BlogPage() {
  const [category, setCategory] = useState<BlogCategoryId | "all">("all");

  const articles = useMemo(() => {
    const published = getPublishedBlogArticles();
    return filterBlogArticlesByCategory(published, category);
  }, [category]);

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18}>
        <header className="blog-hero">
          <div className="blog-hero__glow" aria-hidden />
          <span className="blog-hero__eyebrow">
            <Icon name="edit" size={13} color="var(--gold)" />
            Magazine beauté
          </span>
          <h1 className="blog-hero__title">Blog LN COS</h1>
          <p className="blog-hero__sub">
            Conseils beauté, tutoriels, astuces skincare, tendances et nouveautés — curated by LN COS.
          </p>
        </header>

        <BlogCategoryOverview />

        <div className="blog-section-head">
          <h2 className="blog-section-head__title">Derniers articles</h2>
          <p className="blog-section-head__hint">Publication admin à venir — contenus éditoriaux en preview.</p>
        </div>

        <BlogCategoryPills active={category} onChange={setCategory} />

        {articles.length > 0 ? (
          <div className="blog-articles">
            {articles.map((article, i) => (
              <BlogArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <Icon name="sparkle" size={32} color="var(--gold)" />
            <p>Aucun article dans cette catégorie pour le moment.</p>
          </div>
        )}
      </ScrollRegion>
    </AppShell>
  );
}
