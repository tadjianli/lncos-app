import type { Metadata } from "next";
import { pageSeo } from "@/lib/branding";

const seo = pageSeo("rdv");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  openGraph: {
    title: seo.title,
    description: seo.description,
  },
};

export default function RdvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
