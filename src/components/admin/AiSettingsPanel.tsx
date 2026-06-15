"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminAccordion, AdminAccordionStack } from "@/components/admin/AdminAccordion";
import {
  AI_DESCRIPTION_LENGTH_LABELS,
  AI_LANGUAGE_LABELS,
  AI_PROVIDER_LABELS,
  AI_PROVIDER_MODELS,
  AI_TONE_LABELS,
  DEFAULT_AI_SETTINGS,
  type AiLanguage,
  type AiProvider,
  type AiSettings,
  type AiTone,
  type AiUsageLogRow,
  type AiUsageStats,
  defaultModelForProvider,
} from "@/lib/ai-settings";

const ACTION_LABELS: Record<string, string> = {
  test_connection: "Test connexion",
  seo_title: "Titre SEO",
  short_description: "Description courte",
  long_description: "Description longue",
  meta_description: "Méta description",
  seo_slug: "Slug SEO",
  image_alt: "Texte ALT",
  keywords: "Mots-clés",
  rewrite: "Réécriture",
  translate: "Traduction",
  blog_article: "Article blog",
};

function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="ab-field"
      style={{
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <label style={{ margin: 0, fontSize: 13, color: "var(--adm-ink)" }}>{label}</label>
      <label className="ab-toggle" style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="ab-toggle-track" />
        <div className="ab-toggle-thumb" />
      </label>
    </div>
  );
}

function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: connected ? "var(--tone-green, #2F9E68)" : "var(--adm-ink-mute)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: connected ? "var(--tone-green, #2F9E68)" : "var(--adm-ink-mute)",
        }}
      />
      {connected ? "Connecté" : "Non connecté"}
    </span>
  );
}

