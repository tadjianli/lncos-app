"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSupabasePageSections } from "@/lib/admin-supabase";
import { SECTION_SCHEMA_REGISTRY } from "@/lib/section-registry";
import type { HomeSection, PageSlug, SectionType } from "@/lib/home-sections";
import { ALLOWED_TYPES_BY_PAGE, APP_PAGES, previewPath } from "@/lib/page-sections";
import { Icon } from "@/components/shared/Icon";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { HeroLivePreview } from "@/components/admin/HeroLivePreview";

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
  transformations: { icon: "camera", color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
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

  const isHero = section.type === "hero";
  const liveHeroSection: HomeSection = isHero
    ? {
        ...section,
        title: form.title ?? section.title,
        titleAccent: form.titleAccent ?? section.titleAccent,
        eyebrow: form.eyebrow ?? section.eyebrow,
        cta: form.cta ?? section.cta,
        img: form.img ?? section.img,
      }
    : section;

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div
        className={`ab-modal${isHero ? " ab-modal-wide ab-modal-scroll" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
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
            ) : field.type === "image" ? (
              <AdminImageUpload
                value={form[field.key] ?? ""}
                onChange={(url) => setForm((p) => ({ ...p, [field.key]: url }))}
                label={field.label}
                folder="sections"
                helpText={field.helpText}
              />
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

        {isHero && <HeroLivePreview section={liveHeroSection} />}

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

export interface AppBuilderProps {
  pageSlug?: PageSlug;
  /** Mode compact pour intégration dans d'autres modules admin */
  embedded?: boolean;
}

export function AppBuilder({ pageSlug = "home", embedded = false }: AppBuilderProps) {
  const router = useRouter();
  const pageMeta = APP_PAGES.find((p) => p.slug === pageSlug);
  const pageLabel = pageMeta?.label ?? pageSlug;
  const { published, draft: dbDraft, beginDraft, saveDraft, publishDraft, discardDraft } = useSupabasePageSections(pageSlug);
  const [localDraft, setLocalDraft] = useState<HomeSection[] | null>(null);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2800);
  }

  useEffect(() => {
    if (dbDraft !== null && localDraft === null) {
      setLocalDraft(dbDraft);
    }
  }, [dbDraft, localDraft]);

  const sections = localDraft ?? published;
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
  }

  async function handleEdit(sec: HomeSection) {
    if (sec.type === "hero" && pageSlug === "home") {
      router.push("/admin/hero-carousel");
      return;
    }
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
    showToast("Publié — visible côté cliente");
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
    else showToast("Section dupliquée");
  }

  async function handleDelete(id: string) {
    const draft = await ensureDraft();
    const arr = draft.filter((s) => s.id !== id);
    setLocalDraft(arr);
    const { error } = await saveDraft(arr);
    if (error) showToast(`Erreur sauvegarde : ${error}`, "error");
    else showToast("Section supprimée");
    setConfirmDeleteId(null);
  }

  async function handleAddSection(type: SectionType) {
    const draft = await ensureDraft();
    const schema = SECTION_SCHEMA_REGISTRY[type];
    const newSec: HomeSection = {
      id: `${type}-${Date.now()}`,
      pageSlug,
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
    else showToast(`Section « ${schema.label} » ajoutée`);
    setAddingSection(false);
  }

  const activeCount = sections.filter((s) => s.enabled).length;

  return (
    <>
      <div className={embedded ? "" : "adm-content"}>
        {!embedded && (
          <>
            <div className="adm-topbar">
              <div>
                <div className="adm-page-eyebrow"><span className="dot" />ÉDITEUR VISUEL · SANS CODE</div>
                <h1 className="adm-h1">Personnaliser l&apos;app</h1>
              </div>
              <div className="ab-publish-bar">
                <a
                  href={previewPath(pageSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn ghost sm"
                  style={{ textDecoration: "none" }}
                >
                  <Icon name="search" size={14} /> Aperçu live
                </a>
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
              <div style={{ background: "rgba(212,175,55,.1)", border: "1px solid rgba(212,175,55,.3)", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "var(--adm-gold)", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Icon name="alert" size={16} color="var(--adm-gold)" />
                Modifications en attente — publiez pour les rendre visibles aux clientes.
              </div>
            )}

            {pageSlug === "home" && (
              <div className="adm-card" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "rgba(212,175,55,.08)", border: "1px solid rgba(212,175,55,.25)" }}>
                <div style={{ fontSize: 13, color: "var(--adm-gold)" }}>
                  Le hero accueil est un <strong>carousel</strong> (jusqu&apos;à 3 slides) — géré séparément de cette liste.
                </div>
                <a href="/admin/hero-carousel" className="adm-btn ghost sm" style={{ textDecoration: "none", flexShrink: 0 }}>
                  Ouvrir Hero Carousel
                </a>
              </div>
            )}
          </>
        )}

        {embedded && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--adm-ink)" }}>
              Sections éditoriales · {pageLabel}
            </div>
            <div className="ab-publish-bar" style={{ margin: 0 }}>
              <a
                href={previewPath(pageSlug)}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-btn ghost sm"
                style={{ textDecoration: "none" }}
              >
                <Icon name="search" size={14} /> Aperçu
              </a>
              {hasDraft && (
                <button className="adm-btn ghost sm" onClick={handleDiscard}>Ignorer</button>
              )}
              <button
                type="button"
                className={`adm-btn gold sm${!hasDraft ? " is-disabled" : ""}`}
                onClick={handlePublish}
                disabled={!hasDraft}
              >
                Publier
              </button>
            </div>
          </div>
        )}

        <div className={embedded ? "" : "ab-layout"}>
          <div>
            <div className="adm-card" style={{ padding: "20px 20px 12px" }}>
              <div className="ab-list-head">
                <div>
                  <div className="ab-list-title">Sections · {pageLabel}</div>
                  <div className="ab-list-sub">{activeCount}/{sections.length} actives · glissez pour réordonner</div>
                </div>
                <button className="adm-btn ghost sm" onClick={() => setAddingSection(true)}>
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

          {!embedded && <PhonePreview sections={sections} />}
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
        <AddSectionModal pageSlug={pageSlug} onClose={() => setAddingSection(false)} onAdd={handleAddSection} />
      )}
      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}
    </>
  );
}
