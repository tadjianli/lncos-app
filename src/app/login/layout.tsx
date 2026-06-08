import type { Metadata } from "next";
import "../admin/globals.css";

export const metadata: Metadata = {
  title: "LN COS — Connexion admin",
  robots: "noindex,nofollow",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
