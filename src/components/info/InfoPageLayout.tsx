"use client";

import { PageLayout } from "@/components/layout/PageLayout";

interface InfoPageLayoutProps {
  title: string;
  eyebrow?: string;
  backHref?: string;
  children: React.ReactNode;
}

/** Pages Informations / légales — même shell que Panier, Favoris, Catégories. */
export function InfoPageLayout({
  title,
  eyebrow = "Informations",
  backHref = "/",
  children,
}: InfoPageLayoutProps) {
  return (
    <PageLayout
      variant="info"
      title={title}
      backHref={backHref}
      eyebrow={eyebrow}
      insetX={18}
      padBottom
    >
      {children}
    </PageLayout>
  );
}
