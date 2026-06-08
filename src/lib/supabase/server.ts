/**
 * LN COS — Supabase server client (RSC, Route Handlers, Server Actions)
 */

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "../database.types";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components are read-only — middleware refreshes the session.
        }
      },
    },
  });
}

/** Service-role client for trusted server mutations (bypasses RLS) */
export function createServiceClient() {
  if (!isSupabaseConfigured() || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** @deprecated Use createClient() */
export async function createSupabaseServerClient() {
  return createClient();
}

/** @deprecated Use createServiceClient() */
export function createSupabaseServiceClient() {
  return createServiceClient();
}
