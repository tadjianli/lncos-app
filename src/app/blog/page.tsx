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
import { PageSectionsView } from "@/components/page/PageSectionsView";
import { usePublicPageSections } from "@/lib/client-supabase";
import { usePublicBlogContent } from "@/lib/content-pages-hooks";
import { filterBlogArticlesByCategory } from "@/lib/blog-content";
import type { BlogCategoryId } from "@/lib/contracts/blog";

export default function BlogPage() {
  const [category, setCategory] = useState<BlogCategoryId | "all">("all");
  const { pageSettings, categories, articles, loading: contentLoading } = usePublicBlogContent();
  const { getVisible, loading: sectionsLoading } = usePublicPageSections("blog");

  const filteredArticles = useMemo(
    () => filterBlogArticlesByCategory(articles, category),
    [articles, category]
  );

  const extraSections = useMemo(
    () =>
      getVisible({ isMobile: true }).filter(
        (s) => s.enabled && s.type !== "hero"
      ),
    [getVisible]
  );

  const loading = contentLoading || sectionsLoading;

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18}>
        <header className="blog-hero">
          <div className="blog-hero__glow" aria-hidden />
          <span className="blog-hero__eyebrow">
            <Icon name="edit" size={13} color="var(--gold)" />
            {pageSettings.heroEyebrow}
          </span>
          <h1 className="blog-hero__title">{pageSettings.heroTitle}</h1>
          <p className="blog-hero__sub">{pageSettings.heroSubtitle}</p>
        </header>

        <BlogCategoryOverview categories={categories} />

        <div className="blog-section-head">
          <h2 className="blog-section-head__title">{pageSettings.articlesSectionTitle}</h2>
          {pageSettings.articlesSectionHint ? (
            <p className="blog-section-head__hint">{pageSettings.articlesSectionHint}</p>
          ) : null}
        </div>

        <BlogCategoryPills categories={categories} active={category} onChange={setCategory} />

        {loading ? (
          <div className="flash-sales-loading" aria-busy="true">
            <div className="flash-sales-loading__bar" />
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="blog-articles">
            {filteredArticles.map((article, i) => (
              <BlogArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <Icon name="sparkle" size={32} color="var(--gold)" />
            <p>Aucun article dans cette catégorie pour le moment.</p>
          </div>
        )}

        {extraSections.length > 0 && <PageSectionsView sections={extraSections} />}
      </ScrollRegion>
    </AppShell>
  );
}
