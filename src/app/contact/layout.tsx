import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez LN COS — questions commandes, produits beauté, vernis semi-permanents et accessoires ongles. Réponse sous 24 à 48 h. La Réunion & France.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: "Contact | LN COS",
    description: "Contactez l'équipe LN COS — La Réunion & France.",
    url: absoluteUrl("/contact"),
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
