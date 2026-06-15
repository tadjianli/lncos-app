"use client";

import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { usePublicProducts } from "@/lib/client-supabase";
import type { BlogArticle, BlogCategory } from "@/lib/contracts/blog";
import { getBlogArticlePath } from "@/lib/contracts/blog";
import { formatBlogDate, getBlogCategory } from "@/lib/blog-content";
import { resolveArticleCoverUrl } from "@/lib/blog-products";

interface BlogArticleCardProps {
  article: BlogArticle;
  index?: number;
  categories?: BlogCategory[];
}

export function BlogArticleCard({ article, index = 0, categories }: BlogArticleCardProps) {
  const { byId } = usePublicProducts();
  const category = getBlogCategory(article.categoryId, categories);
  const href = getBlogArticlePath(article.slug);
  const coverUrl = resolveArticleCoverUrl(article, byId);

  return (
    <Link
      href={href}
      className="blog-article-card blog-article-card--link"
      style={{ animationDelay: `${0.08 + index * 0.04}s` }}
    >
      <article>
        <div className="blog-article-card__media">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="blog-article-card__img" loading="lazy" />
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
    </Link>
  );
}
