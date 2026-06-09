"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { getSupabase } from "@/lib/supabase";
import {
  DEFAULT_SOCIAL_PROOF_SETTINGS,
  dbToSocialProofSettings,
  socialProofSettingsToDb,
  type DbSocialProofSettings,
  type RotationInterval,
  type SocialProofSettings,
  type StockLowThreshold,
} from "@/lib/social-proof";

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--adm-border-2)",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 3 }} />
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--adm-ink)" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 2 }}>{desc}</div>}
      </div>
    </label>
  );
}

export function SocialProofModule() {
  const [draft, setDraft] = useState<SocialProofSettings>(DEFAULT_SOCIAL_PROOF_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await getSupabase()
        .from("social_proof_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();
      setDraft(dbToSocialProofSettings(data as DbSocialProofSettings | null));
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof SocialProofSettings>(key: K, val: SocialProofSettings[K]) {
    setDraft((p) => ({ ...p, [key]: val }));
  }

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2800);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await getSupabase()
      .from("social_proof_settings")
      .upsert({ id: "default", ...socialProofSettingsToDb(draft) });
    setSaving(false);
    showToast(error ? error.message : "Paramètres enregistrés", error ? "error" : "success");
  }

  if (loading) {
    return (
      <div className="adm-content">
        <p style={{ color: "var(--adm-ink-mute)", fontSize: 13 }}>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="adm-content">
      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}

      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Social Proof</h1>
          <p className="adm-sub">Preuves sociales et éléments de conversion — entièrement activables</p>
        </div>
        <button type="button" className="adm-btn gold" onClick={() => void handleSave()} disabled={saving}>
          <Icon name="check" size={15} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <div className="adm-card" style={{ marginBottom: 18 }}>
        <div className="adm-card-head">
          <h2 className="adm-card-title">Notifications flottantes</h2>
        </div>
        <ToggleRow
          label="Activer les notifications d'achat"
          desc="Bas gauche · apparition 4 s · achats récents"
          checked={draft.purchaseNotifications}
          onChange={(v) => set("purchaseNotifications", v)}
        />
        <ToggleRow
          label="Activer les notifications d'avis"
          checked={draft.reviewNotifications}
          onChange={(v) => set("reviewNotifications", v)}
        />
        <ToggleRow
          label="Activer les notifications de favoris"
          checked={draft.favoriteNotifications}
          onChange={(v) => set("favoriteNotifications", v)}
        />
        <ToggleRow
          label="Activer les notifications d'ajout panier"
          checked={draft.cartNotifications}
          onChange={(v) => set("cartNotifications", v)}
        />

        <div className="ab-field" style={{ marginTop: 16 }}>
          <label>Intervalle de rotation</label>
          <select
            className="ab-input"
            value={draft.rotationIntervalSec}
            onChange={(e) => set("rotationIntervalSec", Number(e.target.value) as RotationInterval)}
          >
            <option value={5}>5 secondes</option>
            <option value={10}>10 secondes</option>
            <option value={15}>15 secondes</option>
            <option value={30}>30 secondes</option>
          </select>
        </div>
      </div>

      <div className="adm-grid-2">
        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Fiche produit</h2>
          </div>
          <ToggleRow
            label="Activer les visiteurs en temps réel"
            checked={draft.liveViewersEnabled}
            onChange={(v) => set("liveViewersEnabled", v)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div className="ab-field" style={{ margin: 0 }}>
              <label>Minimum visiteurs</label>
              <input
                className="ab-input"
                type="number"
                min={5}
                max={draft.viewersMax}
                value={draft.viewersMin}
                onChange={(e) => set("viewersMin", Math.max(5, Number(e.target.value)))}
              />
            </div>
            <div className="ab-field" style={{ margin: 0 }}>
              <label>Maximum visiteurs</label>
              <input
                className="ab-input"
                type="number"
                min={draft.viewersMin}
                max={99}
                value={draft.viewersMax}
                onChange={(e) => set("viewersMax", Math.max(draft.viewersMin, Number(e.target.value)))}
              />
            </div>
          </div>

          <ToggleRow
            label="Activer les alertes stock faible"
            checked={draft.stockAlertsEnabled}
            onChange={(v) => set("stockAlertsEnabled", v)}
          />
          <div className="ab-field">
            <label>Seuil stock faible</label>
            <select
              className="ab-input"
              value={draft.stockLowThreshold}
              onChange={(e) => set("stockLowThreshold", Number(e.target.value) as StockLowThreshold)}
            >
              <option value={5}>5 exemplaires</option>
              <option value={10}>10 exemplaires</option>
              <option value={15}>15 exemplaires</option>
            </select>
          </div>

          <ToggleRow
            label="Activer les ventes récentes"
            desc="Achats du jour ou ventes de la semaine"
            checked={draft.salesCounterEnabled}
            onChange={(v) => set("salesCounterEnabled", v)}
          />
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Badges de confiance</h2>
          </div>
          <ToggleRow
            label="✓ Livraison rapide"
            checked={draft.trustFastDelivery}
            onChange={(v) => set("trustFastDelivery", v)}
          />
          <ToggleRow
            label="✓ Paiement sécurisé"
            checked={draft.trustSecurePayment}
            onChange={(v) => set("trustSecurePayment", v)}
          />
          <ToggleRow
            label="✓ Achat vérifié"
            checked={draft.trustVerifiedPurchase}
            onChange={(v) => set("trustVerifiedPurchase", v)}
          />
          <ToggleRow
            label="✓ Retours faciles"
            checked={draft.trustEasyReturns}
            onChange={(v) => set("trustEasyReturns", v)}
          />
        </div>
      </div>
    </div>
  );
}
