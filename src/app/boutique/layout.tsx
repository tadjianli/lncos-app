import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Boutique | LN COS",
  description: "Découvrez la boutique LN COS — cosmétiques premium formulés en France.",
  alternates: { canonical: absoluteUrl("/boutique") },
  openGraph: {
    title: "Boutique | LN COS",
    description: "Cosmétiques premium formulés en France.",
    url: absoluteUrl("/boutique"),
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
