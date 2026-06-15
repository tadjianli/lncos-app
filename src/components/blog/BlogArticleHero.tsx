"use client";

import type { BlogArticle, BlogCategory } from "@/lib/contracts/blog";
import { formatBlogDate, getBlogCategory } from "@/lib/blog-content";
import { resolveArticleCoverUrl } from "@/lib/blog-products";
import { usePublicProducts } from "@/lib/client-supabase";
import { Icon } from "@/components/shared/Icon";

interface BlogArticleHeroProps {
  article: BlogArticle;
  categories: BlogCategory[];
}

export function BlogArticleHero({ article, categories }: BlogArticleHeroProps) {
  const { byId } = usePublicProducts();
  const category = getBlogCategory(article.categoryId, categories);
  const coverUrl = resolveArticleCoverUrl(article, byId);

  return (
    <header className="blog-article-hero">
      <div className="blog-article-hero__media">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={article.title}
            className="blog-article-hero__img"
            fetchPriority="high"
          />
        ) : (
          <div className="blog-article-hero__placeholder" aria-hidden>
            <Icon name={category?.icon ?? "sparkle"} size={40} color="var(--gold)" />
          </div>
        )}
        <div className="blog-article-hero__overlay" aria-hidden />
      </div>
      <div className="blog-article-hero__content">
        {category ? (
          <span className="blog-article-hero__cat">{category.label}</span>
        ) : null}
        <h1 className="blog-article-hero__title">{article.title}</h1>
        <div className="blog-article-hero__meta">
          <span>{article.authorName}</span>
          <span aria-hidden>·</span>
          <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{article.readMinutes} min de lecture</span>
        </div>
      </div>
    </header>
  );
}
