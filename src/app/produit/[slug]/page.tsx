import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site-url";
import {
  fetchProductBySeoSlug,
  fetchProductReviewsForSchema,
  buildProductPageSchema,
  productMetadata,
} from "@/lib/seo-server";
import { getProductSeoPath } from "@/lib/seo";
import { resolveProductImageFull } from "@/lib/product-catalog";
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
      <article className="product-page-fallback noscroll" style={{ textAlign: "center" }}>
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
  const image = resolveProductImageFull(product);
  const path = getProductSeoPath(product);
  const reviewSnippets = await fetchProductReviewsForSchema(product.id);
  const schemaGraphs = buildProductPageSchema(product, reviewSnippets);

  return (
    <AppShell>
      {schemaGraphs.map((graph, i) => (
        <JsonLd key={i} data={graph} />
      ))}
      <article className="product-page-fallback noscroll">
        <h1 style={{ fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px" }}>
          {title.replace(/ \| LN COS$/, "")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 12px" }}>
          {description}
        </p>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)", margin: "0 0 16px" }}>
          {product.price.toFixed(2)} €
        </p>
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={product.imageAlt ?? product.name}
            style={{ width: "100%", maxWidth: 360, borderRadius: "var(--r-md)", marginBottom: 16 }}
          />
        ) : null}
        <Suspense fallback={null}>
          <ProductPageClient product={product} />
        </Suspense>
        <meta itemProp="url" content={absoluteUrl(path)} />
      </article>
    </AppShell>
  );
}
