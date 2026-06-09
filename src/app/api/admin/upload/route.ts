import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const SECTION_MAX = 5 * 1024 * 1024;
const PRODUCT_MAX = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type BucketName = "media" | "product-images";

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const bucket = (String(formData.get("bucket") ?? "media") as BucketName);
  if (bucket !== "media" && bucket !== "product-images") {
    return NextResponse.json({ error: "Bucket invalide" }, { status: 400 });
  }

  const mime = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: "Format non supporté (JPG, PNG, WebP)" }, { status: 400 });
  }

  const maxBytes = bucket === "product-images" ? PRODUCT_MAX : SECTION_MAX;
  if (file.size > maxBytes) {
    return NextResponse.json({
      error: `Fichier trop volumineux (max ${bucket === "product-images" ? "10" : "5"} Mo)`,
    }, { status: 400 });
  }

  const folder = sanitizeSegment(String(formData.get("folder") ?? "sections"));
  const customName = String(formData.get("filename") ?? "").trim();
  const ext = mime === "image/webp" ? "webp" : mime.split("/")[1] || "jpg";

  let path: string;
  if (bucket === "product-images") {
    const name = customName
      ? `${sanitizeSegment(customName.replace(/\.[^.]+$/, ""))}.${ext}`
      : `image-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    path = `${folder}/${name}`;
  } else {
    path = `${folder}/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  }

  try {
    const service = createServiceClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await service.storage.from(bucket).upload(path, buffer, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = service.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch {
    return NextResponse.json({ error: "Upload impossible — vérifiez SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
}
