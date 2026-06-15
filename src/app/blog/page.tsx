"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Icon } from "@/components/shared/Icon";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { BlogCategoryOverview } from "@/components/blog/BlogCategoryPills";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { usePublicBlogContent } from "@/lib/content-pages-hooks";
import { filterBlogArticlesByCategory, searchBlogArticles } from "@/lib/blog-content";
import type { BlogCategoryId } from "@/lib/contracts/blog";

export default function BlogPage() {
  const [category, setCategory] = useState<BlogCategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const articlesRef = useRef<HTMLDivElement>(null);
  const { pageSettings, categories, articles, loading: contentLoading } = usePublicBlogContent();

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("cat");
    if (!cat) return;
    const valid = categories.some((c) => c.id === cat);
    if (valid) setCategory(cat);
  }, [categories]);

  const filteredArticles = useMemo(() => {
    const byCategory = filterBlogArticlesByCategory(articles, category);
    return searchBlogArticles(byCategory, query);
  }, [articles, category, query]);

  const handleCategoryFromTile = (id: BlogCategoryId) => {
    setCategory((prev) => (prev === id ? "all" : id));
    setQuery("");
    requestAnimationFrame(() => {
      articlesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <PageLayout title="Blog LN COS" backHref="/">
      <header className="blog-hero blog-hero--compact">
        <div className="blog-hero__glow" aria-hidden />
        <span className="blog-hero__eyebrow">
          <Icon name="edit" size={13} color="var(--gold)" />
          {pageSettings.heroEyebrow}
        </span>
        <p className="blog-hero__sub">{pageSettings.heroSubtitle}</p>
      </header>

      <BlogCategoryOverview
        categories={categories}
        active={category === "all" ? undefined : category}
        onSelect={handleCategoryFromTile}
      />

      <BlogSearch onSearch={setQuery} />

      {contentLoading ? (
        <div className="flash-sales-loading" aria-busy="true">
          <div className="flash-sales-loading__bar" />
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="blog-articles" ref={articlesRef}>
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
        <div className="blog-empty" ref={articlesRef}>
          <Icon name="sparkle" size={32} color="var(--gold)" />
          <p>
            {query.trim()
              ? "Aucun article ne correspond à votre recherche."
              : category !== "all"
                ? "Aucun article dans cette catégorie pour le moment."
                : "Aucun article pour le moment."}
          </p>
          {query.trim() ? (
            <button type="button" className="blog-empty__reset" onClick={() => setQuery("")}>
              Effacer la recherche
            </button>
          ) : category !== "all" ? (
            <button type="button" className="blog-empty__reset" onClick={() => setCategory("all")}>
              Voir tous les articles
            </button>
          ) : null}
        </div>
      )}
    </PageLayout>
  );
}
