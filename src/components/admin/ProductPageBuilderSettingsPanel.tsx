"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import {
  PRODUCT_PAGE_BLOCK_REGISTRY,
  blockVisualMeta,
  type ProductPageBlock,
  type ProductPageBlockSettings,
  type ProductPageFaqItem,
} from "@/lib/product-page-builder";

interface ProductPageBuilderSettingsPanelProps {
  block: ProductPageBlock | null;
  onSave: (patch: Partial<ProductPageBlock>) => void;
}

export function ProductPageBuilderSettingsPanel({
  block,
  onSave,
}: ProductPageBuilderSettingsPanelProps) {
  const [title, setTitle] = useState("");
  const [settings, setSettings] = useState<ProductPageBlockSettings>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!block) return;
    setTitle(block.title);
    setSettings({ ...block.settings });
    setDirty(false);
  }, [block?.id, block?.title, block?.settings]);

  if (!block) {
    return (
      <div className="ppb-settings-empty">
        <div className="ppb-settings-empty-icon">
          <Icon name="sliders" size={28} color="rgba(212,175,55,.5)" />
        </div>
        <h3>Sélectionnez une section</h3>
        <p>
          Cliquez sur une carte à gauche ou directement sur l&apos;aperçu iPhone pour
          modifier les paramètres.
        </p>
      </div>
    );
  }

  const schema = PRODUCT_PAGE_BLOCK_REGISTRY[block.type];
  const meta = blockVisualMeta(block.type);
  const locked = schema.locked;
  const hasFields = schema.fields.length > 0;

  function patchSettings(patch: Partial<ProductPageBlockSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }

  function patchFaqItem(index: number, patch: Partial<ProductPageFaqItem>) {
    const items = [...(settings.items ?? [])];
    items[index] = { ...items[index], ...patch };
    patchSettings({ items });
  }

  function handleSave() {
    onSave({ title: title.trim() || schema.label, settings });
    setDirty(false);
  }

  return (
    <div className="ppb-settings">
      <div className="ppb-settings-head">
        <div className="ppb-settings-head-icon" style={{ background: meta.bg }}>
          <Icon name={meta.icon} size={20} color={meta.color} />
        </div>
        <div>
          <div className="ppb-settings-head-label">{schema.label}</div>
          <div className="ppb-settings-head-sub">{schema.description}</div>
        </div>
        {locked && (
          <span className="ppb-settings-badge">
            <Icon name="lock" size={11} /> Système
          </span>
        )}
      </div>

      <div className="ppb-settings-body">
        <div className="ppb-field">
          <label>Nom dans l&apos;éditeur</label>
          <input
            className="ppb-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            placeholder={schema.label}
          />
        </div>

        {!hasFields && (
          <div className="ppb-settings-hint">
            <Icon name="info" size={14} color="var(--ppb-gold)" />
            <span>
              Le contenu de cette section provient de chaque fiche produit (Admin → Produits).
              Ici vous gérez uniquement sa position et sa visibilité.
            </span>
          </div>
        )}

        {schema.fields.map((field) => (
          <div key={String(field.key)} className="ppb-field">
            <label>{field.label}</label>
            {field.type === "boolean" ? (
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(settings[field.key])}
                className={`ppb-switch${settings[field.key] ? " is-on" : ""}`}
                onClick={() =>
                  patchSettings({ [field.key]: !settings[field.key] } as ProductPageBlockSettings)
                }
              >
                <span className="ppb-switch-knob" />
                <span className="ppb-switch-label">
                  {settings[field.key] ? "Activé" : "Désactivé"}
                </span>
              </button>
            ) : field.type === "textarea" ? (
              <textarea
                className="ppb-input ppb-textarea"
                value={String(settings[field.key] ?? "")}
                onChange={(e) => patchSettings({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
                rows={4}
              />
            ) : field.type === "number" ? (
              <input
                className="ppb-input"
                type="number"
                value={Number(settings[field.key] ?? 0)}
                onChange={(e) => patchSettings({ [field.key]: Number(e.target.value) })}
              />
            ) : field.type === "faq_list" ? (
              <div className="ppb-faq-list">
                {(settings.items ?? []).map((item, i) => (
                  <div key={`faq-${i}`} className="ppb-faq-row">
                    <input
                      className="ppb-input"
                      placeholder="Question"
                      value={item.question}
                      onChange={(e) => patchFaqItem(i, { question: e.target.value })}
                    />
                    <textarea
                      className="ppb-input ppb-textarea"
                      placeholder="Réponse"
                      value={item.answer}
                      onChange={(e) => patchFaqItem(i, { answer: e.target.value })}
                      rows={2}
                    />
                    <button
                      type="button"
                      className="ppb-btn-ghost sm"
                      onClick={() =>
                        patchSettings({ items: (settings.items ?? []).filter((_, j) => j !== i) })
                      }
                    >
                      <Icon name="trash" size={13} color="#E879A8" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="ppb-btn-ghost"
                  onClick={() =>
                    patchSettings({
                      items: [...(settings.items ?? []), { question: "", answer: "" }],
                    })
                  }
                >
                  <Icon name="plus" size={14} /> Ajouter une question
                </button>
              </div>
            ) : (
              <input
                className="ppb-input"
                type="text"
                value={String(settings[field.key] ?? "")}
                onChange={(e) => patchSettings({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            )}
            {field.helpText && <p className="ppb-field-help">{field.helpText}</p>}
          </div>
        ))}
      </div>

      {(dirty || hasFields) && (
        <div className="ppb-settings-foot">
          <button
            type="button"
            className="ppb-btn-gold"
            onClick={handleSave}
            disabled={!dirty}
          >
            <Icon name="check" size={15} />
            Appliquer au brouillon
          </button>
        </div>
      )}
    </div>
  );
}
