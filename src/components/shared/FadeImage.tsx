"use client";
/**
 * LN COS — FadeImage
 * Drop-in replacement for next/image that shows a shimmer skeleton while
 * loading and crossfades to the real image when ready.
 *
 * Works with fill (position:absolute) and sized images alike.
 * The parent container must be position:relative when using fill.
 */

import { useState, memo, useEffect } from "react";
import Image, { type ImageProps } from "next/image";
import { getImageSessionState, markImageError, markImageLoaded } from "@/lib/image-session-cache";

type FadeImageProps = Omit<ImageProps, "onLoad" | "onError"> & {
  /** Label shown inside the placeholder if the image fails to load */
  fallbackLabel?: string;
  /** Extra class names applied to the shimmer skeleton */
  skeletonClass?: string;
};

function resolveSrcKey(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;
  if (src && typeof src === "object" && "src" in src) return src.src;
  return String(src);
}

export const FadeImage = memo(function FadeImage({
  fallbackLabel,
  skeletonClass = "",
  style,
  src,
  ...props
}: FadeImageProps) {
  const srcKey = resolveSrcKey(src);
  const [state, setState] = useState<"loading" | "loaded" | "error">(
    () => getImageSessionState(srcKey) ?? "loading",
  );

  useEffect(() => {
    const cached = getImageSessionState(srcKey);
    if (cached) setState(cached);
    else setState("loading");
  }, [srcKey]);

  const isCached = state === "loaded";
  const fadeMs = isCached ? 0.12 : 0.35;

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
        src={src}
        style={{
          ...style,
          opacity: state === "loaded" ? 1 : 0,
          transition: `opacity ${fadeMs}s cubic-bezier(0.2, 0.8, 0.2, 1)`,
          willChange: state === "loaded" ? "auto" : "opacity",
        }}
        onLoad={() => {
          markImageLoaded(srcKey);
          setState("loaded");
        }}
        onError={() => {
          markImageError(srcKey);
          setState("error");
        }}
      />
    </>
  );
});
