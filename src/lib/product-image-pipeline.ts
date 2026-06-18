/**
 * LN COS — Pipeline serveur d'optimisation images produit (Sharp)
 */

import sharp from "sharp";
import type { ProductImageSize } from "./product-image-urls";
import { logUploadChannel, logUploadChannelError } from "./upload-diagnostics";

const LOG = "[product-image-pipeline]" as const;

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

export interface ProductImageInputMetadata {
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number;
}

/** Lit les dimensions originales avant encodage Sharp. */
export async function readProductImageInputMetadata(input: Buffer): Promise<ProductImageInputMetadata> {
  try {
    const meta = await sharp(input, { animated: false }).metadata();
    return {
      width: meta.width ?? null,
      height: meta.height ?? null,
      format: meta.format ?? null,
      bytes: input.length,
    };
  } catch (err) {
    logUploadChannelError(LOG, "metadata:failed", err, { bytes: input.length });
    throw err;
  }
}

async function encodeWebpUnderTarget(
  input: Buffer,
  maxPx: number,
  targetBytes: number,
  qualityStart: number,
  qualityMin: number,
  variantLabel: ProductImageSize
): Promise<{ buffer: Buffer; width: number; height: number }> {
  let px = maxPx;
  let quality = qualityStart;
  const t0 = Date.now();

  logUploadChannel(LOG, "encode:start", {
    variant: variantLabel,
    inputBytes: input.length,
    maxPx,
    targetBytes,
  });

  try {
    for (let pass = 0; pass < 6; pass++) {
      const base = sharp(input, { animated: false }).rotate().resize(px, px, {
        fit: "inside",
        withoutEnlargement: true,
      });

      quality = qualityStart;
    let last = await base.clone().webp({ quality, effort: 2 }).toBuffer();

    while (last.length > targetBytes && quality > qualityMin) {
      quality -= 3;
      last = await base.clone().webp({ quality, effort: 2 }).toBuffer();
    }

      if (last.length <= targetBytes || px <= Math.round(maxPx * 0.65)) {
        const meta = await sharp(last).metadata();
        logUploadChannel(LOG, "encode:done", {
          variant: variantLabel,
          ms: Date.now() - t0,
          px,
          quality,
          outBytes: last.length,
          width: meta.width ?? px,
          height: meta.height ?? px,
        });
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
      .webp({ quality: qualityMin, effort: 2 })
      .toBuffer();
    const meta = await sharp(fallback).metadata();
    logUploadChannel(LOG, "encode:fallback", {
      variant: variantLabel,
      ms: Date.now() - t0,
      outBytes: fallback.length,
      width: meta.width ?? maxPx,
      height: meta.height ?? maxPx,
    });
    return {
      buffer: fallback,
      width: meta.width ?? maxPx,
      height: meta.height ?? maxPx,
    };
  } catch (err) {
    logUploadChannelError(LOG, "encode:failed", err, {
      variant: variantLabel,
      ms: Date.now() - t0,
    });
    throw err;
  }
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
  const t0 = Date.now();

  const inputMeta = await readProductImageInputMetadata(input);
  logUploadChannel(LOG, "sharp:start", {
    baseRelativePath,
    inputBytes: inputMeta.bytes,
    originalWidth: inputMeta.width,
    originalHeight: inputMeta.height,
    originalFormat: inputMeta.format,
  });

  try {
    const variantResults = await Promise.all(
      PRODUCT_IMAGE_VARIANT_ORDER.map(async (variant) => {
        logUploadChannel(LOG, "generate:variant", { variant, baseRelativePath });
        const cfg = PRODUCT_IMAGE_TARGETS[variant];
        const { buffer, width, height } = await encodeWebpUnderTarget(
          input,
          cfg.maxPx,
          cfg.targetBytes,
          cfg.qualityStart,
          cfg.qualityMin,
          variant
        );
        const item: ProductImageVariantFile = {
          variant,
          relativePath: `${baseRelativePath}-${variant}.webp`,
          buffer,
          bytes: buffer.length,
          width,
          height,
        };
        logUploadChannel(LOG, "generate:variant:done", {
          variant,
          path: item.relativePath,
          bytes: item.bytes,
          width,
          height,
        });
        return item;
      })
    );

    results.push(...variantResults);

    logUploadChannel(LOG, "sharp:done", {
      baseRelativePath,
      ms: Date.now() - t0,
      variants: results.map((item) => ({
        variant: item.variant,
        bytes: item.bytes,
        width: item.width,
        height: item.height,
        path: item.relativePath,
      })),
      totalVariantBytes: results.reduce((sum, item) => sum + item.bytes, 0),
    });

    return results;
  } catch (err) {
    logUploadChannelError(LOG, "sharp:failed", err, {
      baseRelativePath,
      ms: Date.now() - t0,
      completedVariants: results.map((item) => item.variant),
    });
    throw err;
  }
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
