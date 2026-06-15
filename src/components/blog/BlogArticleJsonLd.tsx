import type { BlogArticle, BlogCategory, BlogFaqItem } from "@/lib/contracts/blog";
import { getBlogArticlePath } from "@/lib/contracts/blog";
import { absoluteUrl } from "@/lib/site-url";
import { getBlogCategory } from "@/lib/blog-content";

interface BlogArticleJsonLdProps {
  article: BlogArticle;
  categories: BlogCategory[];
  coverUrl?: string | null;
}

export function BlogArticleJsonLd({ article, categories, coverUrl }: BlogArticleJsonLdProps) {
  const category = getBlogCategory(article.categoryId, categories);
  const url = absoluteUrl(getBlogArticlePath(article.slug));
  const image = coverUrl ?? article.coverUrl ?? undefined;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDescription ?? article.excerpt,
      image: image ? [image] : undefined,
      datePublished: article.publishedAt,
      author: {
        "@type": "Person",
        name: article.authorName,
      },
      publisher: {
        "@type": "Organization",
        name: "LN COS",
        url: absoluteUrl("/"),
      },
      mainEntityOfPage: url,
      url,
      articleSection: category?.label,
      keywords: article.seoKeyword ?? undefined,
    },
    {
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription ?? article.excerpt,
      image: image ?? undefined,
      datePublished: article.publishedAt,
      author: { "@type": "Person", name: article.authorName },
      publisher: { "@type": "Organization", name: "LN COS" },
      mainEntityOfPage: url,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
        ...(category
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: category.label,
                item: absoluteUrl(`/blog?cat=${category.id}`),
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: category ? 4 : 3,
          name: article.title,
          item: url,
        },
      ],
    },
  ];

  if (article.faq.length > 0) {
    graph.push(buildFaqSchema(article.faq));
  }

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

function buildFaqSchema(faq: BlogFaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
