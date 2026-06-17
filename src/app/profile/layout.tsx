import type { Metadata } from "next";
import { pageSeo } from "@/lib/branding";

export const metadata: Metadata = {
  title: pageSeo("profile").title,
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
