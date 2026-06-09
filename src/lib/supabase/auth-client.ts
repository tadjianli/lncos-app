/**
 * LN COS — Helpers auth côté navigateur (sans requêtes réseau inutiles)
 */

import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "./client";
import { isSupabaseConfigured } from "./env";

export async function getBrowserSession(): Promise<{
  user: User | null;
  session: Session | null;
}> {
  if (!isSupabaseConfigured()) {
    return { user: null, session: null };
  }

  try {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) {
      await clearLocalAuthSession();
      return { user: null, session: null };
    }
    return { user: data.session?.user ?? null, session: data.session };
  } catch {
    await clearLocalAuthSession();
    return { user: null, session: null };
  }
}

/** Préférer getBrowserSession() en Client Component — évite un aller-retour réseau systématique. */
export async function getBrowserUser(): Promise<User | null> {
  const { user } = await getBrowserSession();
  return user;
}

export async function clearLocalAuthSession(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await getSupabase().auth.signOut({ scope: "local" });
  } catch {
    // Session déjà invalide ou hors ligne
  }
}

export function subscribeAuthChanges(onChange: () => void): () => void {
  if (!isSupabaseConfigured()) return () => undefined;

  try {
    const { data } = getSupabase().auth.onAuthStateChange(() => {
      onChange();
    });
    return () => data.subscription.unsubscribe();
  } catch {
    return () => undefined;
  }
}
