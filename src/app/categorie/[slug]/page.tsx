import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SeoPageHeader } from "@/components/layout/SeoPageHeader";
import { CategoryProductGrid } from "@/components/commerce/CategoryProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site-url";
import {
  categoryMetadata,
  fetchCategoryBySeoSlug,
  fetchProductsByCategory,
} from "@/lib/seo-server";
import { getCategorySeoPath, getProductSeoPath } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySeoSlug(slug);
  if (!category) return { title: "Catégorie introuvable | LN COS" };

  const { title, description, canonical } = categoryMetadata(category);

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
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function CategoriePage({ params }: Props) {
  const { slug } = await params;
  const category = await fetchCategoryBySeoSlug(slug);
  if (!category) notFound();

  const products = await fetchProductsByCategory(category.id);
  const { title, description, canonical } = categoryMetadata(category);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description,
    url: canonical,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(getProductSeoPath(p)),
        name: p.name,
      })),
    },
  };

  return (
    <AppShell>
      <JsonLd data={collectionJsonLd} />
      <SeoPageHeader title={category.name} backHref="/discover" />
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "0 18px 32px" }}>
        <p style={{ fontSize: 14, color: "var(--ink-mute)", margin: "0 0 20px", lineHeight: 1.5 }}>
          {description}
        </p>
        <CategoryProductGrid products={products} />
        {products.length === 0 && (
          <p style={{ color: "var(--ink-mute)", fontSize: 14 }}>Aucun produit dans cette catégorie.</p>
        )}
      </div>
    </AppShell>
  );
}
