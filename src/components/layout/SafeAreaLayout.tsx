"use client";

import { cn } from "@/lib/utils";

export type SafeAreaEdge = "top" | "bottom" | "left" | "right";

interface SafeAreaLayoutProps {
  children: React.ReactNode;
  /** Bords à protéger avec env(safe-area-inset-*) */
  edges?: SafeAreaEdge[];
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "main" | "section" | "article";
}

/**
 * Enveloppe globale safe-area (iOS encoche / Dynamic Island, Android gesture bar).
 * Utiliser `edges={["top"]}` pour les modales shell (z-90 hors app-shell-main).
 */
export function SafeAreaLayout({
  children,
  edges = ["top", "bottom", "left", "right"],
  className,
  style,
  as: Tag = "div",
}: SafeAreaLayoutProps) {
  const edgeClass = edges.map((e) => `safe-area-layout--${e}`).join(" ");

  return (
    <Tag className={cn("safe-area-layout", edgeClass, className)} style={style}>
      {children}
    </Tag>
  );
}
