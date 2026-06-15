"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { BlogCategoryOverview } from "@/components/blog/BlogCategoryPills";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { usePublicBlogContent } from "@/lib/content-pages-hooks";
import {
  filterBlogArticlesByCategory,
  searchBlogArticles,
} from "@/lib/blog-content";
import type { BlogCategoryId } from "@/lib/contracts/blog";

const HOME_JOURNAL_ARTICLE_LIMIT = 4;

interface BlogJournalSectionProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  cta?: string;
}

export function BlogJournalSection({
  title = "LE JOURNAL BEAUTÉ LN COS",
  subtitle = "Conseils, tutoriels et tendances curated by LN COS.",
  eyebrow = "Magazine",
  cta = "Voir tous les articles",
}: BlogJournalSectionProps) {
  const [category, setCategory] = useState<BlogCategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const { articles, categories, loading } = usePublicBlogContent();

  const filtered = useMemo(() => {
    const byCategory = filterBlogArticlesByCategory(articles, category);
    return searchBlogArticles(byCategory, query);
  }, [articles, category, query]);

  const latest = useMemo(
    () => filtered.slice(0, HOME_JOURNAL_ARTICLE_LIMIT),
    [filtered]
  );

  if (!loading && articles.length === 0) return null;

  return (
    <section className="blog-journal" aria-labelledby="blog-journal-title">
      <div className="blog-journal__head">
        <span className="blog-journal__eyebrow">
          <Icon name="edit" size={13} color="var(--gold)" />
          {eyebrow}
        </span>
        <h2 id="blog-journal-title" className="blog-journal__title">
          {title}
        </h2>
        {subtitle ? <p className="blog-journal__sub">{subtitle}</p> : null}
      </div>

      <BlogCategoryOverview
        categories={categories}
        active={category === "all" ? undefined : category}
        onSelect={(id) => setCategory((prev) => (prev === id ? "all" : id))}
      />

      <BlogSearch onSearch={setQuery} />

      {loading ? (
        <div className="flash-sales-loading" aria-busy="true">
          <div className="flash-sales-loading__bar" />
        </div>
      ) : latest.length === 0 ? (
        <p className="blog-journal__empty">Aucun article ne correspond à votre recherche.</p>
      ) : (
        <div className="blog-articles blog-articles--journal">
          {latest.map((article, i) => (
            <BlogArticleCard
              key={article.id}
              article={article}
              categories={categories}
              index={i}
            />
          ))}
        </div>
      )}

      <Link href="/blog" className="blog-journal__cta">
        {cta}
        <Icon name="arrowR" size={16} />
      </Link>
    </section>
  );
}
