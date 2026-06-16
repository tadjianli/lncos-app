"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import type { BlogArticle } from "@/lib/contracts/blog";
import type { BlogArticleResult } from "@/lib/ai-generate";
import {
  AI_PROVIDER_LABELS,
  AI_TONE_LABELS,
  type AiProvider,
  type AiTone,
} from "@/lib/ai-settings";
import {
  estimateBlogArticleCostEur,
  formatAiCostEur,
} from "@/lib/ai-cost-estimate";
import { buildBlogArticleFromAi } from "@/lib/blog-ai-apply";
import type { AdminBlogCategory } from "@/lib/content-pages";

const WORD_COUNTS = [500, 1000, 1500, 2000] as const;

interface BlogAiGeneratePanelProps {
  categories: AdminBlogCategory[];
  onSaved: (article: BlogArticle) => void;
  onNotify: (msg: string, error?: boolean) => void;
}

export function BlogAiGeneratePanel({
  categories,
  onSaved,
  onNotify,
}: BlogAiGeneratePanelProps) {
  const [topic, setTopic] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [wordCount, setWordCount] = useState<number>(1000);
  const [tone, setTone] = useState<AiTone>("ecommerce");
  const [categoryId, setCategoryId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [provider, setProvider] = useState<AiProvider>("anthropic");
  const [blogEnabled, setBlogEnabled] = useState(true);
  const [lastCostEur, setLastCostEur] = useState<number | null>(null);

  useEffect(() => {
    const enabled = categories.filter((c) => c.enabled);
    if (!categoryId && enabled[0]) setCategoryId(enabled[0].id);
  }, [categories, categoryId]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/ai/settings");
        const data = await res.json();
        if (data.settings) {
          setProvider(data.settings.provider as AiProvider);
          setBlogEnabled(data.settings.blogEnabled !== false);
          if (data.settings.blogWordCount) setWordCount(data.settings.blogWordCount);
          if (data.settings.tone) setTone(data.settings.tone as AiTone);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const estimatedCost = estimateBlogArticleCostEur(provider);
  const canGenerate = Boolean(topic.trim()) && !generating && blogEnabled;

  async function handleGenerate() {
    if (!topic.trim()) {
      onNotify("Saisissez un sujet d'article", true);
      return;
    }
    if (!categoryId) {
      onNotify("Choisissez une catégorie", true);
      return;
    }

    setGenerating(true);
    setLastCostEur(null);
    try {
      const res = await fetch("/api/admin/ai/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          primaryKeyword: primaryKeyword.trim() || undefined,
          wordCount,
          tone,
        }),
      });

      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        detail?: string;
        data?: BlogArticleResult;
        costEur?: number;
      };

      if (!res.ok || !payload.ok || !payload.data) {
        const detail = payload.detail ? ` — ${payload.detail}` : "";
        throw new Error(`${payload.error ?? "Génération échouée"}${detail}`);
      }

      const article = buildBlogArticleFromAi(payload.data, categoryId);
      onSaved(article);
      setLastCostEur(typeof payload.costEur === "number" ? payload.costEur : null);
      onNotify(
        `Brouillon créé — « ${article.title} »` +
          (payload.costEur != null ? ` · ${formatAiCostEur(payload.costEur)}` : "")
      );
      setTopic("");
      setPrimaryKeyword("");
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Erreur de génération", true);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className="blog-ai-generate-panel"
      style={{
        display: "grid",
        gap: 12,
        padding: "4px 0 8px",
      }}
    >
      <p style={{ fontSize: 13, color: "var(--adm-ink-soft)", margin: 0, lineHeight: 1.5 }}>
        Génère un article complet (H1, H2, H3, FAQ, meta, schema, extrait, tags) via le fournisseur IA
        configuré. L&apos;article est enregistré en <strong>brouillon</strong>.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 12,
        }}
      >
        <div className="pop-field-row" style={{ margin: 0 }}>
          <label className="pop-field-label">Sujet</label>
          <input
            className="pop-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex. Routine cils magnétiques pour débutantes"
          />
        </div>
        <div className="pop-field-row" style={{ margin: 0 }}>
          <label className="pop-field-label">Mot-clé principal</label>
          <input
            className="pop-input"
            value={primaryKeyword}
            onChange={(e) => setPrimaryKeyword(e.target.value)}
            placeholder="Ex. cils magnétiques"
          />
        </div>
        <div className="pop-field-row" style={{ margin: 0 }}>
          <label className="pop-field-label">Nombre de mots</label>
          <select
            className="pop-input pop-select"
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
          >
            {WORD_COUNTS.map((n) => (
              <option key={n} value={n}>
                {n} mots
              </option>
            ))}
          </select>
        </div>
        <div className="pop-field-row" style={{ margin: 0 }}>
          <label className="pop-field-label">Ton</label>
          <select
            className="pop-input pop-select"
            value={tone}
            onChange={(e) => setTone(e.target.value as AiTone)}
          >
            {Object.entries(AI_TONE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="pop-field-row" style={{ margin: 0 }}>
          <label className="pop-field-label">Catégorie</label>
          <select
            className="pop-input pop-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.filter((c) => c.enabled).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          type="button"
          className="adm-btn gold sm"
          disabled={!canGenerate}
          onClick={() => void handleGenerate()}
        >
          <Icon name="sparkle" size={14} />
          {generating ? "Génération…" : "✨ Générer l'article"}
        </button>
        <span style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>
          {blogEnabled
            ? `${AI_PROVIDER_LABELS[provider]} · coût estimé ~${formatAiCostEur(estimatedCost)}`
            : "Blog IA désactivé — Paramètres → IA"}
        </span>
        {lastCostEur != null && (
          <span style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>
            Dernier coût : {formatAiCostEur(lastCostEur)}
          </span>
        )}
      </div>
    </div>
  );
}
