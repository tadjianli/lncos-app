import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { SeoPageHeader } from "@/components/layout/SeoPageHeader";
import { CategoryProductsView } from "@/components/commerce/CategoryProductsView";
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
      <ScrollRegion variant="page" insetX={18} padBottom={false}>
        <p style={{ fontSize: 14, color: "var(--ink-mute)", margin: "0 0 20px", lineHeight: 1.5 }}>
          {description}
        </p>
        <CategoryProductsView
          products={products}
          variant="category"
          bottomClearance={false}
          emptyTitle="Aucun produit disponible"
          emptyMessage={`Aucun produit dans la catégorie « ${category.name} » pour le moment.`}
        />
      </ScrollRegion>
    </AppShell>
  );
}
