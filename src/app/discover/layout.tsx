import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { formatPageTitle, getAppName, pageSeo } from "@/lib/branding";

const seo = pageSeo("discover");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: absoluteUrl("/discover") },
  openGraph: {
    title: formatPageTitle("Nouveautés"),
    description: seo.description,
    url: absoluteUrl("/discover"),
    siteName: getAppName(),
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
