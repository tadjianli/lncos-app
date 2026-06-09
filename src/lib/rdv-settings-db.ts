"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import {
  DEFAULT_RDV_SETTINGS,
  dbToRdvSettings,
  rdvSettingsToDb,
  type RdvSettings,
} from "./rdv-settings";

export function useRdvSettings() {
  const [settings, setSettings] = useState<RdvSettings>(DEFAULT_RDV_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSettings(DEFAULT_RDV_SETTINGS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await getSupabase()
      .from("rdv_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    if (error) console.warn("[rdv-settings] load:", error.message);
    setSettings(dbToRdvSettings(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (next: RdvSettings) => {
    setSaving(true);
    setSettings(next);
    if (!isSupabaseConfigured()) {
      setSaving(false);
      return { ok: false as const, error: "Supabase non configuré" };
    }
    const { error } = await getSupabase()
      .from("rdv_settings")
      .upsert({ id: "default", ...rdvSettingsToDb(next) });
    setSaving(false);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  }, []);

  return { settings, loading, saving, save, reload: load };
}
