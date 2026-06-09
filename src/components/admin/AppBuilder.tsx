"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabasePageSections } from "@/lib/admin-supabase";
import { SECTION_SCHEMA_REGISTRY } from "@/lib/section-registry";
import type { HomeSection, PageSlug, SectionType } from "@/lib/home-sections";
import { ALLOWED_TYPES_BY_PAGE, APP_PAGES, previewPath } from "@/lib/page-sections";
import { Icon } from "@/components/shared/Icon";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";

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
  categories: { icon: "grid",    color: "#3B7DD8", bg: "rgba(59,125,216,.14)" },
  cta:        { icon: "arrowR",  color: "#C2557A", bg: "rgba(194,85,122,.14)" },
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

/* ── Add section modal ──────────────────────────────────────────────── */
function AddSectionModal({ onClose, onAdd, pageSlug }: {
  onClose: () => void;
  onAdd: (type: SectionType) => void;
  pageSlug: PageSlug;
}) {
  const allowed = new Set(ALLOWED_TYPES_BY_PAGE[pageSlug]);
  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" style={{ maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Ajouter une section</div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: "4px 0 12px" }}>
          {(Object.entries(SECTION_SCHEMA_REGISTRY) as [SectionType, typeof SECTION_SCHEMA_REGISTRY[SectionType]][])
            .filter(([type]) => allowed.has(type))
            .map(([type, schema]) => {
            const m = TYPE_META[type] ?? { icon: "sparkle", color: "#B8902B", bg: "rgba(212,175,55,.14)" };
            return (
              <button key={type} className="ab-add-type-row" onClick={() => onAdd(type)}>
                <div className="ab-sec-icon" style={{ background: m.bg, flexShrink: 0 }}>
                  <Icon name={m.icon} size={18} color={m.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--adm-ink)" }}>{schema.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginTop: 2 }}>{schema.description}</div>
                </div>
                <Icon name="chevR" size={14} color="var(--adm-ink-mute)" />
              </button>
            );
          })}
        </div>
        <div className="ab-modal-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
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

/* ── Live page preview (iframe → vraie page cliente) ───────────────── */
function LivePagePreview({ pageSlug, refreshKey }: { pageSlug: PageSlug; refreshKey: number }) {
  const page = APP_PAGES.find((p) => p.slug === pageSlug);
  const src = previewPath(pageSlug);

  return (
    <div className="ab-preview-panel">
      <div className="ab-preview-head">
        <div className="ab-preview-title">
          <span className="ab-preview-live" />
          Aperçu · {page?.label ?? pageSlug}
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="adm-iconbtn"
          title="Ouvrir dans un nouvel onglet"
          style={{ width: 30, height: 30, borderRadius: 8, textDecoration: "none" }}
        >
          <Icon name="search" size={15} />
        </a>
      </div>
      <div className="ab-phone-frame">
        <div className="ab-phone-notch" />
        <div className="ab-phone-screen">
          <iframe
            key={`${pageSlug}-${refreshKey}`}
            title={`Aperçu ${page?.label ?? pageSlug}`}
            src={src}
            className="ab-phone-iframe"
          />
        </div>
      </div>
      <div className="ab-phone-caption">
        Page cliente <b>{page?.path ?? "/"}</b> — mode brouillon (<code>?preview=1</code>). <b>Publiez</b> pour mettre en ligne.
      </div>
    </div>
  );
}

/* ── Main App Builder component ─────────────────────────────────────── */
export function AppBuilder() {
  const [activePage, setActivePage] = useState<PageSlug>("home");
  const { published, draft: dbDraft, loading, isReady, beginDraft, saveDraft, publishDraft, discardDraft } = useSupabasePageSections(activePage);
  const [localDraft, setLocalDraft] = useState<HomeSection[] | null>(null);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewRefresh, setPreviewRefresh] = useState(0);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);
  const activePageMeta = APP_PAGES.find((p) => p.slug === activePage);

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2800);
  }

  function bumpPreview() {
    setPreviewRefresh((n) => n + 1);
  }

  useEffect(() => {
    setLocalDraft(null);
    setEditingSection(null);
    setConfirmDeleteId(null);
    setAddingSection(false);
  }, [activePage]);

  useEffect(() => {
    if (!isReady || dbDraft === null || localDraft !== null) return;
    const matchesPage = dbDraft.every((s) => (s.pageSlug ?? activePage) === activePage);
    if (matchesPage) setLocalDraft(dbDraft);
  }, [dbDraft, localDraft, activePage, isReady]);

  const sections = isReady ? (localDraft ?? published) : [];
  const hasDraft = localDraft !== null;

  async function ensureDraft(): Promise<HomeSection[]> {
    if (localDraft !== null) return localDraft;
    const next = [...published];
    setLocalDraft(next);
    const { error } = await beginDraft(next);
    if (error) showToast(`Erreur brouillon : ${error}`, "error");
    return next;
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

  async function onDrop(targetId: string) {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) { setDragOverId(null); return; }
    const draft = await ensureDraft();
    const arr = [...draft];
    const fromIdx = arr.findIndex((s) => s.id === fromId);
    const toIdx   = arr.findIndex((s) => s.id === targetId);
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    setLocalDraft(arr);
    const { error } = await saveDraft(arr);
    if (error) showToast(`Erreur sauvegarde : ${error}`, "error");
    else bumpPreview();
    dragId.current = null;
    setDragOverId(null);
  }

  function onDragEnd() {
    dragId.current = null;
    setDragOverId(null);
  }

  async function handleToggle(id: string) {
    const draft = await ensureDraft();
    const updated = draft.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setLocalDraft(updated);
    const { error } = await saveDraft(updated);
    if (error) showToast(`Erreur sauvegarde : ${error}`, "error");
    else bumpPreview();
  }

  async function handleEdit(sec: HomeSection) {
    await ensureDraft();
    setEditingSection(sec);
  }

  async function handleSaveEdit(patch: Partial<HomeSection>) {
    if (!editingSection) return;
    const draft = await ensureDraft();
    const updated = draft.map((s) =>
      s.id === editingSection.id ? { ...s, ...patch } : s
    );
    setLocalDraft(updated);
    const { error } = await saveDraft(updated);
    if (error) showToast(`Erreur sauvegarde : ${error}`, "error");
    else bumpPreview();
    setEditingSection(null);
  }

  async function handlePublish() {
    if (!localDraft) {
      showToast("Aucune modification à publier");
      return;
    }
    const { error } = await publishDraft(localDraft);
    if (error) {
      showToast(`Échec publication : ${error}`, "error");
      return;
    }
    setLocalDraft(null);
    bumpPreview();
    showToast(`Publié — visible sur ${activePageMeta?.path ?? activePage}`);
  }

  async function handleDiscard() {
    const { error } = await discardDraft();
    if (error) showToast(`Erreur : ${error}`, "error");
    setLocalDraft(null);
    showToast("Modifications ignorées");
  }

  async function handleDuplicate(id: string) {
    const draft = await ensureDraft();
    const idx = draft.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const copy: HomeSection = {
      ...draft[idx],
      id: `${draft[idx].type}-${Date.now()}`,
      name: `${draft[idx].name} (copie)`,
      enabled: false,
    };
    const arr = [...draft];
    arr.splice(idx + 1, 0, copy);
    setLocalDraft(arr);
    const { error } = await saveDraft(arr);
    if (error) showToast(`Erreur sauvegarde : ${error}`, "error");
    else { bumpPreview(); showToast("Section dupliquée"); }
  }

  async function handleDelete(id: string) {
    const draft = await ensureDraft();
    const arr = draft.filter((s) => s.id !== id);
    setLocalDraft(arr);
    const { error } = await saveDraft(arr);
    if (error) showToast(`Erreur sauvegarde : ${error}`, "error");
    else { bumpPreview(); showToast("Section supprimée"); }
    setConfirmDeleteId(null);
  }

  async function handleAddSection(type: SectionType) {
    const draft = await ensureDraft();
    const schema = SECTION_SCHEMA_REGISTRY[type];
    const newSec: HomeSection = {
      id: `${type}-${Date.now()}`,
      pageSlug: activePage,
      type,
      name: schema.label,
      enabled: false,
      variant: (schema.fields.find((f) => f.key === "variant")?.options?.[0]) ?? "default",
      title: "",
      device: "all",
      audience: "all",
      schedule: { enabled: false, start: "", end: "" },
    };
    const arr = [...draft, newSec];
    setLocalDraft(arr);
    const { error } = await saveDraft(arr);
    if (error) showToast(`Erreur sauvegarde : ${error}`, "error");
    else { bumpPreview(); showToast(`Section « ${schema.label} » ajoutée`); }
    setAddingSection(false);
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
              type="button"
              className={`adm-btn gold${!hasDraft ? " is-disabled" : ""}`}
              onClick={handlePublish}
              disabled={!hasDraft}
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

        <div className="adm-card" style={{ padding: "10px 12px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {APP_PAGES.map((p) => (
            <button
              key={p.slug}
              type="button"
              className={`adm-btn sm${activePage === p.slug ? " gold" : " ghost"}`}
              onClick={() => setActivePage(p.slug)}
            >
              {p.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--adm-ink-mute)" }}>
            {activePageMeta?.path}
            {loading && " · chargement…"}
          </span>
          <a
            href={previewPath(activePage)}
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn ghost sm"
            style={{ textDecoration: "none" }}
          >
            <Icon name="search" size={14} /> Aperçu live
          </a>
        </div>

        {/* Body */}
        <div className="ab-layout">
          {/* Section list */}
          <div>
            <div className="adm-card" style={{ padding: "20px 20px 12px" }}>
              <div className="ab-list-head">
                <div>
                  <div className="ab-list-title">Sections · {APP_PAGES.find((p) => p.slug === activePage)?.label}</div>
                  <div className="ab-list-sub">{activeCount}/{sections.length} actives · glissez pour réordonner</div>
                </div>
                <button className="adm-btn ghost sm" onClick={() => setAddingSection(true)}>
                  <Icon name="plus" size={15} />
                  Ajouter
                </button>
              </div>

              {loading && (
                <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--adm-ink-mute)" }}>
                  Chargement des sections {activePageMeta?.label}…
                </div>
              )}

              {!loading && sections.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--adm-ink-mute)" }}>
                  Aucune section — ajoutez-en une pour personnaliser {activePageMeta?.path}.
                </div>
              )}

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
                      <button className="adm-iconbtn sm" title="Dupliquer" onClick={() => handleDuplicate(sec.id)}>
                        <Icon name="share" size={14} />
                      </button>
                      {confirmDeleteId === sec.id ? (
                        <button className="adm-iconbtn sm" title="Confirmer la suppression" style={{ color: "var(--tone-pink)", fontWeight: 700, fontSize: 10, width: "auto", padding: "0 6px" }} onClick={() => handleDelete(sec.id)}>
                          Confirmer
                        </button>
                      ) : (
                        <button className="adm-iconbtn sm" title="Supprimer" style={{ color: "var(--tone-pink)" }} onClick={() => setConfirmDeleteId(sec.id)}>
                          <Icon name="trash" size={14} />
                        </button>
                      )}
                      <Toggle checked={sec.enabled} onChange={() => handleToggle(sec.id)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live preview — vraie page cliente */}
          <LivePagePreview pageSlug={activePage} refreshKey={previewRefresh} />
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
      {addingSection && (
        <AddSectionModal pageSlug={activePage} onClose={() => setAddingSection(false)} onAdd={handleAddSection} />
      )}
      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}
    </>
  );
}
