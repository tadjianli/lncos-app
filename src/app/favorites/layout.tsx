import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favoris | LN COS",
  robots: { index: false, follow: false },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
