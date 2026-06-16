"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminAccordion, AdminAccordionStack } from "@/components/admin/AdminAccordion";
import {
  AI_CONNECTION_STATUS_LABELS,
  AI_DESCRIPTION_LENGTH_LABELS,
  AI_LANGUAGE_LABELS,
  AI_PROVIDER_LABELS,
  AI_PROVIDER_MODELS,
  AI_TONE_LABELS,
  DEFAULT_AI_SETTINGS,
  type AiConnectionStatus,
  type AiLanguage,
  type AiProvider,
  type AiProviderModel,
  type AiSettings,
  type AiTone,
  type AiUsageLogRow,
  type AiUsageStats,
  type AiEnvCheckItem,
  type AiDiagnosticPayload,
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

function ConnectionBadge({
  status,
}: {
  status: AiConnectionStatus | "disconnected";
}) {
  const colors: Record<AiConnectionStatus | "disconnected", string> = {
    connected: "var(--tone-green, #2F9E68)",
    disconnected: "var(--adm-ink-mute)",
    invalid_key: "var(--tone-pink, #C2557A)",
    insufficient_credit: "#D97706",
    api_error: "var(--tone-pink, #C2557A)",
  };
  const label =
    status === "disconnected" ? "Non connecté" : AI_CONNECTION_STATUS_LABELS[status];
  const color = colors[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
        }}
      />
      {label}
    </span>
  );
}

