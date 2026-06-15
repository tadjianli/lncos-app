"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { Icon } from "@/components/shared/Icon";
import { BlogArticleHero } from "@/components/blog/BlogArticleHero";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { BlogShareBar } from "@/components/blog/BlogShareBar";
import { BlogArticleFaq } from "@/components/blog/BlogArticleFaq";
import { BlogRelatedProducts } from "@/components/blog/BlogRelatedProducts";
import { BlogSimilarArticles } from "@/components/blog/BlogSimilarArticles";
import type { BlogArticle, BlogCategory } from "@/lib/contracts/blog";

interface BlogArticlePageClientProps {
  article: BlogArticle;
  categories: BlogCategory[];
  similar: BlogArticle[];
  shareUrl: string;
}

export function BlogArticlePageClient({
  article,
  categories,
  similar,
  shareUrl,
}: BlogArticlePageClientProps) {
  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18}>
        <nav className="blog-article-nav" aria-label="Fil d'Ariane">
          <Link href="/blog" className="blog-article-nav__back">
            <Icon name="chevL" size={16} />
            Blog LN COS
          </Link>
        </nav>

        <BlogArticleHero article={article} categories={categories} />

        <div className="blog-article-lead">
          <p className="blog-article-lead__excerpt">{article.excerpt}</p>
        </div>

        <BlogContentRenderer blocks={article.body} title={article.title} />

        <BlogArticleFaq items={article.faq} />

        <BlogRelatedProducts productIds={article.relatedProductIds} />

        <BlogShareBar title={article.title} url={shareUrl} />

        <BlogSimilarArticles articles={similar} categories={categories} />
      </ScrollRegion>
    </AppShell>
  );
}
