import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HOME_SEO_DESCRIPTION,
  HOME_SEO_TITLE,
  SITE_KEYWORDS,
  buildHomePageSchemaGraph,
} from "@/lib/seo-site";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";
import { branding, getAppName } from "@/lib/branding";

export const metadata: Metadata = {
  title: HOME_SEO_TITLE,
  description: HOME_SEO_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    locale: branding.locale.replace("-", "_"),
    url: absoluteUrl("/"),
    siteName: getAppName(),
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(branding.icons.icon512),
        width: 512,
        height: 512,
        alt: getAppName(),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
    images: [absoluteUrl(branding.icons.icon512)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  other: {
    "geo.region": "FR-RE",
    "geo.placename": "Saint-Louis, La Réunion",
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={buildHomePageSchemaGraph()} />
      {children}
    </>
  );
}
