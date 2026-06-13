"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { SubHeader } from "@/components/shared/ActionButtons";

interface InfoPageLayoutProps {
  title: string;
  eyebrow?: string;
  backHref?: string;
  children: React.ReactNode;
}

export function InfoPageLayout({
  title,
  eyebrow = "Informations",
  backHref = "/",
  children,
}: InfoPageLayoutProps) {
  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18}>
        <SubHeader title={title} backHref={backHref} />
        <div className="info-page" style={{ animation: "fadeUp .45s cubic-bezier(.22,.68,0,1) both" }}>
          <p className="info-page__eyebrow">{eyebrow}</p>
          {children}
        </div>
      </ScrollRegion>
    </AppShell>
  );
}
