import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site-url";
import {
  fetchProductBySeoSlug,
  productMetadata,
} from "@/lib/seo-server";
import { getProductSeoPath } from "@/lib/seo";
import { resolveProductImage } from "@/lib/product-catalog";
import { ProductPageClient } from "./ProductPageClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const normalizedSlug = decodeURIComponent(slug).trim();
  const product = await fetchProductBySeoSlug(normalizedSlug, { preview: sp.preview === "1" });
  if (!product) return { title: "Produit introuvable | LN COS" };

  const { title, description, canonical, image } = productMetadata(product);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "LN COS",
      locale: "fr_FR",
      type: "website" as const,
      ...(image ? { images: [{ url: image, alt: product.imageAlt ?? product.name }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: sp.preview === "1" ? { index: false, follow: false } : { index: true, follow: true },
  };
}

function ProductNotFoundView({ slug }: { slug: string }) {
  return (
    <AppShell>
      <article
        className="noscroll"
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          padding: "48px 18px 32px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--ink)", margin: "0 0 12px" }}>
          Produit introuvable
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 20px" }}>
          Aucun produit ne correspond à « {slug} ».
        </p>
        <Link
          href="/boutique"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: "var(--r-md)",
            background: "var(--gold)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Retour à la boutique
        </Link>
      </article>
    </AppShell>
  );
}

export default async function ProduitPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const normalizedSlug = decodeURIComponent(slug).trim();
  const product = await fetchProductBySeoSlug(normalizedSlug, { preview: sp.preview === "1" });
  if (!product) return <ProductNotFoundView slug={normalizedSlug} />;

  const { title, description, canonical } = productMetadata(product);
  const image = resolveProductImage(product);
  const path = getProductSeoPath(product);

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription || product.desc || description,
    image: image.startsWith("http") ? image : absoluteUrl(image),
    sku: product.id,
    brand: { "@type": "Brand", name: "LN COS" },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "LN COS" },
    },
  };

  if (product.reviews > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    };
  }

  return (
    <AppShell>
      <JsonLd data={productJsonLd} />
      <article
        className="noscroll"
        style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "16px 18px 32px" }}
      >
        <h1 style={{ fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px" }}>
          {title.replace(/ \| LN COS$/, "")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 12px" }}>
          {description}
        </p>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)", margin: "0 0 16px" }}>
          {product.price.toFixed(2)} €
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.imageAlt ?? product.name}
          style={{ width: "100%", maxWidth: 360, borderRadius: "var(--r-md)", marginBottom: 16 }}
        />
        <Suspense fallback={null}>
          <ProductPageClient product={product} />
        </Suspense>
        <link rel="canonical" href={canonical} />
        <meta itemProp="url" content={absoluteUrl(path)} />
      </article>
    </AppShell>
  );
}
