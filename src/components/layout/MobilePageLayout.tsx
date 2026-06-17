"use client";

import { SubHeader } from "@/components/shared/ActionButtons";
import { cn } from "@/lib/utils";

interface MobilePageLayoutProps {
  children: React.ReactNode;
  /** Titre du header [Retour] [Titre] */
  title?: string;
  onBack?: () => void;
  backHref?: string;
  headerRight?: React.ReactNode;
  /**
   * true = overlay plein écran (position absolute, ignore le padding du shell)
   * false = page in-flow (le shell fournit déjà --safe-top)
   */
  safeArea?: boolean;
  /** Overlay z-80 dans app-shell-main */
  overlay?: boolean;
  /** Overlay z-90 couvrant shell + nav */
  shellOverlay?: boolean;
  scroll?: boolean;
  className?: string;
  bodyClassName?: string;
  style?: React.CSSProperties;
}

/**
 * Layout mobile unifié : header 44px + zone scrollable + safe areas.
 */
export function MobilePageLayout({
  children,
  title,
  onBack,
  backHref,
  headerRight,
  safeArea = false,
  overlay = false,
  shellOverlay = false,
  scroll = true,
  className,
  bodyClassName,
  style,
}: MobilePageLayoutProps) {
  const shellClass = shellOverlay
    ? "overlay-shell"
    : overlay
      ? "overlay-screen"
      : "mobile-page-layout";

  return (
    <div className={cn(shellClass, className)} style={style}>
      {title ? (
        <SubHeader
          title={title}
          onBack={onBack}
          backHref={backHref}
          right={headerRight}
          safeArea={safeArea || shellOverlay}
        />
      ) : null}
      <div
        className={cn(scroll && "noscroll app-scroll-page scroll-with-tab-bar", "mobile-page-layout__body", bodyClassName)}
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: scroll ? "auto" : undefined,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
