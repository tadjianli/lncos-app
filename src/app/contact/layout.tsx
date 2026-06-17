import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { formatPageTitle, getAppName, pageSeo } from "@/lib/branding";

const seo = pageSeo("contact");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: formatPageTitle("Contact"),
    description: seo.description,
    url: absoluteUrl("/contact"),
    siteName: getAppName(),
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
