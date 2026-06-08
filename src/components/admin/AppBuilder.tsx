"use client";

import { useState, useRef } from "react";
import { useHomeSectionsStore } from "@/lib/stores/home-sections-store";
import { SECTION_SCHEMA_REGISTRY } from "@/lib/section-registry";
import type { HomeSection } from "@/lib/home-sections";
import { Icon } from "@/components/shared/Icon";

/* ── icon + color per section type ─────────────────────────────────── */
const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  hero:       { icon: "sparkle", color: "#B8902B", bg: "rgba(212,175,55,.14)" },
  trust:      { icon: "check",   color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
  products:   { icon: "bag",     color: "#C2557A", bg: "rgba(194,85,122,.14)" },
  routine:    { icon: "heart",   color: "#C2557A", bg: "rgba(194,85,122,.14)" },
  promo:      { icon: "flame",   color: "#C77A33", bg: "rgba(199,122,51,.14)" },
  bento:      { icon: "grid",    color: "#3B7DD8", bg: "rgba(59,125,216,.14)" },
  quote:      { icon: "info",    color: "#7C756B", bg: "rgba(124,117,107,.14)" },
  reviews:    { icon: "star",    color: "#B8902B", bg: "rgba(212,175,55,.14)" },
  reels:      { icon: "play",    color: "#C2557A", bg: "rgba(194,85,122,.14)" },
  newsletter: { icon: "bell",    color: "#3B7DD8", bg: "rgba(59,125,216,.14)" },
};

/* ── Section editor modal ───────────────────────────────────────────── */
function SectionEditor({ section, onClose, onSave }: {
  section: HomeSection;
  onClose: () => void;
  onSave: (patch: Partial<HomeSection>) => void;
}) {
  const schema = SECTION_SCHEMA_REGISTRY[section.type];
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    schema.fields.forEach((f) => {
      const v = section[f.key];
      init[f.key] = v !== undefined && v !== null ? String(v) : "";
    });
    return init;
  });

  function handleSave() {
    const patch: Partial<HomeSection> = {};
    schema.fields.forEach((f) => {
      if (f.type === "boolean") return;
      (patch as Record<string, string>)[f.key as string] = form[f.key] ?? "";
    });
    onSave(patch);
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Modifier · {schema.label}</div>
          <button className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>

        {schema.fields.map((field) => (
          <div key={String(field.key)} className="ab-field">
            <label>{field.label}{field.required && <span style={{ color: "var(--tone-pink)", marginLeft: 4 }}>*</span>}</label>
            {field.type === "textarea" ? (
              <textarea
                className="ab-input textarea"
                value={form[field.key] ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder ?? ""}
              />
            ) : field.type === "select" && field.options ? (
              <select
                className="ab-input"
                value={form[field.key] ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
              >
                {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                className="ab-input"
                type="text"
                value={form[field.key] ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder ?? ""}
              />
            )}
            {field.helpText && (
              <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 4 }}>{field.helpText}</div>
            )}
          </div>
        ))}

        <div className="ab-modal-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button className="adm-btn gold" onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

/* ── Toggle switch ──────────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="ab-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="ab-toggle-track" />
      <div className="ab-toggle-thumb" />
    </label>
  );
}

/* ── Drag-handle dots ───────────────────────────────────────────────── */
function DragHandle() {
  return (
    <div className="ab-drag" title="Glisser pour réordonner">
      <span /><span /><span /><span /><span /><span />
    </div>
  );
}

/* ── Phone preview placeholder ──────────────────────────────────────── */
function PhonePreview({ sections }: { sections: HomeSection[] }) {
  const enabled = sections.filter((s) => s.enabled);
  return (
    <div className="ab-preview-panel">
      <div className="ab-preview-head">
        <div className="ab-preview-title">
          <span className="ab-preview-live" />
          Aperçu en direct
        </div>
        <button className="adm-iconbtn" title="Rafraîchir" style={{ width: 30, height: 30, borderRadius: 8 }}>
          <Icon name="clock" size={15} />
        </button>
      </div>
      <div className="ab-phone-frame">
        <div className="ab-phone-notch" />
        <div className="ab-phone-screen">
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", height: "100%" }}>
            {enabled.map((sec) => {
              const m = TYPE_META[sec.type] ?? { icon: "sparkle", color: "#B8902B", bg: "rgba(212,175,55,.14)" };
              return (
                <div key={sec.id} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: m.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name={m.icon} size={12} color={m.color} />
                  </div>
                  <span style={{ fontSize: 11, color: "#F6F1EA", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sec.name}</span>
                </div>
              );
            })}
            {enabled.length === 0 && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)", fontSize: 12 }}>Aucune section active</div>
            )}
          </div>
        </div>
      </div>
      <div className="ab-phone-caption">
        Les changements apparaissent instantanément. <b>Publiez</b> pour les rendre visibles aux clientes.
      </div>
    </div>
  );
}

