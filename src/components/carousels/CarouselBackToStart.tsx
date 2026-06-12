"use client";

import { memo } from "react";

interface CarouselBackToStartProps {
  onClick: () => void;
  className?: string;
}

export const CarouselBackToStart = memo(function CarouselBackToStart({
  onClick,
  className = "",
}: CarouselBackToStartProps) {
  return (
    <button
      type="button"
      className={`hsc-back${className ? ` ${className}` : ""}`}
      onClick={onClick}
      aria-label="Retour au début du carrousel"
    >
      ← Retour au début
    </button>
  );
});
