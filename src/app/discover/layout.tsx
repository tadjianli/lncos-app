import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Discover | LN COS",
  description: "Explorez les nouveautés et sélections LN COS.",
  alternates: { canonical: absoluteUrl("/discover") },
  robots: { index: true, follow: true },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
