import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import {
  blogArticleMetadata,
  fetchBlogArticleBySlug,
  fetchBlogCategories,
  fetchPublishedBlogArticles,
  findBlogCategory,
  getSimilarArticles,
  resolveArticleCoverUrlServer,
} from "@/lib/blog-server";
import { absoluteUrl } from "@/lib/site-url";
import { getBlogArticlePath } from "@/lib/contracts/blog";
import { BlogArticlePageClient } from "./BlogArticlePageClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).trim();
  const [article, categories] = await Promise.all([
    fetchBlogArticleBySlug(normalizedSlug),
    fetchBlogCategories(),
  ]);
  if (!article) return { title: "Article introuvable | LN COS" };

  const category = findBlogCategory(categories, article.categoryId);
  const { title, description, canonical, image } = await blogArticleMetadata(
    article,
    category?.label
  );

  return {
    title,
    description,
    alternates: { canonical },
    keywords: article.seoKeyword ?? undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "LN COS",
      locale: "fr_FR",
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.authorName],
      ...(image ? { images: [{ url: image, alt: article.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

function ArticleNotFoundView({ slug }: { slug: string }) {
  return (
    <AppShell>
      <article className="blog-empty" style={{ marginTop: 40 }}>
        <h1 style={{ fontSize: "var(--fs-h2)", fontWeight: 700, marginBottom: 12 }}>
          Article introuvable
        </h1>
        <p style={{ marginBottom: 20 }}>
          Aucun article ne correspond à « {slug} ».
        </p>
        <Link href="/blog" className="blog-journal__cta">
          Retour au blog
        </Link>
      </article>
    </AppShell>
  );
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).trim();

  const [article, categories, allArticles] = await Promise.all([
    fetchBlogArticleBySlug(normalizedSlug),
    fetchBlogCategories(),
    fetchPublishedBlogArticles(),
  ]);

  if (!article) {
    return <ArticleNotFoundView slug={normalizedSlug} />;
  }

  const similar = getSimilarArticles(article, allArticles, 3);
  const shareUrl = absoluteUrl(getBlogArticlePath(article.slug));
  const coverUrl = await resolveArticleCoverUrlServer(article);

  return (
    <>
      <BlogArticleJsonLd article={article} categories={categories} coverUrl={coverUrl} />
      <BlogArticlePageClient
        article={article}
        categories={categories}
        similar={similar}
        shareUrl={shareUrl}
      />
    </>
  );
}
