"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { useLegalSettings } from "@/lib/legal-settings-db";

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div className="ab-field" style={{ marginTop: 12 }}>
      <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5, display: "block" }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          className="ab-input"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ resize: "vertical", minHeight: 96 }}
        />
      ) : (
        <input
          className="ab-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export function LegalSettingsPanel({ onSaved }: { onSaved: (msg: string) => void }) {
  const { settings, loading, saving, save } = useLegalSettings();
  const [hostingInfo, setHostingInfo] = useState("");

  useEffect(() => {
    if (!loading) setHostingInfo(settings.hostingInfo);
  }, [loading, settings.hostingInfo]);

  async function handleSave() {
    const result = await save({ ...settings, hostingInfo });
    if (result.ok) onSaved("Mentions légales mises à jour");
    else onSaved(result.error ?? "Erreur lors de l'enregistrement");
  }

  return (
    <>
      <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 12, lineHeight: 1.6 }}>
        Ces informations apparaissent sur la page <strong>Mentions légales</strong> de l&apos;application client.
      </p>
      <Field
        label="Hébergement"
        value={loading ? "Chargement…" : hostingInfo}
        onChange={setHostingInfo}
        multiline
        placeholder="Ex. : Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — www.vercel.com"
      />
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
