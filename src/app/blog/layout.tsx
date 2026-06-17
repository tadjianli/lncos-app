import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { formatPageTitle, getAppName, pageSeo } from "@/lib/branding";

const seo = pageSeo("blog");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    title: formatPageTitle("Blog"),
    description: seo.description,
    url: absoluteUrl("/blog"),
    siteName: getAppName(),
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
