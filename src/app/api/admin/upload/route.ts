import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Format non supporté (JPG, PNG, WebP, GIF)" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
  }

  const folder = String(formData.get("folder") ?? "sections").replace(/[^a-z0-9_-]/gi, "");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  try {
    const service = createServiceClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await service.storage.from("media").upload(path, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = service.storage.from("media").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch {
    return NextResponse.json({ error: "Upload impossible — vérifiez SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
}
