import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/env";
import { logUploadChannel, logUploadChannelError } from "@/lib/upload-diagnostics";
import { PRODUCT_UPLOAD_MAX_BYTES, PRODUCT_UPLOAD_MAX_LABEL } from "@/lib/upload-limits";

/** Sharp nécessite le runtime Node.js (module natif). */
export const runtime = "nodejs";

/** Sharp + 3 variantes : marge pour éviter un timeout côté plateforme. */
export const maxDuration = 60;

const LOG = "[admin/upload]" as const;
const SECTION_MAX = 5 * 1024 * 1024;
const PRODUCT_MAX = PRODUCT_UPLOAD_MAX_BYTES;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type BucketName = "media" | "product-images" | "review-images" | "before-after-images";

type UploadErrorBody = {
  error: string;
  stage?: string;
  requestId?: string;
};

function jsonError(body: UploadErrorBody, status: number) {
  logUploadChannel(LOG, "response:error", { status, ...body });
  return NextResponse.json(body, { status });
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Préserve les sous-dossiers (ex. `{productId}/gallery`). */
function sanitizeStorageFolder(raw: string): string {
  return raw
    .split("/")
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean)
    .join("/");
}

/** Storage via service role après vérif admin (évite les échecs RLS silencieux). */
function resolveStorageClient(
  sessionClient: Awaited<ReturnType<typeof createClient>>,
  opts?: { requireServiceRole?: boolean }
) {
  if (SUPABASE_SERVICE_ROLE_KEY) {
    logUploadChannel(LOG, "storage:client", { mode: "service-role" });
    return createServiceClient();
  }
  if (opts?.requireServiceRole) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante sur le serveur (Vercel → Environment Variables → Production). Redéployez après l'ajout."
    );
  }
  logUploadChannel(LOG, "storage:client", { mode: "session", warning: "SUPABASE_SERVICE_ROLE_KEY absent" });
  return sessionClient;
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const t0 = Date.now();

  logUploadChannel(LOG, "start", {
    requestId,
    runtime: "nodejs",
    maxDurationSec: 60,
  });

  try {
    if (!isSupabaseConfigured()) {
      return jsonError(
        { error: "Supabase non configuré", stage: "env", requestId },
        503
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError({ error: "Non authentifié", stage: "auth", requestId }, 401);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single<{ is_admin: boolean }>();

    if (!profile?.is_admin) {
      return jsonError(
        { error: "Accès refusé", stage: "auth", requestId, userId: user.id } as UploadErrorBody,
        403
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (formErr) {
      logUploadChannelError(LOG, "formData:failed", formErr, { requestId });
      return jsonError(
        {
          error: `Corps de requête illisible (fichier peut-être trop lourd pour Vercel, max ${PRODUCT_UPLOAD_MAX_LABEL})`,
          stage: "validation",
          requestId,
        },
        413
      );
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return jsonError({ error: "Fichier manquant", stage: "validation", requestId }, 400);
    }

    const bucket = String(formData.get("bucket") ?? "media") as BucketName;
    if (
      bucket !== "media" &&
      bucket !== "product-images" &&
      bucket !== "review-images" &&
      bucket !== "before-after-images"
    ) {
      return jsonError(
        { error: "Bucket invalide", stage: "validation", requestId, bucket } as UploadErrorBody,
        400
      );
    }

    if (bucket === "product-images" && !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonError(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY manquante sur le serveur (Vercel → Environment Variables → Production). Redéployez après l'ajout.",
          stage: "env",
          requestId,
        },
        503
      );
    }

    const mime = file.type === "image/jpg" ? "image/jpeg" : file.type;
    if (!ALLOWED.has(mime)) {
      return jsonError(
        { error: "Format non supporté (JPG, PNG, WebP)", stage: "validation", requestId, mime } as UploadErrorBody,
        400
      );
    }

    const maxBytes =
      bucket === "product-images" ? PRODUCT_MAX : bucket === "review-images" ? SECTION_MAX : SECTION_MAX;
    if (file.size > maxBytes) {
      return jsonError(
        {
          error: `Fichier trop volumineux (max ${bucket === "product-images" ? PRODUCT_UPLOAD_MAX_LABEL : "5 Mo"})`,
          stage: "validation",
          requestId,
          bytes: file.size,
          maxBytes,
        } as UploadErrorBody,
        400
      );
    }

    const folder = sanitizeStorageFolder(String(formData.get("folder") ?? "sections"));
    if (bucket === "product-images" && !folder) {
      return jsonError(
        {
          error: "Identifiant produit invalide pour le dossier de stockage",
          stage: "validation",
          requestId,
        },
        400
      );
    }

    const customName = String(formData.get("filename") ?? "").trim();

    logUploadChannel(LOG, "file:received", {
      requestId,
      bucket,
      folder,
      mime,
      fileName: file.name,
      fileBytes: file.size,
      customName: customName || null,
    });

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    logUploadChannel(LOG, "file:buffer-ready", {
      requestId,
      bufferBytes: inputBuffer.length,
    });

    if (bucket === "product-images") {
      try {
        const { buildProductImageVariants, productImageBaseName, readProductImageInputMetadata } =
          await import("@/lib/product-image-pipeline");

        let originalMeta: Awaited<ReturnType<typeof readProductImageInputMetadata>> | null = null;
        try {
          originalMeta = await readProductImageInputMetadata(inputBuffer);
          logUploadChannel(LOG, "file:original-dimensions", {
            requestId,
            width: originalMeta.width,
            height: originalMeta.height,
            format: originalMeta.format,
            bytes: originalMeta.bytes,
          });
        } catch (metaErr) {
          logUploadChannelError(LOG, "file:original-dimensions:failed", metaErr, { requestId });
          throw metaErr;
        }

        const baseName = productImageBaseName(customName || undefined);
        const baseRelativePath = `${folder}/${baseName}`;

        logUploadChannel(LOG, "sharp:begin", { requestId, baseRelativePath });
        const variants = await buildProductImageVariants(inputBuffer, baseRelativePath);
        logUploadChannel(LOG, "sharp:end", {
          requestId,
          ms: Date.now() - t0,
          variantCount: variants.length,
          variants: variants.map((v) => ({
            variant: v.variant,
            path: v.relativePath,
            bytes: v.bytes,
            width: v.width,
            height: v.height,
          })),
        });

        const storageClient = resolveStorageClient(supabase, { requireServiceRole: true });
        const uploaded: Record<string, { path: string; url: string; bytes: number }> = {};

        for (const variant of variants) {
          logUploadChannel(LOG, "supabase:upload:start", {
            requestId,
            variant: variant.variant,
            path: variant.relativePath,
            bytes: variant.bytes,
          });

          const { error } = await storageClient.storage.from(bucket).upload(variant.relativePath, variant.buffer, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: true,
          });

          if (error) {
            logUploadChannel(LOG, "supabase:upload:failed", {
              requestId,
              variant: variant.variant,
              path: variant.relativePath,
              message: error.message,
              name: error.name,
            });
            const hint =
              error.message.includes("Bucket not found") || error.message.includes("not found")
                ? ` — le bucket « ${bucket} » n'existe pas encore (appliquez les migrations Supabase)`
                : "";
            return jsonError(
              {
                error: `${error.message}${hint}`,
                stage: "supabase-storage",
                requestId,
                variant: variant.variant,
                path: variant.relativePath,
              } as UploadErrorBody,
              500
            );
          }

          const { data } = storageClient.storage.from(bucket).getPublicUrl(variant.relativePath);
          uploaded[variant.variant] = {
            path: variant.relativePath,
            url: data.publicUrl,
            bytes: variant.bytes,
          };

          logUploadChannel(LOG, "supabase:upload:ok", {
            requestId,
            variant: variant.variant,
            path: variant.relativePath,
            url: data.publicUrl,
          });
        }

        const main = uploaded.main;
        if (!main) {
          throw new Error("Variante main absente après upload Supabase");
        }

        const responseBody = {
          url: main.url,
          path: main.path,
          variants: uploaded,
          optimized: true,
          requestId,
        };

        logUploadChannel(LOG, "response:success", {
          requestId,
          ms: Date.now() - t0,
          url: main.url,
          path: main.path,
        });

        return NextResponse.json(responseBody);
      } catch (err) {
        logUploadChannelError(LOG, "product-images:failed", err, {
          requestId,
          ms: Date.now() - t0,
        });
        const message = err instanceof Error ? err.message : "Optimisation image impossible";
        const stage = message.includes("SUPABASE_SERVICE_ROLE_KEY")
          ? "env"
          : message.toLowerCase().includes("supabase")
            ? "supabase-storage"
            : "sharp";
        return jsonError({ error: message, stage, requestId }, 500);
      }
    }

    const ext = mime === "image/webp" ? "webp" : mime.split("/")[1] || "jpg";

    let path: string;
    if (bucket === "review-images" || bucket === "before-after-images") {
      const name = customName
        ? `${sanitizeSegment(customName.replace(/\.[^.]+$/, ""))}.${ext}`
        : `image-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      path = `${folder}/${name}`;
    } else {
      path = `${folder}/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    }

    logUploadChannel(LOG, "supabase:upload:start", {
      requestId,
      bucket,
      path,
      bytes: inputBuffer.length,
    });

    const storageClient = resolveStorageClient(supabase);

    const { error } = await storageClient.storage.from(bucket).upload(path, inputBuffer, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: true,
    });

    if (error) {
      logUploadChannel(LOG, "supabase:upload:failed", {
        requestId,
        path,
        message: error.message,
        name: error.name,
      });
      const hint =
        error.message.includes("Bucket not found") || error.message.includes("not found")
          ? ` — le bucket « ${bucket} » n'existe pas encore (appliquez les migrations Supabase)`
          : "";
      return jsonError(
        { error: `${error.message}${hint}`, stage: "supabase-storage", requestId, path } as UploadErrorBody,
        500
      );
    }

    const { data } = storageClient.storage.from(bucket).getPublicUrl(path);

    logUploadChannel(LOG, "response:success", {
      requestId,
      ms: Date.now() - t0,
      url: data.publicUrl,
      path,
    });

    return NextResponse.json({ url: data.publicUrl, path, requestId });
  } catch (err) {
    logUploadChannelError(LOG, "unhandled", err, { requestId, ms: Date.now() - t0 });
    const message = err instanceof Error ? err.message : "Erreur serveur inattendue";
    return jsonError({ error: message, stage: "unhandled", requestId }, 500);
  }
}
