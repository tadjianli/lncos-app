import type { Metadata } from "next";
import { pageSeo } from "@/lib/branding";

export const metadata: Metadata = {
  title: pageSeo("adminLogin").title,
  robots: "noindex,nofollow",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
