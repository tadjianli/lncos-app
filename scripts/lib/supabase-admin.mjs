import ws from "ws";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Variables manquantes: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return { url, key };
}

export function createAdminClient() {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch },
    realtime: { transport: ws },
  });
}

export function publicObjectUrl(supabaseUrl, bucket, objectPath) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`;
}
