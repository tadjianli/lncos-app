"use client";

import { SubHeader } from "@/components/shared/ActionButtons";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
  /** Large left-aligned title style (profile page) vs centered sub-page */
  variant?: "page" | "subpage";
  /** true pour les overlays plein écran */
  safeArea?: boolean;
  backHref?: string;
}

export function PageHeader({
  title,
  onBack,
  showBack = true,
  rightAction,
  className,
  variant = "subpage",
  safeArea = false,
  backHref = "/profile",
}: PageHeaderProps) {
  if (variant === "page") {
    return (
      <div className={cn("flex items-center justify-between px-5 pt-14 pb-6", className)}>
        <h1 className="text-[2rem] font-bold text-white tracking-[-0.01em]">{title}</h1>
        {rightAction && <div>{rightAction}</div>}
      </div>
    );
  }

  if (!showBack) {
    return (
      <div className={cn("mobile-screen-header", safeArea && "mobile-screen-header--safe", className)}>
        <div className="mobile-screen-header__slot" aria-hidden />
        <h2 className="mobile-screen-header__title">{title}</h2>
        <div className="mobile-screen-header__slot">{rightAction}</div>
      </div>
    );
  }

  return (
    <SubHeader
      title={title}
      onBack={onBack}
      backHref={backHref}
      right={rightAction}
      safeArea={safeArea}
      className={className}
    />
  );
}
