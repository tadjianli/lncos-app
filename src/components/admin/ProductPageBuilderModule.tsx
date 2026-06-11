"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { ProductPageBuilderSettingsPanel } from "@/components/admin/ProductPageBuilderSettingsPanel";
import { ProductPageBuilderPreview } from "@/components/admin/ProductPageBuilderPreview";
import {
  ADDABLE_BLOCK_TYPES,
  PRODUCT_PAGE_BLOCK_REGISTRY,
  blockVisualMeta,
  newCustomBlock,
  reindexBlocks,
  createBlockOfType,
  useProductPageLayoutAdmin,
  type ProductPageBlock,
  type ProductPageBlockType,
  type ProductPageZone,
} from "@/lib/product-page-builder";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="ppb-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="ppb-toggle-track" />
      <div className="ppb-toggle-thumb" />
    </label>
  );
}

function SectionCard({
  block,
  selected,
  dragOver,
  dragging,
  onSelect,
  onToggle,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  block: ProductPageBlock;
  selected: boolean;
  dragOver: boolean;
  dragging: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const schema = PRODUCT_PAGE_BLOCK_REGISTRY[block.type];
  const meta = blockVisualMeta(block.type);
  const locked = schema.locked;

  return (
    <div
      className={`ppb-sec-card${selected ? " is-active" : ""}${!block.enabled ? " is-off" : ""}${dragOver ? " is-drag-over" : ""}${dragging ? " is-dragging" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="ppb-sec-card-accent" style={{ background: meta.color }} />
      <div className="ppb-sec-card-drag" title="Glisser pour réordonner">
        <span /><span /><span />
      </div>
      <div className="ppb-sec-card-icon" style={{ background: meta.bg }}>
        <Icon name={meta.icon} size={18} color={meta.color} />
      </div>
      <div className="ppb-sec-card-body">
        <div className="ppb-sec-card-title">{block.title}</div>
        <div className="ppb-sec-card-desc">{schema.description}</div>
      </div>
      <div className="ppb-sec-card-actions">
        <Toggle checked={block.enabled} onChange={onToggle} />
        {!locked && (
          <button
            type="button"
            className="ppb-iconbtn"
            title="Supprimer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Icon name="trash" size={14} color="#E879A8" />
          </button>
        )}
      </div>
    </div>
  );
}

function AddBlockPanel({
  zone,
  onClose,
  onAdd,
}: {
  zone: ProductPageZone;
  onClose: () => void;
  onAdd: (type: ProductPageBlockType) => void;
}) {
  const options = ADDABLE_BLOCK_TYPES.filter(
    (type) => PRODUCT_PAGE_BLOCK_REGISTRY[type].zone === zone
  );

  return (
    <div className="ppb-add-panel">
      <div className="ppb-add-panel-head">
        <span>Ajouter une section</span>
        <button type="button" className="ppb-iconbtn" onClick={onClose}>
          <Icon name="x" size={16} />
        </button>
      </div>
      <div className="ppb-add-grid">
        {options.map((type) => {
          const schema = PRODUCT_PAGE_BLOCK_REGISTRY[type];
          const m = blockVisualMeta(type);
          return (
            <button
              key={type}
              type="button"
              className="ppb-add-card"
              onClick={() => onAdd(type)}
            >
              <div className="ppb-add-card-icon" style={{ background: m.bg }}>
                <Icon name={m.icon} size={18} color={m.color} />
              </div>
              <span className="ppb-add-card-label">{schema.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductPageBuilderModule() {
  const {
    published,
    draft: dbDraft,
    meta,
    versions,
    loading,
    beginDraft,
    saveDraft,
    publishDraft,
    discardDraft,
    restoreVersion,
  } = useProductPageLayoutAdmin();

  const [localDraft, setLocalDraft] = useState<ProductPageBlock[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<ProductPageZone>("main");
  const [addingZone, setAddingZone] = useState<ProductPageZone | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [publishNote, setPublishNote] = useState("");
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (dbDraft !== null && localDraft === null) setLocalDraft(dbDraft);
  }, [dbDraft, localDraft]);

  const blocks = localDraft ?? published;
  const hasDraft = localDraft !== null;

  const mainBlocks = useMemo(
    () => blocks.filter((b) => b.zone === "main").sort((a, b) => a.position - b.position),
    [blocks]
  );
  const stickyBlocks = useMemo(
    () => blocks.filter((b) => b.zone === "sticky").sort((a, b) => a.position - b.position),
    [blocks]
  );

  const zoneBlocks = activeZone === "main" ? mainBlocks : stickyBlocks;
  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2800);
  }

  async function ensureDraft(): Promise<ProductPageBlock[]> {
    if (localDraft !== null) return localDraft;
    const next = [...published];
    setLocalDraft(next);
    const { error } = await beginDraft(next);
    if (error) showToast(`Erreur brouillon : ${error}`, "error");
    return next;
  }

  async function persist(updated: ProductPageBlock[]) {
    const indexed = reindexBlocks(updated);
    setLocalDraft(indexed);
    const { error } = await saveDraft(indexed);
    if (error) showToast(`Erreur sauvegarde : ${error}`, "error");
  }

  async function onDrop(targetId: string, zone: ProductPageZone) {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) {
      setDragOverId(null);
      setDraggingId(null);
      return;
    }
    const draft = await ensureDraft();
    const from = draft.find((b) => b.id === fromId);
    const target = draft.find((b) => b.id === targetId);
    if (!from || !target || from.zone !== zone || target.zone !== zone) {
      dragId.current = null;
      setDragOverId(null);
      setDraggingId(null);
      return;
    }
    const zoneBlocksList = draft.filter((b) => b.zone === zone);
    const others = draft.filter((b) => b.zone !== zone);
    const arr = [...zoneBlocksList];
    const fromIdx = arr.findIndex((b) => b.id === fromId);
    const toIdx = arr.findIndex((b) => b.id === targetId);
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    await persist([...others, ...arr.map((b, i) => ({ ...b, position: i }))]);
    dragId.current = null;
    setDragOverId(null);
    setDraggingId(null);
  }

  async function handleToggle(id: string) {
    const draft = await ensureDraft();
    await persist(draft.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  }

  async function handleSaveEdit(patch: Partial<ProductPageBlock>) {
    if (!selectedId) return;
    const draft = await ensureDraft();
    await persist(draft.map((b) => (b.id === selectedId ? { ...b, ...patch } : b)));
    showToast("Paramètres appliqués");
  }

  async function handleAdd(type: ProductPageBlockType) {
    const draft = await ensureDraft();
    const zone = PRODUCT_PAGE_BLOCK_REGISTRY[type].zone;
    if (type !== "custom" && draft.some((b) => b.type === type && b.zone === zone)) {
      showToast("Ce type de section existe déjà dans cette zone", "error");
      setAddingZone(null);
      return;
    }
    const zoneCount = draft.filter((b) => b.zone === zone).length;
    const newBlock =
      type === "custom" ? newCustomBlock(zoneCount) : createBlockOfType(type, zoneCount);
    await persist([...draft, newBlock]);
    setAddingZone(null);
    setSelectedId(newBlock.id);
    setActiveZone(zone);
    showToast("Section ajoutée");
  }

  async function handleDelete(id: string) {
    const draft = await ensureDraft();
    const block = draft.find((b) => b.id === id);
    if (block && PRODUCT_PAGE_BLOCK_REGISTRY[block.type].locked) {
      showToast("Cette section système ne peut pas être supprimée", "error");
      setConfirmDeleteId(null);
      return;
    }
    await persist(draft.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    setConfirmDeleteId(null);
    showToast("Section supprimée");
  }

  function selectBlock(id: string) {
    setSelectedId(id);
    const block = blocks.find((b) => b.id === id);
    if (block) setActiveZone(block.zone);
  }

  if (loading) {
    return (
      <div className="ppb-studio ppb-studio--loading">
        <div className="ppb-loading">
          <div className="ppb-loading-spinner" />
          Chargement du builder…
        </div>
      </div>
    );
  }

  return (
    <div className="ppb-studio">
      <header className="ppb-studio-header">
        <div className="ppb-studio-header-left">
          <h1>Fiche produit</h1>
          <p>
            Layout global · v{meta.publishedVersion} publiée
            {hasDraft && <span className="ppb-draft-badge">Brouillon</span>}
          </p>
        </div>
        <div className="ppb-studio-header-actions">
          <button
            type="button"
            className="ppb-btn-ghost"
            onClick={() => setShowVersions((v) => !v)}
          >
            <Icon name="clock" size={14} /> Historique
          </button>
          {hasDraft && (
            <>
              <button
                type="button"
                className="ppb-btn-ghost"
                onClick={() =>
                  void discardDraft().then(() => {
                    setLocalDraft(null);
                    setSelectedId(null);
                    showToast("Brouillon annulé");
                  })
                }
              >
                Annuler
              </button>
              <button
                type="button"
                className="ppb-btn-gold"
                onClick={() =>
                  void publishDraft(blocks, publishNote).then(({ error }) => {
                    if (error) showToast(error, "error");
                    else {
                      setLocalDraft(null);
                      showToast("Layout publié sur toute la boutique");
                    }
                  })
                }
              >
                <Icon name="check" size={15} /> Publier
              </button>
            </>
          )}
        </div>
      </header>

      {showVersions && (
        <div className="ppb-versions-bar">
          {versions.length === 0 ? (
            <span className="ppb-versions-empty">Aucune version archivée</span>
          ) : (
            versions.map((v) => (
              <div key={v.id} className="ppb-version-chip">
                <span>v{v.versionNumber}</span>
                <span className="ppb-version-date">
                  {new Date(v.createdAt).toLocaleDateString("fr-FR")}
                </span>
                <button
                  type="button"
                  className="ppb-btn-ghost sm"
                  onClick={() =>
                    void restoreVersion(v).then(({ error }) => {
                      if (error) showToast(error, "error");
                      else showToast(`Version v${v.versionNumber} restaurée en brouillon`);
                    })
                  }
                >
                  Restaurer
                </button>
              </div>
            ))
          )}
          <button type="button" className="ppb-iconbtn" onClick={() => setShowVersions(false)}>
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      <div className="ppb-studio-body">
        {/* ── Colonne gauche : sections ── */}
        <aside className="ppb-col ppb-col--sections">
          <div className="ppb-col-head">
            <h2>Sections</h2>
            <button
              type="button"
              className="ppb-btn-ghost sm"
              onClick={() => setAddingZone(activeZone)}
            >
              <Icon name="plus" size={14} /> Ajouter
            </button>
          </div>

          <div className="ppb-zone-tabs">
            <button
              type="button"
              className={`ppb-zone-tab${activeZone === "main" ? " is-on" : ""}`}
              onClick={() => setActiveZone("main")}
            >
              Page
              <span className="ppb-zone-count">{mainBlocks.length}</span>
            </button>
            <button
              type="button"
              className={`ppb-zone-tab${activeZone === "sticky" ? " is-on" : ""}`}
              onClick={() => setActiveZone("sticky")}
            >
              Barre sticky
              <span className="ppb-zone-count">{stickyBlocks.length}</span>
            </button>
          </div>

          <p className="ppb-col-hint">
            {activeZone === "main"
              ? "Contenu scrollable de la fiche produit"
              : "Éléments fixés en bas de l'écran"}
          </p>

          <div className="ppb-sec-list">
            {zoneBlocks.map((block) => (
              <SectionCard
                key={block.id}
                block={block}
                selected={selectedId === block.id}
                dragOver={dragOverId === block.id}
                dragging={draggingId === block.id}
                onSelect={() => selectBlock(block.id)}
                onToggle={() => void handleToggle(block.id)}
                onDelete={() => setConfirmDeleteId(block.id)}
                onDragStart={() => {
                  dragId.current = block.id;
                  setDraggingId(block.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(block.id);
                }}
                onDrop={() => void onDrop(block.id, activeZone)}
                onDragEnd={() => {
                  dragId.current = null;
                  setDragOverId(null);
                  setDraggingId(null);
                }}
              />
            ))}
          </div>

          {addingZone === activeZone && (
            <AddBlockPanel
              zone={activeZone}
              onClose={() => setAddingZone(null)}
              onAdd={(t) => void handleAdd(t)}
            />
          )}
        </aside>

        {/* ── Colonne centre : paramètres ── */}
        <main className="ppb-col ppb-col--settings">
          <div className="ppb-col-head">
            <h2>Paramètres</h2>
          </div>
          <ProductPageBuilderSettingsPanel
            block={selectedBlock}
            onSave={(patch) => void handleSaveEdit(patch)}
          />
          {hasDraft && (
            <div className="ppb-publish-note">
              <label>Note de publication (optionnel)</label>
              <input
                className="ppb-input"
                placeholder="Ex. Ajout FAQ + réorganisation CTA"
                value={publishNote}
                onChange={(e) => setPublishNote(e.target.value)}
              />
            </div>
          )}
        </main>

        {/* ── Colonne droite : aperçu ── */}
        <aside className="ppb-col ppb-col--preview">
          <ProductPageBuilderPreview
            blocks={blocks}
            selectedId={selectedId}
            onSelectBlock={selectBlock}
          />
        </aside>
      </div>

      {confirmDeleteId && (
        <div className="ppb-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="ppb-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Supprimer cette section ?</h3>
            <p>Cette action sera effective après publication du layout.</p>
            <div className="ppb-modal-foot">
              <button type="button" className="ppb-btn-ghost" onClick={() => setConfirmDeleteId(null)}>
                Annuler
              </button>
              <button
                type="button"
                className="ppb-btn-danger"
                onClick={() => void handleDelete(confirmDeleteId)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}
    </div>
  );
}
