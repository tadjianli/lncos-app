/**
 * LN COS — Préparation images pour Claude Vision (serveur)
 */

const MAX_VISION_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type VisionImagePayload = {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string;
};

function normalizeMediaType(raw: string | null): VisionImagePayload["mediaType"] | null {
  const type = (raw ?? "image/jpeg").split(";")[0].trim().toLowerCase();
  if (type === "image/jpeg" || type === "image/jpg") return "image/jpeg";
  if (type === "image/png") return "image/png";
  if (type === "image/gif") return "image/gif";
  if (type === "image/webp") return "image/webp";
  return null;
}

/** Télécharge et encode en base64 les images accessibles (max 4). */
export async function loadVisionImages(urls: string[]): Promise<VisionImagePayload[]> {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))].slice(0, MAX_VISION_IMAGES);
  const loaded: VisionImagePayload[] = [];

  for (const url of unique) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) continue;
      const mediaType = normalizeMediaType(res.headers.get("content-type"));
      if (!mediaType) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength === 0 || buf.byteLength > MAX_IMAGE_BYTES) continue;
      loaded.push({ mediaType, data: buf.toString("base64") });
    } catch {
      /* ignore une image inaccessible */
    }
  }

  return loaded;
}