/* ── Main App Builder component ─────────────────────────────────────── */
export function AppBuilder() {
  const store = useHomeSectionsStore();
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);

  // Draft workflow
  const sections = store.draft ?? store.published;
  const hasDraft = store.draft !== null;

  // Ensure we're in draft mode when interacting
  function ensureDraft() {
    if (!store.draft) store.beginDraft();
  }

  // Drag state
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function onDragStart(id: string) {
    dragId.current = id;
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  function onDrop(targetId: string) {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) { setDragOverId(null); return; }
    ensureDraft();
    // Reorder by moving fromId before targetId
    const arr = [...sections];
    const fromIdx = arr.findIndex((s) => s.id === fromId);
    const toIdx   = arr.findIndex((s) => s.id === targetId);
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    // Apply via multiple moves (store uses up/down, so we'll directly update draft)
    useHomeSectionsStore.setState({ draft: arr });
    dragId.current = null;
    setDragOverId(null);
  }

  function onDragEnd() {
    dragId.current = null;
    setDragOverId(null);
  }

  function handleToggle(id: string) {
    ensureDraft();
    store.toggleDraftSection(id);
  }

  function handleEdit(sec: HomeSection) {
    ensureDraft();
    setEditingSection(sec);
  }

  function handleSaveEdit(patch: Partial<HomeSection>) {
    if (!editingSection) return;
    store.updateDraftSection(editingSection.id, patch);
    setEditingSection(null);
  }

  function handlePublish() {
    store.publishDraft();
  }

  function handleDiscard() {
    store.discardDraft();
  }

  const activeCount = sections.filter((s) => s.enabled).length;

  return (
    <>
      <div className="adm-content">
        {/* Header */}
        <div className="adm-topbar">
          <div>
            <div className="adm-page-eyebrow"><span className="dot" />ÉDITEUR VISUEL · SANS CODE</div>
            <h1 className="adm-h1">Personnaliser l&apos;app</h1>
          </div>
          <div className="ab-publish-bar">
            {hasDraft && (
              <button className="adm-btn ghost sm" onClick={handleDiscard}>Ignorer</button>
            )}
            <button
              className={`adm-btn gold${!hasDraft ? " is-disabled" : ""}`}
              onClick={handlePublish}
            >
              <Icon name="check" size={16} />
              Publier
              <Icon name="check" size={16} />
            </button>
          </div>
        </div>

        {hasDraft && (
          <div style={{ background: "rgba(212,175,55,.1)", border: "1px solid rgba(212,175,55,.3)", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "var(--adm-gold)", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="alert" size={16} color="var(--adm-gold)" />
            Modifications en attente — publiez pour les rendre visibles aux clientes.
          </div>
        )}

        {/* Body */}
        <div className="ab-layout">
          {/* Section list */}
          <div>
            <div className="adm-card" style={{ padding: "20px 20px 12px" }}>
              <div className="ab-list-head">
                <div>
                  <div className="ab-list-title">Sections de l&apos;accueil</div>
                  <div className="ab-list-sub">{activeCount}/{sections.length} actives · glissez pour réordonner</div>
                </div>
                <button className="adm-btn ghost sm">
                  <Icon name="plus" size={15} />
                  Ajouter
                </button>
              </div>

              {sections.map((sec) => {
                const m = TYPE_META[sec.type] ?? { icon: "sparkle", color: "#B8902B", bg: "rgba(212,175,55,.14)" };
                const schema = SECTION_SCHEMA_REGISTRY[sec.type];
                return (
                  <div
                    key={sec.id}
                    className={`ab-row${dragOverId === sec.id ? " drag-over" : ""}`}
                    draggable
                    onDragStart={() => onDragStart(sec.id)}
                    onDragOver={(e) => onDragOver(e, sec.id)}
                    onDrop={() => onDrop(sec.id)}
                    onDragEnd={onDragEnd}
                  >
                    <DragHandle />

                    <div className="ab-sec-icon" style={{ background: m.bg }}>
                      <Icon name={m.icon} size={18} color={m.color} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ab-sec-name">{sec.name}</div>
                      <div className="ab-sec-meta">
                        <span className="ab-sec-tag">{schema.label}</span>
                        {sec.variant && <><span style={{ color: "var(--adm-border)" }}>·</span><span className="ab-sec-tag" style={{ textTransform: "capitalize" }}>{sec.variant}</span></>}
                      </div>
                    </div>

                    <div className="ab-row-actions">
                      <button className="adm-iconbtn sm" title="Modifier" onClick={() => handleEdit(sec)}>
                        <Icon name="edit" size={14} />
                      </button>
                      <button className="adm-iconbtn sm" title="Dupliquer">
                        <Icon name="share" size={14} />
                      </button>
                      <button className="adm-iconbtn sm" title="Supprimer" style={{ color: "var(--tone-pink)" }}>
                        <Icon name="trash" size={14} />
                      </button>
                      <Toggle checked={sec.enabled} onChange={() => handleToggle(sec.id)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phone preview */}
          <PhonePreview sections={sections} />
        </div>
      </div>

      {/* Section editor modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
