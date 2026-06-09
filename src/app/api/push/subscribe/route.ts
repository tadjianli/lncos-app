import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PushSubscriptionJSON;
    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return NextResponse.json({ error: "Subscription invalide" }, { status: 400 });
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

    const { error } = await supabase.from("admin_push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) {
      console.error("[push/subscribe]", error);
      return NextResponse.json({ error: "Enregistrement échoué" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/subscribe]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
