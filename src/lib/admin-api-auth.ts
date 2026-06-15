/**
 * LN COS — Auth admin pour routes API
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type AdminApiUser = {
  id: string;
  email: string | undefined;
};

export async function requireAdminApi(): Promise<
  { user: AdminApiUser } | { error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();

  if (!profile?.is_admin) {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }

  return { user: { id: user.id, email: user.email } };
}
