"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import {
  DELIVERY_ZONE_LABELS,
  getSeoDeliveryPhrase,
  type DeliveryZoneSettings,
} from "@/lib/delivery-zones";
import { useLegalSettings } from "@/lib/legal-settings-db";

export function DeliveryZonesSettingsPanel({ onSaved }: { onSaved: (msg: string) => void }) {
  const { settings, loading, saving, save } = useLegalSettings();
  const [zones, setZones] = useState<DeliveryZoneSettings>(settings.deliveryZones);

  useEffect(() => {
    if (!loading) setZones(settings.deliveryZones);
  }, [loading, settings.deliveryZones]);

  function toggleZone(key: keyof DeliveryZoneSettings) {
    setZones((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    const result = await save({ ...settings, deliveryZones: zones });
    if (result.ok) onSaved("Zones de livraison enregistrées");
    else onSaved(result.error ?? "Erreur lors de l'enregistrement");
  }

  const seoPhrase = getSeoDeliveryPhrase(zones);

  return (
    <>
      <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 12, lineHeight: 1.6 }}>
        Ces zones alimentent automatiquement le générateur SEO produit (meta descriptions, FAQ, etc.).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {DELIVERY_ZONE_LABELS.map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13.5,
              cursor: "pointer",
              color: "var(--adm-ink)",
            }}
          >
            <input
              type="checkbox"
              checked={zones[key]}
              onChange={() => toggleZone(key)}
              disabled={loading}
            />
            {label}
          </label>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 8,
          background: "var(--adm-bg)",
          fontSize: 12.5,
          color: "var(--adm-ink-mute)",
          lineHeight: 1.55,
        }}
      >
        Phrase SEO injectée : <strong style={{ color: "var(--adm-ink)" }}>{seoPhrase}</strong>
      </div>

      <div style={{ padding: "12px 0 4px", display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="adm-btn gold sm"
          onClick={handleSave}
          disabled={loading || saving}
        >
          <Icon name="check" size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </>
  );
}
