/**
 * LN COS — Métadonnées image (admin produit)
 */

export interface ImageMetadata {
  filename: string;
  format: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function parseFilenameFromUrl(url: string): string {
  try {
    const path = new URL(url, "https://local.invalid").pathname;
    const name = path.split("/").pop() || "image";
    return decodeURIComponent(name.split("?")[0]);
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1]?.split("?")[0] || "image";
  }
}

export function formatFromFilename(name: string): string {
  const ext = name.includes(".") ? name.split(".").pop()?.toUpperCase() : null;
  return ext && ext.length <= 5 ? ext : "—";
}

export async function loadImageDimensions(
  url: string
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function fetchRemoteFileSize(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const len = res.headers.get("content-length");
    if (len) return Number(len);
  } catch {
    /* CORS ou réseau — ignoré */
  }
  return null;
}
