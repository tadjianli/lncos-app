/**
 * Pipeline Sharp partagé (scripts CLI) — aligné sur src/lib/product-image-pipeline.ts
 */

import sharp from "sharp";

export const PRODUCT_IMAGE_TARGETS = {
  main: { maxPx: 1200, targetBytes: 200 * 1024, qualityStart: 82, qualityMin: 70 },
  gallery: { maxPx: 800, targetBytes: 120 * 1024, qualityStart: 80, qualityMin: 70 },
  thumb: { maxPx: 300, targetBytes: 40 * 1024, qualityStart: 78, qualityMin: 70 },
};

export const PRODUCT_IMAGE_VARIANT_ORDER = ["main", "gallery", "thumb"];

export const VARIANT_PATTERN = /-(main|gallery|thumb)\.webp$/i;

async function encodeWebpUnderTarget(input, maxPx, targetBytes, qualityStart, qualityMin) {
  let px = maxPx;
  let quality = qualityStart;

  for (let pass = 0; pass < 6; pass++) {
    const base = sharp(input, { animated: false }).rotate().resize(px, px, {
      fit: "inside",
      withoutEnlargement: true,
    });

    quality = qualityStart;
    let last = await base.clone().webp({ quality, effort: 4 }).toBuffer();

    while (last.length > targetBytes && quality > qualityMin) {
      quality -= 3;
      last = await base.clone().webp({ quality, effort: 4 }).toBuffer();
    }

    if (last.length <= targetBytes || px <= Math.round(maxPx * 0.65)) {
      const meta = await sharp(last).metadata();
      return {
        buffer: last,
        width: meta.width ?? px,
        height: meta.height ?? px,
        bytes: last.length,
        quality,
      };
    }

    px = Math.max(Math.round(px * 0.9), Math.round(maxPx * 0.65));
  }

  const fallback = await sharp(input, { animated: false })
    .rotate()
    .resize(maxPx, maxPx, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: qualityMin, effort: 4 })
    .toBuffer();
  const meta = await sharp(fallback).metadata();
  return {
    buffer: fallback,
    width: meta.width ?? maxPx,
    height: meta.height ?? maxPx,
    bytes: fallback.length,
    quality: qualityMin,
  };
}

export async function buildProductImageVariants(inputBuffer, baseRelativePath) {
  const results = [];
  for (const variant of PRODUCT_IMAGE_VARIANT_ORDER) {
    const cfg = PRODUCT_IMAGE_TARGETS[variant];
    const encoded = await encodeWebpUnderTarget(
      inputBuffer,
      cfg.maxPx,
      cfg.targetBytes,
      cfg.qualityStart,
      cfg.qualityMin
    );
    results.push({
      variant,
      relativePath: `${baseRelativePath}-${variant}.webp`,
      buffer: encoded.buffer,
      bytes: encoded.bytes,
      width: encoded.width,
      height: encoded.height,
    });
  }
  return results;
}

export function isVariantObjectPath(path) {
  return VARIANT_PATTERN.test(path);
}

export function basePathFromObject(path) {
  if (isVariantObjectPath(path)) return path.replace(VARIANT_PATTERN, "");
  return path.replace(/\.[^.]+$/, "");
}

export function variantPathsForBase(basePath) {
  return PRODUCT_IMAGE_VARIANT_ORDER.map((v) => `${basePath}-${v}.webp`);
}

export function variantFromUrl(url) {
  const m = url.match(VARIANT_PATTERN);
  if (m) return m[1].toLowerCase();
  return "legacy";
}
