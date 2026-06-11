"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import type {
  ProductPageBlock,
  ProductPageBlockSettings,
  ProductPageFaqItem,
} from "@/lib/product-page-builder";
import { PRODUCT_PAGE_BLOCK_REGISTRY } from "@/lib/product-page-builder";

interface ProductPageBlockEditorProps {
  block: ProductPageBlock;
  onClose: () => void;
  onSave: (patch: Partial<ProductPageBlock>) => void;
}

export function ProductPageBlockEditor({ block, onClose, onSave }: ProductPageBlockEditorProps) {
  const schema = PRODUCT_PAGE_BLOCK_REGISTRY[block.type];
  const [title, setTitle] = useState(block.title);
  const [settings, setSettings] = useState<ProductPageBlockSettings>({ ...block.settings });

  function patchSettings(patch: Partial<ProductPageBlockSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function patchFaqItem(index: number, patch: Partial<ProductPageFaqItem>) {
    const items = [...(settings.items ?? [])];
    items[index] = { ...items[index], ...patch };
    patchSettings({ items });
  }

  function addFaqItem() {
    patchSettings({
      items: [...(settings.items ?? []), { question: "", answer: "" }],
    });
  }

  function removeFaqItem(index: number) {
    patchSettings({ items: (settings.items ?? []).filter((_, i) => i !== index) });
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal ab-modal-scroll" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Bloc · {schema.label}</div>
          <button type="button" className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="ab-field">
          <label>Titre admin</label>
          <input
            className="ab-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

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
                    <button type="button" className="adm-btn ghost sm" onClick={() => removeFaqItem(i)}>
                      Supprimer
                    </button>
                  </div>
                ))}
                <button type="button" className="adm-btn ghost sm" onClick={addFaqItem}>
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
          <button
            type="button"
            className="adm-btn gold"
            onClick={() => onSave({ title: title.trim() || schema.label, settings })}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
