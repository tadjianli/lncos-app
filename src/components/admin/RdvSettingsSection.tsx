"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { useRdvSettings } from "@/lib/rdv-settings-db";
import type { DepositType, RdvSettings } from "@/lib/rdv-settings";

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="ab-field" style={{ marginTop: 12 }}>
      <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5 }}>{label}</label>
      <input
        className="ab-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SaveRow({ onSave, disabled }: { onSave: () => void; disabled?: boolean }) {
  return (
    <div style={{ padding: "12px 0 4px", display: "flex", justifyContent: "flex-end" }}>
      <button className="adm-btn gold sm" onClick={onSave} disabled={disabled}>
        <Icon name="check" size={14} /> Enregistrer
      </button>
    </div>
  );
}

function useLocalDraft(settings: RdvSettings) {
  const [draft, setDraft] = useState(settings);
  useEffect(() => {
    setDraft(settings);
  }, [settings]);
  function set<K extends keyof RdvSettings>(key: K, val: RdvSettings[K]) {
    setDraft((p) => ({ ...p, [key]: val }));
  }
  return { draft, set };
}

export function RdvPageSettingsPanel({ onSaved }: { onSaved: (msg: string) => void }) {
  const { settings, loading, saving, save } = useRdvSettings();
  const { draft, set } = useLocalDraft(settings);

  async function handleSave() {
    const res = await save(draft);
    onSaved(res.ok ? "Paramètres RDV enregistrés" : `Erreur : ${res.error}`);
  }

  if (loading) {
    return <div style={{ marginTop: 12, fontSize: 12, color: "var(--adm-ink-mute)" }}>Chargement…</div>;
  }

  return (
    <>
      <Field label="Surtitre (eyebrow)" value={draft.heroEyebrow} onChange={(v) => set("heroEyebrow", v)} />
      <Field label="Titre principal" value={draft.heroTitle} onChange={(v) => set("heroTitle", v)} />
      <Field label="Sous-titre" value={draft.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} />
      <Field label="Bouton principal" value={draft.ctaLabel} onChange={(v) => set("ctaLabel", v)} />
      <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 16, marginBottom: 4, fontWeight: 600 }}>
        Bandeau de confiance (3 items)
      </div>
      <Field label="Item 1 — icône" value={draft.trust1Icon} onChange={(v) => set("trust1Icon", v)} placeholder="clock" />
      <Field label="Item 1 — texte" value={draft.trust1Text} onChange={(v) => set("trust1Text", v)} />
      <Field label="Item 2 — icône" value={draft.trust2Icon} onChange={(v) => set("trust2Icon", v)} placeholder="bell" />
      <Field label="Item 2 — texte" value={draft.trust2Text} onChange={(v) => set("trust2Text", v)} />
      <Field label="Item 3 — icône" value={draft.trust3Icon} onChange={(v) => set("trust3Icon", v)} placeholder="star" />
      <Field label="Item 3 — texte" value={draft.trust3Text} onChange={(v) => set("trust3Text", v)} />
      <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 16, marginBottom: 4, fontWeight: 600 }}>
        Écran de confirmation
      </div>
      <Field label="Titre confirmation" value={draft.confirmTitle} onChange={(v) => set("confirmTitle", v)} />
      <Field label="Message rappel" value={draft.confirmReminder} onChange={(v) => set("confirmReminder", v)} />
      <Field label="Nom du lieu (calendrier)" value={draft.locationName} onChange={(v) => set("locationName", v)} />
      <SaveRow onSave={handleSave} disabled={saving} />
    </>
  );
}

export function RdvDepositSettingsPanel({ onSaved }: { onSaved: (msg: string) => void }) {
  const { settings, loading, saving, save } = useRdvSettings();
  const { draft, set } = useLocalDraft(settings);

  async function handleSave() {
    const res = await save(draft);
    onSaved(res.ok ? "Options d'acompte enregistrées" : `Erreur : ${res.error}`);
  }

  if (loading) {
    return <div style={{ marginTop: 12, fontSize: 12, color: "var(--adm-ink-mute)" }}>Chargement…</div>;
  }

  return (
    <>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer", fontSize: 13, color: "var(--adm-ink)" }}>
        <input
          type="checkbox"
          checked={draft.depositEnabled}
          onChange={(e) => set("depositEnabled", e.target.checked)}
        />
        Activer l&apos;acompte à la réservation
      </label>
      <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginTop: 6, lineHeight: 1.5 }}>
        Le client sera redirigé vers Stripe pour payer l&apos;acompte avant confirmation du rendez-vous.
      </div>
      <div className="ab-field" style={{ marginTop: 14 }}>
        <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5 }}>Type d&apos;acompte</label>
        <select
          className="ab-input"
          value={draft.depositType}
          onChange={(e) => set("depositType", e.target.value as DepositType)}
          disabled={!draft.depositEnabled}
        >
          <option value="percent">Pourcentage du total prestation</option>
          <option value="fixed">Montant fixe (€)</option>
        </select>
      </div>
      <Field
        label={draft.depositType === "percent" ? "Pourcentage (%)" : "Montant fixe (€)"}
        value={String(draft.depositValue)}
        onChange={(v) => set("depositValue", Number(v) || 0)}
        type="number"
      />
      <Field
        label="Montant minimum prestation (€)"
        value={String(draft.depositMinAmount)}
        onChange={(v) => set("depositMinAmount", Number(v) || 0)}
        type="number"
        placeholder="0 = toujours appliquer"
      />
      <Field
        label="Libellé affiché au client"
        value={draft.depositLabel}
        onChange={(v) => set("depositLabel", v)}
        placeholder="Acompte à régler maintenant"
      />
      <SaveRow onSave={handleSave} disabled={saving} />
    </>
  );
}

export function RdvCatalogLinkPanel() {
  return (
    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(59,125,216,.06)", border: "1px solid rgba(59,125,216,.15)", borderRadius: 8 }}>
      <div style={{ fontSize: 12.5, color: "var(--tone-blue)", fontWeight: 600 }}>Prestations, équipe & créneaux</div>
      <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 4, lineHeight: 1.6 }}>
        Gérez les services, prothésistes, extras et disponibilités depuis le module{" "}
        <a href="/admin/rdv" style={{ color: "var(--adm-gold)", fontWeight: 600 }}>Rendez-vous</a>{" "}
        dans le menu latéral.
      </div>
    </div>
  );
}
