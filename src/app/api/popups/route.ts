import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dbToPopup } from "@/lib/popups-mapper";
import type { Database } from "@/lib/database.types";

type DbPopup = Database["public"]["Tables"]["popups"]["Row"];

/** GET /api/popups — popups actifs (public, lecture seule). */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("popups")
      .select("*")
      .eq("enabled", true)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[PopupPromo] API error", error.message);
      return NextResponse.json(
        { ok: false, error: error.message, popups: [] },
        { status: 500 }
      );
    }

    const popups = (data ?? []).map((row) => dbToPopup(row as DbPopup));

    return NextResponse.json({
      ok: true,
      count: popups.length,
      popups: popups.map((p) => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled,
        title: p.title,
        pages: p.pages,
        schedule: p.schedule,
        frequency: p.frequency,
        trigger: p.trigger,
        delaySec: p.delaySec,
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    console.error("[PopupPromo] API exception", message);
    return NextResponse.json({ ok: false, error: message, popups: [] }, { status: 500 });
  }
}
