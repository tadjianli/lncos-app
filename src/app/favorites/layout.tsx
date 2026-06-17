import type { Metadata } from "next";
import { pageSeo } from "@/lib/branding";

export const metadata: Metadata = {
  title: pageSeo("favorites").title,
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
