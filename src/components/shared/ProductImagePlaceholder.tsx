"use client";

import { cn } from "@/lib/utils";

interface ProductImagePlaceholderProps {
  /** Nom du produit — affiche les initiales discrètes */
  label?: string;
  className?: string;
}

/** Placeholder premium — jamais le logo LN COS */
export function ProductImagePlaceholder({ label, className }: ProductImagePlaceholderProps) {
  const initials = (label ?? "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn("prod-img-placeholder", className)}
      role={label ? "img" : undefined}
      aria-label={label ? `Image non disponible — ${label}` : undefined}
    >
      <div className="prod-img-placeholder-silhouette" aria-hidden />
      {initials ? (
        <span className="prod-img-placeholder-initials" aria-hidden>
          {initials}
        </span>
      ) : null}
    </div>
  );
}
