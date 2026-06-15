"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/shared/Icon";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { usePublicBlogContent } from "@/lib/content-pages-hooks";

const HOME_JOURNAL_ARTICLE_LIMIT = 2;

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
  const { articles, categories, loading } = usePublicBlogContent();

  const latest = useMemo(
    () => articles.slice(0, HOME_JOURNAL_ARTICLE_LIMIT),
    [articles]
  );

  if (!loading && latest.length === 0) return null;

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

      {loading ? (
        <div className="flash-sales-loading" aria-busy="true">
          <div className="flash-sales-loading__bar" />
        </div>
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
