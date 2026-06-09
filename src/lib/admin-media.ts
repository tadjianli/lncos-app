/**
 * LN COS — Admin media upload helpers
 */

import { optimizeProductImage } from "./image-optimize";

const SECTION_MAX_BYTES = 5 * 1024 * 1024;
const SECTION_ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadBucket = "media" | "product-images" | "review-images" | "before-after-images";

const REVIEW_MAX_BYTES = 5 * 1024 * 1024;
const REVIEW_ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isImageUrl(value?: string | null): boolean {
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.includes("/storage/v1/object/public/")
  );
}

export function validateSectionImageFile(file: File): string | null {
  if (!SECTION_ALLOWED.has(file.type)) {
    return "Format accepté : JPG, PNG, WebP ou GIF";
  }
  if (file.size > SECTION_MAX_BYTES) {
    return "Image trop volumineuse (max 5 Mo)";
  }
  return null;
}

export function validateReviewImageFile(file: File): string | null {
  const mime = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (!REVIEW_ALLOWED.has(mime)) {
    return "Format accepté : JPG, PNG ou WebP";
  }
  if (file.size > REVIEW_MAX_BYTES) {
    return "Image trop volumineuse (max 5 Mo)";
  }
  return null;
}

export async function uploadAdminImage(
  file: File,
  folder = "sections",
  bucket: UploadBucket = "media"
): Promise<{ url: string | null; error: string | null }> {
  const validation =
    bucket === "product-images"
      ? null
      : bucket === "review-images" || bucket === "before-after-images"
        ? validateReviewImageFile(file)
        : validateSectionImageFile(file);
  if (validation) return { url: null, error: validation };

  let uploadFile = file;
  if (bucket === "product-images") {
    try {
      uploadFile = await optimizeProductImage(file);
    } catch (err) {
      return { url: null, error: (err as Error).message };
    }
  }

  const form = new FormData();
  form.append("file", uploadFile);
  form.append("folder", folder);
  form.append("bucket", bucket);

  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) return { url: null, error: data.error ?? "Échec de l'upload" };
    if (!data.url) return { url: null, error: "URL introuvable après upload" };
    return { url: data.url, error: null };
  } catch {
    return { url: null, error: "Erreur réseau lors de l'upload" };
  }
}

export async function uploadProductImage(
  file: File,
  productId: string,
  filename?: string
): Promise<{ url: string | null; error: string | null }> {
  const folder = productId;
  const form = new FormData();
  try {
    const optimized = await optimizeProductImage(file);
    form.append("file", optimized);
  } catch (err) {
    return { url: null, error: (err as Error).message };
  }
  form.append("folder", folder);
  form.append("bucket", "product-images");
  if (filename) form.append("filename", filename);

  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) return { url: null, error: data.error ?? "Échec de l'upload" };
    if (!data.url) return { url: null, error: "URL introuvable après upload" };
    return { url: data.url, error: null };
  } catch {
    return { url: null, error: "Erreur réseau lors de l'upload" };
  }
}

export async function uploadReviewImage(
  file: File,
  reviewId: string
): Promise<{ url: string | null; error: string | null }> {
  return uploadAdminImage(file, reviewId, "review-images");
}

export async function uploadBeforeAfterImage(
  file: File,
  folder: string
): Promise<{ url: string | null; error: string | null }> {
  return uploadAdminImage(file, folder, "before-after-images");
}
