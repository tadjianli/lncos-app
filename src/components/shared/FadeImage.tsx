"use client";
/**
 * LN COS — FadeImage
 * Drop-in replacement for next/image that shows a shimmer skeleton while
 * loading and crossfades to the real image when ready.
 *
 * Works with fill (position:absolute) and sized images alike.
 * The parent container must be position:relative when using fill.
 */

import { useState, memo } from "react";
import Image, { type ImageProps } from "next/image";

type FadeImageProps = Omit<ImageProps, "onLoad" | "onError"> & {
  /** Label shown inside the placeholder if the image fails to load */
  fallbackLabel?: string;
  /** Extra class names applied to the shimmer skeleton */
  skeletonClass?: string;
};

export const FadeImage = memo(function FadeImage({
  fallbackLabel,
  skeletonClass = "",
  style,
  ...props
}: FadeImageProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");

  // ── Error state → branded striped placeholder ────────────────
  if (state === "error") {
    return (
      <div
        className="ph"
        data-label={fallbackLabel ?? (props.alt as string)}
        style={{ position: "absolute", inset: 0 }}
      />
    );
  }

  return (
    <>
      {/* Shimmer skeleton — sits below the image in z-order */}
      {state === "loading" && (
        <div
          aria-hidden
          className={`skeleton ${skeletonClass}`}
          style={{ position: "absolute", inset: 0 }}
        />
      )}

      {/* Actual image — invisible until loaded, then fades in */}
      <Image
        {...props}
        style={{
          ...style,
          opacity: state === "loaded" ? 1 : 0,
          transition: "opacity 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
          willChange: state === "loaded" ? "auto" : "opacity",
        }}
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
      />
    </>
  );
});
