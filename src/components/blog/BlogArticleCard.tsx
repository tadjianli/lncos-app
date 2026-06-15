"use client";

import { Icon } from "@/components/shared/Icon";
import type { BlogArticle } from "@/lib/contracts/blog";
import { formatBlogDate, getBlogCategory } from "@/lib/blog-content";

interface BlogArticleCardProps {
  article: BlogArticle;
  index?: number;
}

export function BlogArticleCard({ article, index = 0 }: BlogArticleCardProps) {
  const category = getBlogCategory(article.categoryId);

  return (
    <article
      className="blog-article-card"
      style={{ animationDelay: `${0.08 + index * 0.04}s` }}
    >
      <div className="blog-article-card__media">
        {article.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverUrl} alt="" className="blog-article-card__img" />
        ) : (
          <div className="blog-article-card__placeholder" aria-hidden>
            <Icon name={category?.icon ?? "sparkle"} size={28} color="var(--gold)" />
          </div>
        )}
        {article.featured && <span className="blog-article-card__badge">À la une</span>}
      </div>
      <div className="blog-article-card__body">
        {category && (
          <span className="blog-article-card__cat">{category.label}</span>
        )}
        <h3 className="blog-article-card__title">{article.title}</h3>
        <p className="blog-article-card__excerpt">{article.excerpt}</p>
        <div className="blog-article-card__meta">
          <span>{formatBlogDate(article.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{article.readMinutes} min</span>
        </div>
      </div>
    </article>
  );
}
