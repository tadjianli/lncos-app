"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { SubHeader } from "@/components/shared/ActionButtons";
import { cn } from "@/lib/utils";

export type PageLayoutVariant = "default" | "info";

export interface PageLayoutProps {
  children: ReactNode;
  /** Titre centré + bouton retour (header fixe, hors scroll) */
  title?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  headerRight?: ReactNode;
  /** Label doré au-dessus du contenu (pages Informations) */
  eyebrow?: string;
  variant?: PageLayoutVariant;
  insetX?: 16 | 18;
  padBottom?: boolean;
  bottomNav?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Layout mobile unifié LN COS — aligné Accueil / Boutique / Panier / Profil.
 * Header fixe + scroll en frères directs dans main (flex), clearance bottom nav.
 */
export function PageLayout({
  children,
  title,
  showBack = true,
  backHref = "/profile",
  onBack,
  headerRight,
  eyebrow,
  variant = "default",
  insetX = 18,
  padBottom = true,
  bottomNav = true,
  className,
  contentClassName,
}: PageLayoutProps) {
  const isInfo = variant === "info";

  return (
    <AppShell bottomNav={bottomNav}>
      {title ? (
        <header className="page-layout__header">
          {showBack ? (
            <SubHeader
              title={title}
              onBack={onBack}
              backHref={backHref}
              right={headerRight}
              className="page-layout__subheader"
            />
          ) : (
            <div className="mobile-screen-header page-layout__subheader">
              <div className="mobile-screen-header__slot" aria-hidden />
              <h2 className="mobile-screen-header__title">{title}</h2>
              <div className="mobile-screen-header__slot">{headerRight}</div>
            </div>
          )}
        </header>
      ) : null}

      <ScrollRegion
        variant="page"
        insetX={insetX}
        padBottom={padBottom}
        className={cn(
          "page-layout__scroll",
          isInfo && "page-layout--info",
          className
        )}
      >
        <div
          className={cn(
            "page-layout__content",
            isInfo && "info-page",
            contentClassName
          )}
        >
          {eyebrow ? <p className="page-layout__eyebrow">{eyebrow}</p> : null}
          {children}
        </div>
      </ScrollRegion>
    </AppShell>
  );
}
