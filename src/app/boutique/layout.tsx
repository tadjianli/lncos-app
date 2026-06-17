import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Boutique — Meilleures ventes & catalogue",
  description:
    "Boutique LN COS : vernis semi-permanents, accessoires ongles, maquillage et soins beauté. Meilleures ventes et catalogue complet — livraison La Réunion & France.",
  alternates: { canonical: absoluteUrl("/boutique") },
  openGraph: {
    title: "Boutique | LN COS",
    description: "Vernis semi-permanents, accessoires ongles et cosmétiques premium LN COS.",
    url: absoluteUrl("/boutique"),
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