function EnvStatusRow({ label, ok, hint }: { label: string; ok: boolean; hint?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid var(--adm-border, rgba(0,0,0,.06))",
      }}
    >
      <span
        style={{
          fontSize: 16,
          lineHeight: 1.2,
          color: ok ? "var(--tone-green, #2F9E68)" : "var(--tone-pink, #C2557A)",
          flexShrink: 0,
        }}
        aria-hidden
      >
        {ok ? "✓" : "✗"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-ink)" }}>{label}</div>
        {hint ? (
          <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginTop: 3, lineHeight: 1.45 }}>
            {hint}
          </div>
        ) : null}
      </div>
    </div>
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<AiConnectionStatus | "disconnected">(
    "disconnected"
  );
  const [envChecks, setEnvChecks] = useState<AiEnvCheckItem[]>([]);
  const [encryptionErrorMessage, setEncryptionErrorMessage] = useState<string | null>(null);
  const [canPersistApiKeys, setCanPersistApiKeys] = useState(true);
  const [diagnostic, setDiagnostic] = useState<AiDiagnosticPayload | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [providerModels, setProviderModels] = useState<AiProviderModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const onNotifyRef = useRef(onNotify);
  onNotifyRef.current = onNotify;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/ai/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chargement impossible");
      if (data.settings) {
        setSettings(data.settings);
        setConnectionStatus(data.settings.lastTestOk ? "connected" : "disconnected");
      }
      if (data.logs) setLogs(data.logs);
      if (data.stats) setStats(data.stats);
      if (Array.isArray(data.envChecks)) setEnvChecks(data.envChecks);
      setEncryptionErrorMessage(data.encryptionErrorMessage ?? null);
      setCanPersistApiKeys(data.canPersistApiKeys !== false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur de chargement";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProviderModels = useCallback(async () => {
    if (settings.provider !== "anthropic") {
      setProviderModels(AI_PROVIDER_MODELS[settings.provider]);
      setModelsError(null);
      return;
    }

    if (!settings.hasApiKey && !apiKeyInput.trim()) {
      setProviderModels([]);
      setModelsError("Configurez une clé API puis testez la connexion pour lister les modèles.");
      return;
    }

    setModelsLoading(true);
    setModelsError(null);
    try {
      const res = await fetch(`/api/admin/ai/models?provider=${settings.provider}`);
      const data = (await res.json()) as {
        models?: AiProviderModel[];
        selected?: string | null;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Impossible de charger les modèles");
      }

      const models = data.models ?? [];
      setProviderModels(models);

      setSettings((prev) => {
        if (models.length === 0) return prev;
        const valid = models.some((m) => m.id === prev.model);
        if (valid) return prev;
        const sonnet = models.find((m) => /sonnet/i.test(m.id) || /sonnet/i.test(m.label));
        return { ...prev, model: sonnet?.id ?? models[0].id };
      });
    } catch (e) {
      setProviderModels([]);
      setModelsError(e instanceof Error ? e.message : "Erreur de chargement des modèles");
    } finally {
      setModelsLoading(false);
    }
  }, [settings.provider, settings.hasApiKey, apiKeyInput]);

  const runDiagnostic = useCallback(async () => {
    setDiagnosticLoading(true);
    try {
      const res = await fetch("/api/admin/ai/diagnostic");
      const data = (await res.json()) as AiDiagnosticPayload & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Diagnostic impossible");
      setDiagnostic(data);
      if (data.checks) setEnvChecks(data.checks);
      setEncryptionErrorMessage(data.encryptionErrorMessage ?? null);
      setCanPersistApiKeys(data.canPersistApiKeys);
    } catch (e) {
      onNotifyRef.current(e instanceof Error ? e.message : "Diagnostic échoué", true);
    } finally {
      setDiagnosticLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadProviderModels();
  }, [loadProviderModels]);

  function patch(partial: Partial<AiSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  function onProviderChange(provider: AiProvider) {
    const staticModels = AI_PROVIDER_MODELS[provider];
    const model =
      provider === "anthropic"
        ? ""
        : staticModels.some((m) => m.id === settings.model)
          ? settings.model
          : defaultModelForProvider(provider);
    patch({ provider, model });
  }

  async function handleSave() {
    if (!canPersistApiKeys) {
      onNotifyRef.current(encryptionErrorMessage ?? "Configuration serveur incomplète", true);
      return;
    }
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
      onNotifyRef.current("Paramètres IA enregistrés");
    } catch (e) {
      onNotifyRef.current(e instanceof Error ? e.message : "Erreur", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const settingsPayload: Record<string, unknown> = { ...settings };
      delete settingsPayload.apiKeyMasked;
      delete settingsPayload.hasApiKey;
      delete settingsPayload.lastTestOk;
      delete settingsPayload.lastTestAt;

      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: settingsPayload,
          ...(apiKeyInput.trim() ? { apiKey: apiKeyInput.trim() } : {}),
        }),
      });
      const data = await res.json();

      if (data.settings) {
        setSettings(data.settings);
        setApiKeyInput("");
        setShowApiKey(false);
      }

      if (!res.ok || !data.ok) {
        const status = (data.status ?? "api_error") as AiConnectionStatus;
        setConnectionStatus(status);
        await load();
        const detail = data.detail ? `\n${data.detail}` : "";
        onNotifyRef.current(`${data.error ?? "Test échoué"}${detail}`, true);
        return;
      }

      setConnectionStatus("connected");
      await load();
      await loadProviderModels();
      onNotifyRef.current(data.message ?? "Connecté");
    } catch (e) {
      setConnectionStatus("api_error");
      onNotifyRef.current(e instanceof Error ? e.message : "Test échoué", true);
    } finally {
      setTesting(false);
    }
  }

  const badgeStatus = connectionStatus;
  const models = providerModels.length > 0 ? providerModels : AI_PROVIDER_MODELS[settings.provider];

  if (loading) {
    return (
      <p style={{ fontSize: 13, color: "var(--adm-ink-mute)", marginTop: 12 }}>
        Chargement des paramètres IA…
      </p>
    );
  }

  return (
    <>
      {!canPersistApiKeys && encryptionErrorMessage && (
        <div
          role="alert"
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(194,85,122,.08)",
            border: "1px solid rgba(194,85,122,.25)",
            fontSize: 12.5,
            color: "var(--tone-pink)",
            lineHeight: 1.55,
          }}
        >
          <strong>Configuration serveur requise</strong>
          <div style={{ marginTop: 6 }}>{encryptionErrorMessage}</div>
          <div style={{ marginTop: 6, color: "var(--adm-ink-soft)", fontSize: 11.5 }}>
            Consultez <code>docs/AI_MODULE_SETUP.md</code> ou ouvrez la section Diagnostic ci-dessous.
          </div>
        </div>
      )}
      {loadError && (
        <div
          role="alert"
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(194,85,122,.08)",
            border: "1px solid rgba(194,85,122,.25)",
            fontSize: 12.5,
            color: "var(--tone-pink)",
            lineHeight: 1.55,
          }}
        >
          {loadError}
          {loadError.includes("ai_settings") || loadError.includes("does not exist") ? (
            <div style={{ marginTop: 6, color: "var(--adm-ink-soft)" }}>
              Appliquez la migration Supabase{" "}
              <code style={{ fontSize: 11 }}>20260616120000_ai_settings.sql</code>.
            </div>
          ) : null}
        </div>
      )}
      <AdminAccordionStack className="adm-settings-accordion-stack">
        <AdminAccordion
          title="Fournisseur IA"
          open={openCard === "Fournisseur IA"}
          onOpenChange={(open) => setOpenCard(open ? "Fournisseur IA" : null)}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <ConnectionBadge status={badgeStatus} />
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
          title="Diagnostic"
          open={openCard === "Diagnostic"}
          onOpenChange={(open) => {
            setOpenCard(open ? "Diagnostic" : null);
            if (open && !diagnostic) void runDiagnostic();
          }}
        >
          <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 8, lineHeight: 1.5 }}>
            Vérifie les variables d&apos;environnement serveur et les connexions Supabase / Anthropic.
            Aucune valeur secrète n&apos;est affichée.
          </p>
          <div style={{ marginTop: 12 }}>
            {(diagnostic?.checks ?? envChecks).map((check) => (
              <EnvStatusRow
                key={check.id}
                label={check.label}
                ok={check.ok}
                hint={check.hint}
              />
            ))}
            {envChecks.length === 0 && !diagnosticLoading && (
              <p style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>Aucun contrôle chargé.</p>
            )}
          </div>
          {diagnostic && (
            <p style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginTop: 12 }}>
              Chiffrement :{" "}
              <strong style={{ color: "var(--adm-ink)" }}>
                {diagnostic.encryptionSource === "ai_encryption_key"
                  ? "AI_ENCRYPTION_KEY"
                  : diagnostic.encryptionSource === "service_role_fallback"
                    ? "Repli service role"
                    : "Non configuré"}
              </strong>
              {" · "}
              Clé Anthropic :{" "}
              <strong style={{ color: "var(--adm-ink)" }}>
                {diagnostic.anthropicKeySource === "env"
                  ? "ANTHROPIC_API_KEY (env)"
                  : diagnostic.anthropicKeySource === "database"
                    ? "Base chiffrée"
                    : "Aucune"}
              </strong>
            </p>
          )}
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              className="adm-btn ghost sm"
              onClick={() => void runDiagnostic()}
              disabled={diagnosticLoading}
            >
              {diagnosticLoading ? "Diagnostic…" : "Relancer le diagnostic"}
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
            {settings.provider === "anthropic" && modelsLoading ? (
              <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", margin: "6px 0" }}>
                Chargement des modèles Anthropic…
              </p>
            ) : null}
            {modelsError ? (
              <p style={{ fontSize: 11.5, color: "var(--tone-pink)", marginBottom: 6, lineHeight: 1.45 }}>
                {modelsError}
              </p>
            ) : null}
            <select
              className="ab-input"
              value={settings.model}
              onChange={(e) => patch({ model: e.target.value })}
              disabled={settings.provider === "anthropic" && models.length === 0}
            >
              {models.length === 0 ? (
                <option value="">— Aucun modèle disponible —</option>
              ) : (
                models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))
              )}
            </select>
            {settings.provider === "anthropic" && models.length > 0 ? (
              <p style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 6, lineHeight: 1.45 }}>
                {models.length} modèle{models.length > 1 ? "s" : ""} disponible{models.length > 1 ? "s" : ""} via l&apos;API Anthropic.
              </p>
            ) : null}
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
                    <th style={{ padding: "6px 4px" }}>Détail</th>
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
                        {(row.tokens ?? 0).toLocaleString("fr-FR")}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          maxWidth: 220,
                          color: row.error_detail ? "var(--tone-pink)" : "var(--tone-green, #2F9E68)",
                          fontSize: 11,
                          wordBreak: "break-word",
                        }}
                        title={row.error_detail ?? undefined}
                      >
                        {row.error_detail ? row.error_detail : "OK"}
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
        <button type="button" className="adm-btn gold sm" onClick={handleSave} disabled={saving || !canPersistApiKeys}>
          <Icon name="check" size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </>
  );
}
