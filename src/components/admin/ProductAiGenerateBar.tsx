"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/data";
import type { ProductSEOResult } from "@/lib/ai-generate";
import { Icon } from "@/components/shared/Icon";
import {
  AI_PROVIDER_LABELS,
  type AiProvider,
  type AiSettings,
} from "@/lib/ai-settings";
import {
  estimateProductSeoCostEur,
  formatAiCostEur,
} from "@/lib/ai-cost-estimate";
import { applyProductSeoAiResult } from "@/lib/product-ai-apply";
import { resolveProductImage } from "@/lib/product-catalog";
import { seoLevelColor } from "@/lib/seo";

const PROGRESS_STEPS = [
  { id: "vision", label: "Analyse des images" },
  { id: "content", label: "Description & bénéfices" },
  { id: "seo", label: "Optimisation SEO" },
  { id: "faq", label: "FAQ & textes ALT" },
  { id: "done", label: "Finalisation" },
] as const;

interface ProductAiGenerateBarProps {
  form: Product;
  productId: string;
  categoryName?: string;
  onApply: (patch: Partial<Product>) => void;
  onNotify: (msg: string, error?: boolean) => void;
  onGenerated?: () => void;
}

export function ProductAiGenerateBar({
  form,
  productId,
  categoryName,
  onApply,
  onNotify,
  onGenerated,
}: ProductAiGenerateBarProps) {
  const [aiSettings, setAiSettings] = useState<Pick<AiSettings, "provider" | "seoEnabled" | "lastTestOk"> | null>(
    null
  );
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState(0);
  const [lastCostEur, setLastCostEur] = useState<number | null>(null);
  const [lastPredictedScore, setLastPredictedScore] = useState<number | null>(null);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [visionUsed, setVisionUsed] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressValueRef = useRef(0);

  const imageCount =
    [resolveProductImage({ ...form, id: productId }), ...(form.galleryImages ?? [])].filter(Boolean).length;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSettings(true);
      try {
        const res = await fetch("/api/admin/ai/settings");
        const data = await res.json();
        if (!cancelled && data.settings) {
          setAiSettings({
            provider: data.settings.provider as AiProvider,
            seoEnabled: data.settings.seoEnabled,
            lastTestOk: data.settings.lastTestOk,
          });
        }
      } catch {
        if (!cancelled) setAiSettings(null);
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const provider = aiSettings?.provider ?? "anthropic";
  const estimatedCost = estimateProductSeoCostEur(provider);
  const nameEmpty = !form.name.trim();
  const seoDisabled = aiSettings?.seoEnabled === false;
  const canGenerate = !nameEmpty && !generating && !seoDisabled;

  const startProgressAnimation = useCallback((hasImages: boolean) => {
    progressValueRef.current = 4;
    setProgress(4);
    setProgressStep(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    let tick = 0;
    progressTimerRef.current = setInterval(() => {
      tick += 1;
      const bump = tick < 8 ? 6 : tick < 20 ? 3 : 1;
      progressValueRef.current = Math.min(88, progressValueRef.current + bump);
      const p = progressValueRef.current;
      setProgress(p);
      const stepIndex = hasImages
        ? p >= 78
          ? 4
          : p >= 58
            ? 3
            : p >= 32
              ? 2
              : p >= 12
                ? 1
                : 0
        : p >= 72
          ? 4
          : p >= 52
            ? 3
            : p >= 28
              ? 2
              : p >= 8
                ? 1
                : 0;
      setProgressStep(stepIndex);
    }, 450);
  }, []);

  const stopProgressAnimation = useCallback((success: boolean) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (success) {
      setProgress(100);
      setProgressStep(PROGRESS_STEPS.length - 1);
    } else {
      setProgress(0);
      setProgressStep(0);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (nameEmpty) {
      onNotify("Saisissez d'abord le nom du produit", true);
      return;
    }
    if (seoDisabled) {
      onNotify("Activez le module SEO IA dans Paramètres → IA", true);
      return;
    }

    setGenerating(true);
    setLastPredictedScore(null);
    setVisionUsed(false);
    const hasImages = imageCount > 0;
    startProgressAnimation(hasImages);

    try {
      const imageUrls = [
        resolveProductImage({ ...form, id: productId }),
        ...(form.galleryImages ?? []),
      ].filter((url): url is string => Boolean(url));

      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "product_seo",
          context: {
            productName: form.name.trim(),
            category: categoryName,
            price: form.price > 0 ? `${form.price.toFixed(2)} €` : undefined,
            ml: form.ml?.trim() || undefined,
            variants: form.variants?.length ? form.variants : form.productVariants?.map((v) => v.name),
            tag: form.tag ?? undefined,
            keywords: form.seoKeyword ?? undefined,
            benefits: form.benefits?.filter(Boolean).join("; ") || undefined,
            usage: form.usageTips?.filter(Boolean).join("; ") || undefined,
            existingDescription: form.desc?.trim() || undefined,
            imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
            imageAltHint: form.imageAlt ?? undefined,
          },
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        detail?: string;
        data?: ProductSEOResult;
        costEur?: number;
        model?: string;
        visionUsed?: boolean;
      };

      if (!res.ok || !data.ok || !data.data) {
        const detail = data.detail ? ` — ${data.detail}` : "";
        throw new Error(`${data.error ?? "Génération échouée"}${detail}`);
      }

      const { patch, predictedScore } = applyProductSeoAiResult(form, data.data);
      onApply(patch);
      setLastCostEur(typeof data.costEur === "number" ? data.costEur : null);
      setLastModel(data.model ?? null);
      setLastPredictedScore(predictedScore);
      setVisionUsed(Boolean(data.visionUsed));
      stopProgressAnimation(true);

      onGenerated?.();
      onNotify(
        `Contenu IA généré — score SEO prévisionnel ${predictedScore}/100` +
          (data.costEur != null ? ` · ${formatAiCostEur(data.costEur)}` : "") +
          (data.visionUsed ? " · analyse visuelle" : "")
      );
    } catch (e) {
      stopProgressAnimation(false);
      onNotify(e instanceof Error ? e.message : "Erreur de génération IA", true);
    } finally {
      setGenerating(false);
    }
  }, [
    categoryName,
    form,
    imageCount,
    nameEmpty,
    onApply,
    onGenerated,
    onNotify,
    productId,
    seoDisabled,
    startProgressAnimation,
    stopProgressAnimation,
  ]);

  const activeStepLabel = PROGRESS_STEPS[progressStep]?.label ?? PROGRESS_STEPS[0].label;

  return (
    <div className="product-ai-generate-bar">
      <div className="product-ai-generate-bar__row">
        <button
          type="button"
          className="adm-btn gold sm"
          onClick={() => void handleGenerate()}
          disabled={!canGenerate}
          title={
            nameEmpty
              ? "Nom du produit requis"
              : seoDisabled
                ? "SEO IA désactivé"
                : `Génère description, bénéfices, SEO, FAQ et ALT${imageCount > 0 ? " (avec analyse visuelle)" : ""}`
          }
        >
          <Icon name="sparkle" size={14} />
          {generating ? "Génération…" : "✨ Générer avec IA"}
        </button>

        <div className="product-ai-generate-bar__meta">
          {loadingSettings ? (
            <span>Chargement des paramètres IA…</span>
          ) : seoDisabled ? (
            <span>Module SEO IA désactivé — Paramètres → IA</span>
          ) : (
            <span>
              {AI_PROVIDER_LABELS[provider]} · ~{formatAiCostEur(estimatedCost)}
              {imageCount > 0 ? ` · ${imageCount} image${imageCount > 1 ? "s" : ""} pour Vision` : ""}
            </span>
          )}
        </div>

        {lastPredictedScore != null && !generating && (
          <span
            className="product-ai-generate-bar__score"
            style={{
              color: seoLevelColor(
                lastPredictedScore >= 85
                  ? "excellent"
                  : lastPredictedScore >= 70
                    ? "good"
                    : lastPredictedScore >= 50
                      ? "medium"
                      : "poor"
              ),
            }}
          >
            Score {lastPredictedScore}/100
            {lastCostEur != null ? ` · ${formatAiCostEur(lastCostEur)}` : ""}
            {lastModel ? ` · ${lastModel}` : ""}
            {visionUsed ? " · Vision" : ""}
          </span>
        )}
      </div>

      {generating && (
        <div className="product-ai-generate-bar__progress" role="status" aria-live="polite">
          <div className="product-ai-generate-bar__progress-track">
            <div
              className="product-ai-generate-bar__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="product-ai-generate-bar__progress-label">
            {activeStepLabel}… {progress}%
          </div>
        </div>
      )}

      {!generating && (
        <p className="product-ai-generate-bar__hint">
          Génère la description, les bénéfices, le SEO, la FAQ et le texte ALT. Modifiable avant enregistrement.
        </p>
      )}
    </div>
  );
}
