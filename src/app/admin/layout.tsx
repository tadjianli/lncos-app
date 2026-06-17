import type { Metadata } from "next";
import { brandCopy } from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: brandCopy("adminTitle"),
  robots: "noindex,nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
