"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { Icon } from "@/components/shared/Icon";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import {
  BlogCategoryOverview,
  BlogCategoryPills,
} from "@/components/blog/BlogCategoryPills";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { PageSectionsView } from "@/components/page/PageSectionsView";
import { usePublicPageSections } from "@/lib/client-supabase";
import { usePublicBlogContent } from "@/lib/content-pages-hooks";
import { filterBlogArticlesByCategory, searchBlogArticles } from "@/lib/blog-content";
import type { BlogCategoryId } from "@/lib/contracts/blog";

export default function BlogPage() {
  const [category, setCategory] = useState<BlogCategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const articlesRef = useRef<HTMLDivElement>(null);
  const { pageSettings, categories, articles, loading: contentLoading } = usePublicBlogContent();
  const { getVisible, loading: sectionsLoading } = usePublicPageSections("blog");

  const filteredArticles = useMemo(() => {
    const byCategory = filterBlogArticlesByCategory(articles, category);
    return searchBlogArticles(byCategory, query);
  }, [articles, category, query]);

  const extraSections = useMemo(
    () =>
      getVisible({ isMobile: true }).filter(
        (s) => s.enabled && s.type !== "hero"
      ),
    [getVisible]
  );

  const loading = contentLoading || sectionsLoading;

  const handleCategoryFromTile = (id: BlogCategoryId) => {
    setCategory(id);
    setQuery("");
    requestAnimationFrame(() => {
      articlesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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

        <BlogCategoryOverview
          categories={categories}
          active={category === "all" ? undefined : category}
          onSelect={handleCategoryFromTile}
        />

        <div className="blog-section-head" ref={articlesRef}>
          <h2 className="blog-section-head__title">{pageSettings.articlesSectionTitle}</h2>
          {pageSettings.articlesSectionHint ? (
            <p className="blog-section-head__hint">{pageSettings.articlesSectionHint}</p>
          ) : null}
        </div>

        <BlogSearch onSearch={setQuery} />

        <BlogCategoryPills categories={categories} active={category} onChange={setCategory} />

        {loading ? (
          <div className="flash-sales-loading" aria-busy="true">
            <div className="flash-sales-loading__bar" />
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="blog-articles">
            {filteredArticles.map((article, i) => (
              <BlogArticleCard
                key={article.id}
                article={article}
                categories={categories}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <Icon name="sparkle" size={32} color="var(--gold)" />
            <p>
              {query.trim()
                ? "Aucun article ne correspond à votre recherche."
                : "Aucun article dans cette catégorie pour le moment."}
            </p>
            {query.trim() ? (
              <button type="button" className="blog-empty__reset" onClick={() => setQuery("")}>
                Effacer la recherche
              </button>
            ) : null}
          </div>
        )}

        {extraSections.length > 0 && <PageSectionsView sections={extraSections} />}
      </ScrollRegion>
    </AppShell>
  );
}
