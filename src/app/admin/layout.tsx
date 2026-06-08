import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "LN COS — Espace commerçant",
  robots: "noindex,nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
