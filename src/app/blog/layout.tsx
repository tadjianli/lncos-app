import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Blog beauté — Conseils, tutoriels & tendances",
  description:
    "Blog beauté LN COS : conseils onglerie, vernis semi-permanent, skincare, maquillage et nouveautés. Tutoriels et tendances — La Réunion & France.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    title: "Blog beauté | LN COS",
    description:
      "Conseils beauté, tutoriels ongles, skincare et nouveautés LN COS.",
    url: absoluteUrl("/blog"),
    siteName: "LN COS",
    locale: "fr_FR",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
