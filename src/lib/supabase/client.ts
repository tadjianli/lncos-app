/**
 * LN COS — Supabase browser client (Client Components)
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}

/** @deprecated Use createClient() — kept for existing imports */
export function getSupabase() {
  return createClient();
}
