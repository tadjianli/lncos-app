/**
 * LN COS — Supabase browser client (Client Components)
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;
let authRecoveryInstalled = false;

function installAuthRecovery(client: ReturnType<typeof createBrowserClient<Database>>) {
  if (authRecoveryInstalled || typeof window === "undefined") return;
  authRecoveryInstalled = true;

  client.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") authRecoveryInstalled = false;
  });

  void client.auth.getSession().catch(() => {
    void client.auth.signOut({ scope: "local" }).catch(() => undefined);
  });
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase non configuré : définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Le middleware rafraîchit déjà la session via cookies ; évite les refresh concurrents.
        autoRefreshToken: false,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
    installAuthRecovery(browserClient);
  }
  return browserClient;
}

/** @deprecated Use createClient() — kept for existing imports */
export function getSupabase() {
  return createClient();
}
