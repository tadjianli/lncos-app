import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Nouveautés",
  description:
    "Découvrez les nouveautés LN COS : lancements vernis semi-permanents, accessoires ongles, maquillage et soins beauté à La Réunion.",
  alternates: { canonical: absoluteUrl("/discover") },
  openGraph: {
    title: "Nouveautés | LN COS",
    description: "Dernières nouveautés beauté et cosmétiques LN COS.",
    url: absoluteUrl("/discover"),
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
