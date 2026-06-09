/**
 * LN COS — Admin media upload helpers
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function isImageUrl(value?: string | null): boolean {
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.includes("/storage/v1/object/public/")
  );
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Format accepté : JPG, PNG, WebP ou GIF";
  }
  if (file.size > MAX_BYTES) {
    return "Image trop volumineuse (max 5 Mo)";
  }
  return null;
}

export async function uploadAdminImage(
  file: File,
  folder = "sections"
): Promise<{ url: string | null; error: string | null }> {
  const validation = validateImageFile(file);
  if (validation) return { url: null, error: validation };

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

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
