/**
 * LN COS — Admin media upload helpers
 */

import { validateProductImageFile } from "./image-optimize";
import {
  classifyHttpResponse,
  formatFetchUploadError,
  formatNonJsonUploadError,
  logUploadChannel,
  logUploadChannelError,
  type UploadFailureKind,
} from "./upload-diagnostics";

const LOG = "[admin-media]" as const;
const SECTION_MAX_BYTES = 5 * 1024 * 1024;
const SECTION_ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadBucket = "media" | "product-images" | "review-images" | "before-after-images";

const REVIEW_MAX_BYTES = 5 * 1024 * 1024;
const REVIEW_ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

type UploadJson = {
  url?: string;
  error?: string;
  stage?: string;
  requestId?: string;
};

type FileMeta = {
  name: string;
  type: string;
  bytes: number;
};

async function postAdminUpload(
  form: FormData,
  logLabel: string,
  fileMeta?: FileMeta
): Promise<{ url: string | null; error: string | null }> {
  const t0 = Date.now();

  logUploadChannel(LOG, `${logLabel}:start`, {
    bucket: form.get("bucket"),
    folder: form.get("folder"),
    filename: form.get("filename"),
    fileName: fileMeta?.name ?? null,
    fileType: fileMeta?.type ?? null,
    fileBytes: fileMeta?.bytes ?? null,
  });

  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const raw = await res.text();
    const elapsedMs = Date.now() - t0;

    let data: UploadJson;
    let parsedJson = true;

    try {
      data = JSON.parse(raw) as UploadJson;
    } catch (parseErr) {
      parsedJson = false;
      const failureKind = classifyHttpResponse(res.status, false);
      const bodyPreview = raw.slice(0, 500);
      const errorMessage = formatNonJsonUploadError(res.status, res.statusText, raw);

      logUploadChannelError(LOG, `${logLabel}:non-json-response`, parseErr, {
        failureKind,
        httpStatus: res.status,
        httpStatusText: res.statusText,
        bodyPreview,
        bodyLength: raw.length,
        elapsedMs,
      });

      if (parseErr instanceof Error && parseErr.stack) {
        console.error(parseErr.stack);
      }

      return { url: null, error: errorMessage };
    }

    const failureKind = classifyHttpResponse(res.status, parsedJson);

    logUploadChannel(LOG, `${logLabel}:response`, {
      failureKind,
      httpStatus: res.status,
      elapsedMs,
      stage: data.stage ?? null,
      requestId: data.requestId ?? null,
      hasUrl: Boolean(data.url),
      error: data.error ?? null,
    });

    if (!res.ok) {
      const stageHint = data.stage ? ` [stage=${data.stage}]` : "";
      const requestHint = data.requestId ? ` [requestId=${data.requestId}]` : "";
      return {
        url: null,
        error: `${data.error ?? "Échec de l'upload"}${stageHint}${requestHint}`,
      };
    }

    if (!data.url) {
      return { url: null, error: "URL introuvable après upload" };
    }

    logUploadChannel(LOG, `${logLabel}:success`, {
      failureKind: "api-success" satisfies UploadFailureKind,
      url: data.url,
      requestId: data.requestId ?? null,
      elapsedMs,
    });

    return { url: data.url, error: null };
  } catch (err) {
    const elapsedMs = Date.now() - t0;
    const errorMessage = formatFetchUploadError(err);

    logUploadChannelError(LOG, `${logLabel}:fetch-failed`, err, {
      failureKind: "frontend-network",
      elapsedMs,
    });

    return { url: null, error: errorMessage };
  }
}

export function isImageUrl(value?: string | null): boolean {
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("blob:") ||
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

  if (bucket === "product-images") {
    const productValidation = validateProductImageFile(file);
    if (productValidation) return { url: null, error: productValidation };
  }

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  form.append("bucket", bucket);

  return postAdminUpload(form, "uploadAdminImage", {
    name: file.name,
    type: file.type,
    bytes: file.size,
  });
}

export async function uploadProductImage(
  file: File,
  productId: string,
  filename?: string
): Promise<{ url: string | null; error: string | null }> {
  const validation = validateProductImageFile(file);
  if (validation) return { url: null, error: validation };

  const form = new FormData();
  form.append("file", file);
  form.append("folder", productId);
  form.append("bucket", "product-images");
  if (filename) form.append("filename", filename);

  return postAdminUpload(form, "uploadProductImage", {
    name: file.name,
    type: file.type,
    bytes: file.size,
  });
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
