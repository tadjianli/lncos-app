"use client";

import { Icon } from "@/components/shared/Icon";
import {
  COMMITMENT_ICON_OPTIONS,
  type ProductCommitment,
  type ProductSectionToggles,
} from "@/lib/product-sections";
import { newCommitment } from "@/lib/product-sections";

interface ProductCommitmentsEditorProps {
  commitments: ProductCommitment[];
  onCommitmentsChange: (items: ProductCommitment[]) => void;
  toggles: ProductSectionToggles;
  onTogglesChange: (t: ProductSectionToggles) => void;
}

export function ProductCommitmentsEditor({
  commitments,
  onCommitmentsChange,
  toggles,
  onTogglesChange,
}: ProductCommitmentsEditorProps) {
  function patch(id: string, patch: Partial<ProductCommitment>) {
    onCommitmentsChange(commitments.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function remove(id: string) {
    onCommitmentsChange(commitments.filter((c) => c.id !== id));
  }

  return (
    <div className="adm-product-sections">
      <div className="adm-section-card">
        <label className="adm-section-toggle">
          <span className="adm-section-toggle-text">
            <span className="adm-section-toggle-label">Engagements produit</span>
            <span className="adm-section-toggle-hint">
              Bandeau d&apos;icônes sous la description (Vegan, Made in France…)
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={toggles.commitments}
            className={`adm-switch${toggles.commitments ? " is-on" : ""}`}
            onClick={() => onTogglesChange({ ...toggles, commitments: !toggles.commitments })}
          >
            <span className="adm-switch-knob" />
          </button>
        </label>

        {toggles.commitments && (
          <>
            <div className="adm-lines-editor-head">
              <span className="adm-lines-editor-label">Badges ({commitments.length}/5)</span>
              <button
                type="button"
                className="adm-btn ghost sm"
                disabled={commitments.length >= 5}
                onClick={() => onCommitmentsChange([...commitments, newCommitment()])}
              >
                <Icon name="plus" size={14} /> Ajouter
              </button>
            </div>

            {commitments.length === 0 && (
              <p className="adm-lines-empty">Aucun engagement — ajoutez jusqu&apos;à 5 badges.</p>
            )}

            {commitments.map((item, index) => (
              <div key={item.id} className="adm-commitment-row">
                <div className="adm-commitment-head">
                  <span className="adm-variant-index">Badge {index + 1}</span>
                  <div className="adm-extra-section-actions">
                    <label className="adm-extra-enabled">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => patch(item.id, { enabled: e.target.checked })}
                      />
                      Afficher
                    </label>
                    <button type="button" className="adm-iconbtn sm" onClick={() => remove(item.id)}>
                      <Icon name="trash" size={14} color="var(--tone-pink)" />
                    </button>
                  </div>
                </div>

                <label className="adm-variant-field">
                  <span>Libellé</span>
                  <input
                    className="ab-input"
                    value={item.label}
                    placeholder="Ex. Vegan, Cruelty-free, Made in France…"
                    onChange={(e) => patch(item.id, { label: e.target.value })}
                  />
                </label>

                <div className="adm-commitment-icons">
                  <span className="adm-lines-editor-label">Icône</span>
                  <div className="adm-icon-picker">
                    {COMMITMENT_ICON_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`adm-icon-picker-btn${item.icon === opt.value ? " is-selected" : ""}`}
                        title={opt.label}
                        onClick={() => patch(item.id, { icon: opt.value })}
                      >
                        <Icon name={opt.value} size={18} color="var(--gold)" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
