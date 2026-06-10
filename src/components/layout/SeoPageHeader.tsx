"use client";

import { SubHeader } from "@/components/shared/ActionButtons";

interface SeoPageHeaderProps {
  title: string;
  backHref?: string;
}

/** Header retour pour pages SEO in-flow (catégorie, produit, etc.) */
export function SeoPageHeader({ title, backHref = "/boutique" }: SeoPageHeaderProps) {
  return <SubHeader title={title} backHref={backHref} />;
}
