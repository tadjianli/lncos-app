"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import {
  PRODUCT_PAGE_BLOCK_REGISTRY,
  merchantBlockLabel,
  type ProductPageBlock,
  type ProductPageBlockSettings,
  type ProductPageBlockType,
  type ProductPageFaqItem,
} from "@/lib/product-page-builder";

export function blockHasBuilderEditor(type: ProductPageBlockType): boolean {
  const schema = PRODUCT_PAGE_BLOCK_REGISTRY[type];
  return schema.fields.length > 0;
}

interface ProductPageBlockEditorProps {
  block: ProductPageBlock;
  onClose: () => void;
  onSave: (patch: Partial<ProductPageBlock>) => void;
}

export function ProductPageBlockEditor({ block, onClose, onSave }: ProductPageBlockEditorProps) {
  const schema = PRODUCT_PAGE_BLOCK_REGISTRY[block.type];
  const label = merchantBlockLabel(block.type);
  const [settings, setSettings] = useState<ProductPageBlockSettings>({ ...block.settings });
  const hasFields = schema.fields.length > 0;

  function patchSettings(patch: Partial<ProductPageBlockSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function patchFaqItem(index: number, patch: Partial<ProductPageFaqItem>) {
    const items = [...(settings.items ?? [])];
    items[index] = { ...items[index], ...patch };
    patchSettings({ items });
  }

  function handleSave() {
    onSave({ title: label, settings });
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal ab-modal-scroll" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Modifier · {label}</div>
          <button type="button" className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>

        {schema.productManaged && schema.productAdminHint && (
          <p
            style={{
              fontSize: 13,
              color: "var(--adm-ink-mute)",
              lineHeight: 1.55,
              margin: "0 0 16px",
              padding: "10px 12px",
              borderRadius: 8,
              background: "var(--adm-surface-2)",
              border: "1px solid var(--adm-border-2)",
            }}
          >
            {schema.productAdminHint}
          </p>
        )}

        {!hasFields && !schema.productManaged && (
          <p style={{ fontSize: 13, color: "var(--adm-ink-mute)", lineHeight: 1.55, margin: "0 0 16px" }}>
            Le texte de cette section se modifie dans <strong>Produits</strong>, fiche par fiche.
          </p>
        )}

        {!hasFields && schema.productManaged && !schema.productAdminHint && (
          <p style={{ fontSize: 13, color: "var(--adm-ink-mute)", lineHeight: 1.55, margin: "0 0 16px" }}>
            Cette section se configure dans <strong>Produits</strong>, fiche par fiche.
          </p>
        )}

        {schema.fields.map((field) => (
          <div key={String(field.key)} className="ab-field">
            <label>{field.label}</label>
            {field.type === "boolean" ? (
              <label className="adm-section-toggle" style={{ marginTop: 8 }}>
                <span className="adm-section-toggle-text">
                  <span className="adm-section-toggle-label">{field.label}</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(settings[field.key])}
                  className={`adm-switch${settings[field.key] ? " is-on" : ""}`}
                  onClick={() =>
                    patchSettings({ [field.key]: !settings[field.key] } as ProductPageBlockSettings)
                  }
                >
                  <span className="adm-switch-knob" />
                </button>
              </label>
            ) : field.type === "textarea" ? (
              <textarea
                className="ab-input textarea"
                value={String(settings[field.key] ?? "")}
                onChange={(e) => patchSettings({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            ) : field.type === "number" ? (
              <input
                className="ab-input"
                type="number"
                value={Number(settings[field.key] ?? 0)}
                onChange={(e) => patchSettings({ [field.key]: Number(e.target.value) })}
              />
            ) : field.type === "faq_list" ? (
              <div className="ppb-faq-editor">
                {(settings.items ?? []).map((item, i) => (
                  <div key={`faq-${i}`} className="ppb-faq-editor-row">
                    <input
                      className="ab-input"
                      placeholder="Question"
                      value={item.question}
                      onChange={(e) => patchFaqItem(i, { question: e.target.value })}
                    />
                    <textarea
                      className="ab-input textarea"
                      placeholder="Réponse"
                      value={item.answer}
                      onChange={(e) => patchFaqItem(i, { answer: e.target.value })}
                    />
                    <button
                      type="button"
                      className="adm-btn ghost sm"
                      onClick={() =>
                        patchSettings({ items: (settings.items ?? []).filter((_, j) => j !== i) })
                      }
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="adm-btn ghost sm"
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
                className="ab-input"
                type="text"
                value={String(settings[field.key] ?? "")}
                onChange={(e) => patchSettings({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            )}
            {field.helpText && (
              <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 4 }}>
                {field.helpText}
              </div>
            )}
          </div>
        ))}

        <div className="ab-modal-foot">
          <button type="button" className="adm-btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="adm-btn gold" onClick={handleSave}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
