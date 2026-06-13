import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Prendre rendez-vous | LN COS",
  description: "Réservez votre moment beauté à l'institut LN COS en quelques clics.",
  alternates: { canonical: absoluteUrl("/rdv") },
  openGraph: {
    title: "Prendre rendez-vous | LN COS",
    description: "Institut onglerie & beauté — réservation en ligne.",
    url: absoluteUrl("/rdv"),
  },
};

export default function RdvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
