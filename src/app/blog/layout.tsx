import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Blog LN COS | Conseils beauté, skincare & tutoriels",
  description:
    "Magazine beauté LN COS : conseils beauté, tutoriels, astuces skincare, tendances et nouveautés — curated by LN COS.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    title: "Blog LN COS",
    description:
      "Conseils beauté, tutoriels, astuces skincare, tendances et nouveautés LN COS.",
    url: absoluteUrl("/blog"),
    siteName: "LN COS",
    locale: "fr_FR",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
