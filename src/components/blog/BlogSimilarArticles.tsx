"use client";

import Link from "next/link";
import type { BlogArticle, BlogCategory } from "@/lib/contracts/blog";
import { getBlogArticlePath } from "@/lib/contracts/blog";
import { BlogArticleCard } from "./BlogArticleCard";

interface BlogSimilarArticlesProps {
  articles: BlogArticle[];
  categories: BlogCategory[];
}

export function BlogSimilarArticles({ articles, categories }: BlogSimilarArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="blog-similar" aria-labelledby="blog-similar-title">
      <h2 id="blog-similar-title" className="blog-article-section__title">
        Articles similaires
      </h2>
      <div className="blog-articles blog-articles--compact">
        {articles.map((article, i) => (
          <BlogArticleCard
            key={article.id}
            article={article}
            categories={categories}
            index={i}
          />
        ))}
      </div>
      <Link href="/blog" className="blog-similar__cta">
        Voir tous les articles
      </Link>
    </section>
  );
}
