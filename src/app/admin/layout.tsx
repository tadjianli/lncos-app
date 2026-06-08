import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LN COS — Espace commerçant",
  robots: "noindex,nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
