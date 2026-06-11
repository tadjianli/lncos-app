"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import {
  DEFAULT_SOCIAL_PROOF_SETTINGS,
  dbToSocialProofSettings,
  eventToNotification,
  enrichNotificationPool,
  socialProofSettingsToDb,
  syntheticSalesCounts,
  type DbSocialProofSettings,
  type SocialProofEvent,
  type SocialProofNotification,
  type SocialProofSettings,
} from "./social-proof";

function dbToEvent(row: {
  id: string;
  event_type: string;
  product_id: string | null;
  product_name: string;
  customer_name: string;
  rating: number | null;
  created_at: string;
}): SocialProofEvent {
  return {
    id: row.id,
    eventType: row.event_type as SocialProofEvent["eventType"],
    productId: row.product_id,
    productName: row.product_name,
    customerName: row.customer_name,
    rating: row.rating,
    createdAt: row.created_at,
  };
}

export function useSocialProofSettings() {
  const [settings, setSettings] = useState<SocialProofSettings>(DEFAULT_SOCIAL_PROOF_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSettings(DEFAULT_SOCIAL_PROOF_SETTINGS);
      setLoading(false);
      return;
    }
    const { data } = await getSupabase()
      .from("social_proof_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    setSettings(dbToSocialProofSettings(data as DbSocialProofSettings | null));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { settings, loading, reload: load };
}

export function useSocialProofNotifications(products: { id: string; name: string }[]) {
  const { settings, loading: settingsLoading } = useSocialProofSettings();
  const [notifications, setNotifications] = useState<SocialProofNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settingsLoading) return;

    const enabled =
      settings.purchaseNotifications ||
      settings.reviewNotifications ||
      settings.favoriteNotifications ||
      settings.cartNotifications;

    if (!enabled) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setNotifications(enrichNotificationPool([], products, settings));
          setLoading(false);
          return;
        }

        const types: string[] = [];
        if (settings.purchaseNotifications) types.push("purchase");
        if (settings.reviewNotifications) types.push("review");
        if (settings.favoriteNotifications) types.push("favorite");
        if (settings.cartNotifications) types.push("cart");

        const { data } = await getSupabase()
          .from("social_proof_events")
          .select("*")
          .in("event_type", types)
          .order("created_at", { ascending: false })
          .limit(40);

        const fromDb = (data ?? []).map((r) => eventToNotification(dbToEvent(r)));
        setNotifications(enrichNotificationPool(fromDb, products, settings));
      } catch {
        setNotifications(enrichNotificationPool([], products, settings));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [settings, settingsLoading, products]);

  return { notifications, settings, loading: loading || settingsLoading };
}

export function useProductSalesStats(productId: string) {
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        if (!isSupabaseConfigured()) {
          const syn = syntheticSalesCounts(productId);
          setToday(syn.today);
          setWeek(syn.week);
          return;
        }
        const { data, error } = await getSupabase().rpc("get_product_sales_stats", {
          p_product_id: productId,
        });
        if (!error && data && typeof data === "object") {
          const stats = data as { today?: number; week?: number };
          const t = stats.today ?? 0;
          const w = stats.week ?? 0;
          if (t > 0 || w > 0) {
            setToday(t);
            setWeek(w);
          } else {
            const syn = syntheticSalesCounts(productId);
            setToday(syn.today);
            setWeek(syn.week);
          }
        } else {
          const syn = syntheticSalesCounts(productId);
          setToday(syn.today);
          setWeek(syn.week);
        }
      } catch {
        const syn = syntheticSalesCounts(productId);
        setToday(syn.today);
        setWeek(syn.week);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [productId]);

  return { today, week, loading };
}
