/**
 * LN COS — Schema.org Product + FAQ (données structurées SEO)
 */

import { absoluteUrl } from "@/lib/site-url";
import { getProductSeoPath } from "@/lib/seo-core";
import type { ProductExtraSection } from "@/lib/product-sections";

export interface ProductSchemaInput {
  id: string;
  name: string;
  desc?: string;
  seoExcerpt?: string | null;
  metaDescription?: string | null;
  seoKeyword?: string | null;
  seoSecondaryKeywords?: string[] | null;
  seoSlug?: string | null;
  imageAlt?: string | null;
  price: number;
  stock: number;
  rating: number;
  reviews: number;
  mainImageUrl?: string | null;
  imageUrl?: string | null;
  galleryImages?: string[];
  extraSections?: ProductExtraSection[];
}

export interface ProductReviewSchemaInput {
  authorName: string;
  rating: number;
  body: string;
  title?: string;
  verified?: boolean;
  date?: string;
}

function resolveImages(product: ProductSchemaInput): string[] {
  const urls = [
    product.mainImageUrl,
    product.imageUrl,
    ...(product.galleryImages ?? []),
  ]
    .filter((u): u is string => Boolean(u?.trim()))
    .map((u) => (u.startsWith("http") ? u : absoluteUrl(u)));

  return [...new Set(urls)];
}

function extractFaqFromSections(sections?: ProductExtraSection[]): { question: string; answer: string }[] {
  const faqSection = sections?.find(
    (s) => s.enabled && s.id.startsWith("seo-faq-") && s.type === "list"
  );
  if (!faqSection?.items?.length) return [];

  return faqSection.items
    .map((item) => {
      const qMatch = item.match(/^(.+?\?)\s*([\s\S]*)$/);
      if (qMatch) {
        return { question: qMatch[1].trim(), answer: qMatch[2].trim() || item.trim() };
      }
      const parts = item.split("? ");
      if (parts.length >= 2) {
        return { question: `${parts[0]}?`, answer: parts.slice(1).join("? ").trim() };
      }
      return null;
    })
    .filter((x): x is { question: string; answer: string } => Boolean(x?.question && x?.answer));
}

export function buildProductSchemaOrg(
  product: ProductSchemaInput,
  reviewSnippets: ProductReviewSchemaInput[] = []
): Record<string, unknown>[] {
  const path = getProductSeoPath({ seoSlug: product.seoSlug, name: product.name, id: product.id });
  const url = absoluteUrl(path);
  const images = resolveImages(product);
  const description =
    product.metaDescription?.trim() ||
    product.seoExcerpt?.trim() ||
    product.desc?.trim().slice(0, 500) ||
    product.name;

  const keywords = [
    product.seoKeyword?.trim(),
    ...(product.seoSecondaryKeywords ?? []),
  ].filter((k): k is string => Boolean(k?.trim()));

  const productNode: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description,
    sku: product.id,
    url,
    brand: { "@type": "Brand", name: "LN COS" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "LN COS" },
    },
  };

  if (images.length > 0) {
    productNode.image = images.length === 1 ? images[0] : images;
  }

  if (product.imageAlt?.trim()) {
    productNode.alternateName = product.imageAlt.trim();
  }

  if (keywords.length > 0) {
    productNode.keywords = keywords.join(", ");
  }

  const reviewCount = product.reviews > 0 ? product.reviews : reviewSnippets.length;
  const ratingValue =
    product.rating > 0
      ? product.rating
      : reviewSnippets.length
        ? reviewSnippets.reduce((s, r) => s + r.rating, 0) / reviewSnippets.length
        : 0;

  if (reviewCount > 0 && ratingValue > 0) {
    productNode.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const schemaReviews = reviewSnippets.slice(0, 5).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.authorName || "Cliente LN COS" },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: r.body.trim(),
    ...(r.title?.trim() ? { name: r.title.trim() } : {}),
    ...(r.date ? { datePublished: r.date } : {}),
  }));

  if (schemaReviews.length > 0) {
    productNode.review = schemaReviews;
  }

  const graphs: Record<string, unknown>[] = [productNode];

  const faqItems = extractFaqFromSections(product.extraSections);
  if (faqItems.length > 0) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return graphs;
}