export function AiSettingsPanel({
  onNotify,
}: {
  onNotify: (msg: string, error?: boolean) => void;
}) {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [logs, setLogs] = useState<AiUsageLogRow[]>([]);
  const [stats, setStats] = useState<AiUsageStats>({
    todayEur: 0,
    weekEur: 0,
    monthEur: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [openCard, setOpenCard] = useState<string | null>("Fournisseur IA");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chargement impossible");
      if (data.settings) setSettings(data.settings);
      if (data.logs) setLogs(data.logs);
      if (data.stats) setStats(data.stats);
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Erreur de chargement", true);
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    load();
  }, [load]);

  function patch(partial: Partial<AiSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  function onProviderChange(provider: AiProvider) {
    const models = AI_PROVIDER_MODELS[provider];
    const model = models.some((m) => m.id === settings.model)
      ? settings.model
      : defaultModelForProvider(provider);
    patch({ provider, model });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...settings };
      delete body.apiKeyMasked;
      delete body.hasApiKey;
      delete body.lastTestOk;
      delete body.lastTestAt;
      if (apiKeyInput.trim()) body.apiKey = apiKeyInput.trim();

      const res = await fetch("/api/admin/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enregistrement échoué");
      if (data.settings) setSettings(data.settings);
      setApiKeyInput("");
      setShowApiKey(false);
      await load();
      onNotify("Paramètres IA enregistrés");
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Erreur", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: settings.provider,
          model: settings.model,
          ...(apiKeyInput.trim() ? { apiKey: apiKeyInput.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Test de connexion échoué");
      }
      patch({ lastTestOk: true, lastTestAt: new Date().toISOString() });
      await load();
      onNotify(data.message ?? "Connexion réussie");
    } catch (e) {
      patch({ lastTestOk: false });
      onNotify(e instanceof Error ? e.message : "Test échoué", true);
    } finally {
      setTesting(false);
    }
  }

  const connected = settings.hasApiKey && settings.lastTestOk;
  const models = AI_PROVIDER_MODELS[settings.provider];

  if (loading) {
    return (
      <p style={{ fontSize: 13, color: "var(--adm-ink-mute)", marginTop: 12 }}>
        Chargement des paramètres IA…
      </p>
    );
  }

  return (
    <>
      <AdminAccordionStack className="adm-settings-accordion-stack">
        <AdminAccordion
          title="Fournisseur IA"
          open={openCard === "Fournisseur IA"}
          onOpenChange={(open) => setOpenCard(open ? "Fournisseur IA" : null)}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <ConnectionBadge connected={connected} />
          </div>
          <div className="ab-field" style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5, display: "block" }}>
              Fournisseur
            </label>
            <select
              className="ab-input"
              value={settings.provider}
              onChange={(e) => onProviderChange(e.target.value as AiProvider)}
            >
              {(Object.keys(AI_PROVIDER_LABELS) as AiProvider[]).map((p) => (
                <option key={p} value={p}>
                  {AI_PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="ab-field" style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5, display: "block" }}>
              Clé API
            </label>
            {settings.hasApiKey && !apiKeyInput && (
              <p style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginBottom: 6 }}>
                Clé enregistrée : {settings.apiKeyMasked}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="ab-input"
                type={showApiKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={settings.hasApiKey ? "Laisser vide pour conserver la clé actuelle" : "sk-…"}
                autoComplete="off"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="adm-btn ghost sm"
                onClick={() => setShowApiKey((v) => !v)}
                aria-label={showApiKey ? "Masquer la clé" : "Révéler la clé"}
              >
                <Icon name={showApiKey ? "lock" : "eye"} size={14} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button
              type="button"
              className="adm-btn ghost sm"
              onClick={handleTest}
              disabled={testing || (!settings.hasApiKey && !apiKeyInput.trim())}
            >
              {testing ? "Test en cours…" : "Tester la connexion"}
            </button>
          </div>
        </AdminAccordion>

        <AdminAccordion
          title="Modèle IA"
          open={openCard === "Modèle IA"}
          onOpenChange={(open) => setOpenCard(open ? "Modèle IA" : null)}
        >
          <div className="ab-field" style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5, display: "block" }}>
              Modèle ({AI_PROVIDER_LABELS[settings.provider]})
            </label>
            <select
              className="ab-input"
              value={settings.model}
              onChange={(e) => patch({ model: e.target.value })}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </AdminAccordion>

        <AdminAccordion
          title="Paramètres génération"
          open={openCard === "Paramètres génération"}
          onOpenChange={(open) => setOpenCard(open ? "Paramètres génération" : null)}
        >
          <div className="ab-field" style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5, display: "block" }}>
              Longueur description
            </label>
            <select
              className="ab-input"
              value={settings.descriptionLength}
              onChange={(e) =>
                patch({ descriptionLength: e.target.value as AiSettings["descriptionLength"] })
              }
            >
              {Object.entries(AI_DESCRIPTION_LENGTH_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="ab-field" style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5, display: "block" }}>
              Ton
            </label>
            <select
              className="ab-input"
              value={settings.tone}
              onChange={(e) => patch({ tone: e.target.value as AiTone })}
            >
              {Object.entries(AI_TONE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="ab-field" style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5, display: "block" }}>
              Langue
            </label>
            <select
              className="ab-input"
              value={settings.language}
              onChange={(e) => patch({ language: e.target.value as AiLanguage })}
            >
              {Object.entries(AI_LANGUAGE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </AdminAccordion>

        <AdminAccordion
          title="SEO automatique"
          open={openCard === "SEO automatique"}
          onOpenChange={(open) => setOpenCard(open ? "SEO automatique" : null)}
        >
          <ToggleRow
            label="Activer le module SEO IA"
            checked={settings.seoEnabled}
            onChange={(v) => patch({ seoEnabled: v })}
          />
          <ToggleRow
            label="Génération automatique titre SEO"
            checked={settings.seoAutoTitle}
            onChange={(v) => patch({ seoAutoTitle: v })}
            disabled={!settings.seoEnabled}
          />
          <ToggleRow
            label="Génération automatique méta description"
            checked={settings.seoAutoMeta}
            onChange={(v) => patch({ seoAutoMeta: v })}
            disabled={!settings.seoEnabled}
          />
          <ToggleRow
            label="Génération automatique slug"
            checked={settings.seoAutoSlug}
            onChange={(v) => patch({ seoAutoSlug: v })}
            disabled={!settings.seoEnabled}
          />
          <ToggleRow
            label="Génération automatique ALT image"
            checked={settings.seoAutoAlt}
            onChange={(v) => patch({ seoAutoAlt: v })}
            disabled={!settings.seoEnabled}
          />
          <ToggleRow
            label="Génération automatique mots-clés"
            checked={settings.seoAutoKeywords}
            onChange={(v) => patch({ seoAutoKeywords: v })}
            disabled={!settings.seoEnabled}
          />
        </AdminAccordion>

        <AdminAccordion
          title="Blog IA"
          open={openCard === "Blog IA"}
          onOpenChange={(open) => setOpenCard(open ? "Blog IA" : null)}
        >
          <ToggleRow
            label="Génération article complet"
            checked={settings.blogEnabled}
            onChange={(v) => patch({ blogEnabled: v })}
          />
          <div className="ab-field" style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5, display: "block" }}>
              Nombre de mots
            </label>
            <select
              className="ab-input"
              value={settings.blogWordCount}
              onChange={(e) =>
                patch({ blogWordCount: Number(e.target.value) as AiSettings["blogWordCount"] })
              }
              disabled={!settings.blogEnabled}
            >
              {[500, 1000, 1500, 2000].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <ToggleRow
            label="Inclure FAQ SEO"
            checked={settings.blogIncludeFaq}
            onChange={(v) => patch({ blogIncludeFaq: v })}
            disabled={!settings.blogEnabled}
          />
          <ToggleRow
            label="Inclure Schema Article"
            checked={settings.blogIncludeSchema}
            onChange={(v) => patch({ blogIncludeSchema: v })}
            disabled={!settings.blogEnabled}
          />
          <ToggleRow
            label="Suggestions d'images"
            checked={settings.blogImageSuggestions}
            onChange={(v) => patch({ blogImageSuggestions: v })}
            disabled={!settings.blogEnabled}
          />
        </AdminAccordion>

        <AdminAccordion
          title="Historique IA"
          open={openCard === "Historique IA"}
          onOpenChange={(open) => setOpenCard(open ? "Historique IA" : null)}
        >
          {logs.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 8 }}>
              Aucune requête IA enregistrée.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table style={{ width: "100%", fontSize: 11.5, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: "var(--adm-ink-mute)", textAlign: "left" }}>
                    <th style={{ padding: "6px 4px" }}>Date</th>
                    <th style={{ padding: "6px 4px" }}>Utilisateur</th>
                    <th style={{ padding: "6px 4px" }}>Action</th>
                    <th style={{ padding: "6px 4px" }}>Modèle</th>
                    <th style={{ padding: "6px 4px" }}>Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((row) => (
                    <tr key={row.id} style={{ borderTop: "1px solid var(--adm-border, rgba(0,0,0,.08))" }}>
                      <td style={{ padding: "8px 4px", whiteSpace: "nowrap" }}>
                        {formatDate(row.created_at)}
                      </td>
                      <td style={{ padding: "8px 4px" }}>{row.user_email ?? "—"}</td>
                      <td style={{ padding: "8px 4px" }}>
                        {ACTION_LABELS[row.action] ?? row.action}
                      </td>
                      <td style={{ padding: "8px 4px" }}>{row.model}</td>
                      <td style={{ padding: "8px 4px", whiteSpace: "nowrap" }}>
                        {(row.tokens_input + row.tokens_output).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminAccordion>

        <AdminAccordion
          title="Coût IA"
          open={openCard === "Coût IA"}
          onOpenChange={(open) => setOpenCard(open ? "Coût IA" : null)}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
              marginTop: 8,
            }}
          >
            {[
              { label: "Aujourd'hui", value: stats.todayEur },
              { label: "Cette semaine", value: stats.weekEur },
              { label: "Ce mois", value: stats.monthEur },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "var(--adm-bg)",
                  border: "1px solid var(--adm-border, rgba(0,0,0,.06))",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--adm-ink-mute)" }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{formatEur(value)}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 14 }}>
            Nombre total de requêtes :{" "}
            <strong style={{ color: "var(--adm-ink)" }}>{stats.totalRequests}</strong>
          </p>
          <p style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 6, lineHeight: 1.5 }}>
            Estimation basée sur les tarifs publics des fournisseurs. Les montants réels peuvent varier.
          </p>
        </AdminAccordion>
      </AdminAccordionStack>

      <div style={{ padding: "16px 0 4px", display: "flex", justifyContent: "flex-end" }}>
        <button type="button" className="adm-btn gold sm" onClick={handleSave} disabled={saving}>
          <Icon name="check" size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </>
  );
}
