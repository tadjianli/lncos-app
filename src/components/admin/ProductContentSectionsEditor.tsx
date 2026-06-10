"use client";

import { Icon } from "@/components/shared/Icon";
import type { ProductExtraSection, ProductSectionToggles } from "@/lib/product-sections";
import { newExtraSection } from "@/lib/product-sections";

interface ProductContentSectionsEditorProps {
  desc: string;
  onDescChange: (v: string) => void;
  benefits: string[];
  onBenefitsChange: (items: string[]) => void;
  usageTips: string[];
  onUsageTipsChange: (tips: string[]) => void;
  ingredients: string[];
  onIngredientsChange: (items: string[]) => void;
  toggles: ProductSectionToggles;
  onTogglesChange: (t: ProductSectionToggles) => void;
  extraSections: ProductExtraSection[];
  onExtraSectionsChange: (sections: ProductExtraSection[]) => void;
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="adm-section-toggle">
      <span className="adm-section-toggle-text">
        <span className="adm-section-toggle-label">{label}</span>
        {hint && <span className="adm-section-toggle-hint">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`adm-switch${checked ? " is-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="adm-switch-knob" />
      </button>
    </label>
  );
}

function LinesEditor({
  label,
  placeholder,
  lines,
  onChange,
  numbered,
}: {
  label: string;
  placeholder: string;
  lines: string[];
  onChange: (lines: string[]) => void;
  numbered?: boolean;
}) {
  function updateLine(i: number, val: string) {
    const next = [...lines];
    next[i] = val;
    onChange(next);
  }

  function addLine() {
    onChange([...lines, ""]);
  }

  function removeLine(i: number) {
    onChange(lines.filter((_, idx) => idx !== i));
  }

  return (
    <div className="adm-lines-editor">
      <div className="adm-lines-editor-head">
        <span className="adm-lines-editor-label">{label}</span>
        <button type="button" className="adm-btn ghost sm" onClick={addLine}>
          <Icon name="plus" size={14} /> Ajouter
        </button>
      </div>
      {lines.length === 0 && (
        <p className="adm-lines-empty">Aucune ligne — cliquez sur Ajouter.</p>
      )}
      {lines.map((line, i) => (
        <div key={`${label}-${i}`} className="adm-line-row">
          {numbered && <span className="adm-line-num">{i + 1}</span>}
          <input
            className="ab-input"
            value={line}
            placeholder={placeholder}
            onChange={(e) => updateLine(i, e.target.value)}
          />
          <button type="button" className="adm-iconbtn sm" onClick={() => removeLine(i)} title="Supprimer">
            <Icon name="trash" size={14} color="var(--tone-pink)" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ProductContentSectionsEditor({
  desc,
  onDescChange,
  benefits,
  onBenefitsChange,
  usageTips,
  onUsageTipsChange,
  ingredients,
  onIngredientsChange,
  toggles,
  onTogglesChange,
  extraSections,
  onExtraSectionsChange,
}: ProductContentSectionsEditorProps) {
  function patchExtra(id: string, patch: Partial<ProductExtraSection>) {
    onExtraSectionsChange(extraSections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeExtra(id: string) {
    onExtraSectionsChange(extraSections.filter((s) => s.id !== id));
  }

  return (
    <div className="adm-product-sections">
      <p className="adm-product-sections-intro">
        Activez ou désactivez chaque bloc affiché sur la fiche produit boutique. Les sections désactivées ne sont pas visibles côté client.
      </p>

      <div className="adm-section-card">
        <ToggleRow
          label="Description"
          hint="Texte principal du produit"
          checked={toggles.description}
          onChange={(description) => onTogglesChange({ ...toggles, description })}
        />
        {toggles.description && (
          <textarea
            className="ab-input textarea"
            value={desc}
            placeholder="Décrivez le produit…"
            onChange={(e) => onDescChange(e.target.value)}
          />
        )}
      </div>

      <div className="adm-section-card">
        <ToggleRow
          label="Bénéfices clés"
          hint="Liste à puces avant la description (ex. Sans colle, Réutilisable…)"
          checked={toggles.benefits}
          onChange={(benefitsToggle) => onTogglesChange({ ...toggles, benefits: benefitsToggle })}
        />
        {toggles.benefits && (
          <LinesEditor
            label="Bénéfices"
            placeholder="Ex. Pose en 30 secondes"
            lines={benefits}
            onChange={onBenefitsChange}
          />
        )}
      </div>

      <div className="adm-section-card">
        <ToggleRow
          label="Conseils d'utilisation"
          hint="Étapes numérotées (rituel d'application)"
          checked={toggles.usageTips}
          onChange={(usageTips) => onTogglesChange({ ...toggles, usageTips })}
        />
        {toggles.usageTips && (
          <LinesEditor
            label="Étapes"
            placeholder="Ex. Appliquer sur peau propre et sèche…"
            lines={usageTips}
            onChange={onUsageTipsChange}
            numbered
          />
        )}
      </div>

      <div className="adm-section-card">
        <ToggleRow
          label="Ingrédients"
          hint="Liste à puces"
          checked={toggles.ingredients}
          onChange={(ingredients) => onTogglesChange({ ...toggles, ingredients })}
        />
        {toggles.ingredients && (
          <LinesEditor
            label="Ingrédients"
            placeholder="Ex. Acide hyaluronique"
            lines={ingredients}
            onChange={onIngredientsChange}
          />
        )}
      </div>

      <div className="adm-section-card">
        <div className="adm-lines-editor-head">
          <span className="adm-lines-editor-label">Sections supplémentaires</span>
          <button
            type="button"
            className="adm-btn ghost sm"
            onClick={() => onExtraSectionsChange([...extraSections, newExtraSection()])}
          >
            <Icon name="plus" size={14} /> Ajouter une section
          </button>
        </div>

        {extraSections.length === 0 && (
          <p className="adm-lines-empty">Aucune section extra — idéal pour INCI, précautions, garanties…</p>
        )}

        {extraSections.map((section, index) => (
          <div key={section.id} className="adm-extra-section">
            <div className="adm-extra-section-head">
              <span className="adm-variant-index">Section {index + 1}</span>
              <div className="adm-extra-section-actions">
                <label className="adm-extra-enabled">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => patchExtra(section.id, { enabled: e.target.checked })}
                  />
                  Afficher
                </label>
                <button type="button" className="adm-iconbtn sm" onClick={() => removeExtra(section.id)}>
                  <Icon name="trash" size={14} color="var(--tone-pink)" />
                </button>
              </div>
            </div>

            <div className="adm-variant-grid">
              <label className="adm-variant-field">
                <span>Titre</span>
                <input
                  className="ab-input"
                  value={section.title}
                  placeholder="Composition INCI, Précautions…"
                  onChange={(e) => patchExtra(section.id, { title: e.target.value })}
                />
              </label>
              <label className="adm-variant-field">
                <span>Type</span>
                <select
                  className="ab-input"
                  value={section.type}
                  onChange={(e) =>
                    patchExtra(section.id, {
                      type: e.target.value as ProductExtraSection["type"],
                    })
                  }
                >
                  <option value="text">Texte libre</option>
                  <option value="steps">Étapes numérotées</option>
                  <option value="list">Liste à puces</option>
                </select>
              </label>
            </div>

            {section.type === "text" ? (
              <textarea
                className="ab-input textarea"
                value={section.body}
                placeholder="Contenu de la section…"
                onChange={(e) => patchExtra(section.id, { body: e.target.value })}
              />
            ) : (
              <LinesEditor
                label={section.type === "steps" ? "Étapes" : "Éléments"}
                placeholder="Une ligne par élément"
                lines={section.items}
                onChange={(items) => patchExtra(section.id, { items })}
                numbered={section.type === "steps"}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
