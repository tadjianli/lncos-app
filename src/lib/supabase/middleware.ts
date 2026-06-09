/**
 * LN COS — Supabase session refresh for Next.js middleware
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "../database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return { supabase: null, response: supabaseResponse, user: null };
  }

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, response: supabaseResponse, user };
  } catch {
    return { supabase, response: supabaseResponse, user: null };
  }
}

export async function isAdminUser(
  supabase: NonNullable<Awaited<ReturnType<typeof updateSession>>["supabase"]>,
  userId: string
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single<{ is_admin: boolean }>();

  return Boolean(profile?.is_admin);
}
