import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { formatPageTitle, getAppName, pageSeo } from "@/lib/branding";

const seo = pageSeo("boutique");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: absoluteUrl("/boutique") },
  openGraph: {
    title: formatPageTitle("Boutique"),
    description: seo.description,
    url: absoluteUrl("/boutique"),
    siteName: getAppName(),
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
