/**
 * LN COS — Pipeline serveur d'optimisation images produit (Sharp)
 */

import sharp from "sharp";
import type { ProductImageSize } from "./product-image-urls";

export const PRODUCT_IMAGE_TARGETS: Record<
  ProductImageSize,
  { maxPx: number; targetBytes: number; qualityStart: number; qualityMin: number }
> = {
  main: { maxPx: 1200, targetBytes: 200 * 1024, qualityStart: 82, qualityMin: 70 },
  gallery: { maxPx: 800, targetBytes: 120 * 1024, qualityStart: 80, qualityMin: 70 },
  thumb: { maxPx: 300, targetBytes: 40 * 1024, qualityStart: 78, qualityMin: 70 },
};

export const PRODUCT_IMAGE_VARIANT_ORDER: ProductImageSize[] = ["main", "gallery", "thumb"];

export interface ProductImageVariantFile {
  variant: ProductImageSize;
  relativePath: string;
  buffer: Buffer;
  bytes: number;
  width: number;
  height: number;
}

async function encodeWebpUnderTarget(
  input: Buffer,
  maxPx: number,
  targetBytes: number,
  qualityStart: number,
  qualityMin: number
): Promise<{ buffer: Buffer; width: number; height: number }> {
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
  };
}

/**
 * Génère main (-main), gallery (-gallery), thumb (-thumb) en WebP.
 * `baseRelativePath` sans extension, ex. `{productId}/image-123-abc`
 */
export async function buildProductImageVariants(
  input: Buffer,
  baseRelativePath: string
): Promise<ProductImageVariantFile[]> {
  const results: ProductImageVariantFile[] = [];

  for (const variant of PRODUCT_IMAGE_VARIANT_ORDER) {
    const cfg = PRODUCT_IMAGE_TARGETS[variant];
    const { buffer, width, height } = await encodeWebpUnderTarget(
      input,
      cfg.maxPx,
      cfg.targetBytes,
      cfg.qualityStart,
      cfg.qualityMin
    );
    results.push({
      variant,
      relativePath: `${baseRelativePath}-${variant}.webp`,
      buffer,
      bytes: buffer.length,
      width,
      height,
    });
  }

  return results;
}

export function productImageBaseName(customName?: string): string {
  const stamp = Date.now();
  const id = crypto.randomUUID().slice(0, 8);
  if (customName?.trim()) {
    const base = customName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "");
    if (base) return base;
  }
  return `image-${stamp}-${id}`;
}
