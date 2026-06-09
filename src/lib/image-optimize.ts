/**
 * LN COS — Optimisation images côté client (avant upload)
 */

const PRODUCT_MAX_BYTES = 10 * 1024 * 1024;
const PRODUCT_MAX_DIM = 1600;
const PRODUCT_QUALITY = 0.82;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateProductImageFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) {
    return "Format accepté : JPG, JPEG, PNG ou WebP";
  }
  if (file.size > PRODUCT_MAX_BYTES) {
    return "Image trop volumineuse (max 10 Mo)";
  }
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire l'image"));
    };
    img.src = url;
  });
}

/**
 * Redimensionne et convertit en WebP pour réduire le poids avant upload.
 */
export async function optimizeProductImage(file: File): Promise<File> {
  const validation = validateProductImageFile(file);
  if (validation) throw new Error(validation);

  if (file.type === "image/webp" && file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  const img = await loadImage(file);
  const scale = Math.min(1, PRODUCT_MAX_DIM / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", PRODUCT_QUALITY);
  });

  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}
