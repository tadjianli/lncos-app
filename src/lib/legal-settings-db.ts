"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import {
  DEFAULT_LEGAL_SETTINGS,
  dbToLegalSettings,
  legalSettingsToDb,
  type LegalSettings,
} from "./legal-settings";

export function useLegalSettings() {
  const [settings, setSettings] = useState<LegalSettings>(DEFAULT_LEGAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSettings(DEFAULT_LEGAL_SETTINGS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await getSupabase()
      .from("legal_settings")
      .select("hosting_info, delivery_reunion, delivery_france, delivery_europe, delivery_international")
      .eq("id", "default")
      .maybeSingle();
    if (error) console.warn("[legal-settings] load:", error.message);
    setSettings(dbToLegalSettings(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (next: LegalSettings) => {
    setSaving(true);
    setSettings(next);
    if (!isSupabaseConfigured()) {
      setSaving(false);
      return { ok: false as const, error: "Supabase non configuré" };
    }
    const { error } = await getSupabase()
      .from("legal_settings")
      .upsert({ id: "default", ...legalSettingsToDb(next) });
    setSaving(false);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  }, []);

  return { settings, loading, saving, save, reload: load };
}
