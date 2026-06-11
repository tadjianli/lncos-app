"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { ProductPageBlockEditor } from "@/components/admin/ProductPageBlockEditor";
import {
  ADDABLE_BLOCK_TYPES,
  ADDABLE_MERCHANT_ORDER,
  PRODUCT_PAGE_BLOCK_REGISTRY,
  merchantBlockLabel,
  newCustomBlock,
  productBlockMeta,
  reindexBlocks,
  createBlockOfType,
  useProductPageLayoutAdmin,
  type ProductPageBlock,
  type ProductPageBlockType,
  type ProductPageZone,
} from "@/lib/product-page-builder";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="ab-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="ab-toggle-track" />
      <div className="ab-toggle-thumb" />
    </label>
  );
}

function DragHandle() {
  return (
    <div className="ab-drag" title="Glisser pour réordonner">
      <span /><span /><span /><span /><span /><span />
    </div>
  );
}

function PhonePreview({ blocks }: { blocks: ProductPageBlock[] }) {
  const enabled = useMemo(() => {
    const main = blocks
      .filter((b) => b.zone === "main" && b.enabled)
      .sort((a, b) => a.position - b.position);
    const sticky = blocks
      .filter((b) => b.zone === "sticky" && b.enabled)
      .sort((a, b) => a.position - b.position);
    return [...main, ...sticky];
  }, [blocks]);

  return (
    <div className="ab-preview-panel">
      <div className="ab-preview-head">
        <div className="ab-preview-title">
          <span className="ab-preview-live" />
          Aperçu en direct
        </div>
        <button
          type="button"
          className="adm-iconbtn"
          title="Rafraîchir"
          style={{ width: 30, height: 30, borderRadius: 8 }}
        >
          <Icon name="clock" size={15} />
        </button>
      </div>
      <div className="ab-phone-frame">
        <div className="ab-phone-notch" />
        <div className="ab-phone-screen">
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              overflowY: "auto",
              height: "100%",
            }}
          >
            {enabled.map((block) => {
              const m = productBlockMeta(block.type);
              return (
                <div
                  key={block.id}
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: m.bg,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={m.icon} size={12} color={m.color} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#F6F1EA",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {merchantBlockLabel(block.type)}
                  </span>
                </div>
              );
            })}
            {enabled.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,.3)",
                  fontSize: 12,
                }}
              >
                Aucune section active
              </div>
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

function AddSectionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (type: ProductPageBlockType) => void;
}) {
  const options = ADDABLE_MERCHANT_ORDER.filter((t) => ADDABLE_BLOCK_TYPES.includes(t));

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div
        className="ab-modal"
        style={{ maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ab-modal-head">
          <div className="ab-modal-title">Ajouter une section</div>
          <button type="button" className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "4px 0 12px",
          }}
        >
          {options.map((type) => {
            const m = productBlockMeta(type);
            const label = merchantBlockLabel(type);
            const schema = PRODUCT_PAGE_BLOCK_REGISTRY[type];
            return (
              <button key={type} type="button" className="ab-add-type-row" onClick={() => onAdd(type)}>
                <div className="ab-sec-icon" style={{ background: m.bg, flexShrink: 0 }}>
                  <Icon name={m.icon} size={18} color={m.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--adm-ink)" }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginTop: 2 }}>
                    {schema.description}
                  </div>
                </div>
                <Icon name="chevR" size={14} color="var(--adm-ink-mute)" />
              </button>
            );
          })}
        </div>
        <div className="ab-modal-foot">
          <button type="button" className="adm-btn ghost" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function displayBlocks(blocks: ProductPageBlock[]): ProductPageBlock[] {
  const main = blocks.filter((b) => b.zone === "main").sort((a, b) => a.position - b.position);
  const sticky = blocks.filter((b) => b.zone === "sticky").sort((a, b) => a.position - b.position);
  return [...main, ...sticky];
}

export function ProductPageBuilderModule() {
  const {
    published,
    draft: dbDraft,
    loading,
    beginDraft,
    saveDraft,
    publishDraft,
    discardDraft,
  } = useProductPageLayoutAdmin();

  const [localDraft, setLocalDraft] = useState<ProductPageBlock[] | null>(null);
  const [editingBlock, setEditingBlock] = useState<ProductPageBlock | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (dbDraft !== null && localDraft === null) setLocalDraft(dbDraft);
  }, [dbDraft, localDraft]);

  const blocks = localDraft ?? published;
  const sections = displayBlocks(blocks);
  const hasDraft = localDraft !== null;

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

  function onDragStart(id: string) {
    dragId.current = id;
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  async function onDrop(targetId: string) {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) {
      setDragOverId(null);
      return;
    }
    const draft = await ensureDraft();
    const from = draft.find((b) => b.id === fromId);
    const target = draft.find((b) => b.id === targetId);
    if (!from || !target || from.zone !== target.zone) {
      dragId.current = null;
      setDragOverId(null);
      return;
    }
    const zone: ProductPageZone = from.zone;
    const zoneBlocks = draft.filter((b) => b.zone === zone);
    const others = draft.filter((b) => b.zone !== zone);
    const arr = [...zoneBlocks];
    const fromIdx = arr.findIndex((b) => b.id === fromId);
    const toIdx = arr.findIndex((b) => b.id === targetId);
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    await persist([...others, ...arr.map((b, i) => ({ ...b, position: i }))]);
    dragId.current = null;
    setDragOverId(null);
  }

  function onDragEnd() {
    dragId.current = null;
    setDragOverId(null);
  }

  async function handleToggle(id: string) {
    const draft = await ensureDraft();
    await persist(draft.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  }

  async function handleEdit(block: ProductPageBlock) {
    await ensureDraft();
    setEditingBlock(block);
  }

  async function handleSaveEdit(patch: Partial<ProductPageBlock>) {
    if (!editingBlock) return;
    const draft = await ensureDraft();
    await persist(draft.map((b) => (b.id === editingBlock.id ? { ...b, ...patch } : b)));
    setEditingBlock(null);
  }

  async function handlePublish() {
    if (!localDraft) {
      showToast("Aucune modification à publier");
      return;
    }
    const { error } = await publishDraft(localDraft, "");
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
    const block = draft.find((b) => b.id === id);
    if (!block || block.type !== "custom") {
      showToast("Seules les sections « Texte libre » peuvent être dupliquées", "error");
      return;
    }
    const zoneBlocks = draft.filter((b) => b.zone === block.zone).sort((a, b) => a.position - b.position);
    const idx = zoneBlocks.findIndex((b) => b.id === id);
    const copy: ProductPageBlock = {
      ...block,
      id: `ppb-custom-${Date.now().toString(36)}`,
      title: `${merchantBlockLabel(block.type)} (copie)`,
      enabled: false,
      settings: { ...block.settings },
    };
    const others = draft.filter((b) => b.zone !== block.zone);
    const arr = [...zoneBlocks];
    arr.splice(idx + 1, 0, copy);
    await persist([...others, ...arr.map((b, i) => ({ ...b, position: i }))]);
    showToast("Section dupliquée");
  }

  async function handleDelete(id: string) {
    const draft = await ensureDraft();
    const block = draft.find((b) => b.id === id);
    if (block && PRODUCT_PAGE_BLOCK_REGISTRY[block.type].locked) {
      showToast("Masquez cette section plutôt que de la supprimer", "error");
      setConfirmDeleteId(null);
      return;
    }
    await persist(draft.filter((b) => b.id !== id));
    showToast("Section supprimée");
    setConfirmDeleteId(null);
  }

  async function handleAddSection(type: ProductPageBlockType) {
    const draft = await ensureDraft();
    const zone = PRODUCT_PAGE_BLOCK_REGISTRY[type].zone;
    if (type !== "custom" && draft.some((b) => b.type === type && b.zone === zone)) {
      showToast("Cette section est déjà sur la page", "error");
      setAddingSection(false);
      return;
    }
    const zoneCount = draft.filter((b) => b.zone === zone).length;
    const newBlock =
      type === "custom" ? newCustomBlock(zoneCount) : createBlockOfType(type, zoneCount);
    await persist([...draft, { ...newBlock, enabled: false }]);
    showToast(`Section « ${merchantBlockLabel(type)} » ajoutée`);
    setAddingSection(false);
  }

  const activeCount = blocks.filter((b) => b.enabled).length;

  if (loading) {
    return (
      <div className="adm-content">
        <p className="adm-sub">Chargement…</p>
      </div>
    );
  }

  return (
    <>
      <div className="adm-content">
        <div className="adm-topbar">
          <div>
            <div className="adm-page-eyebrow">
              <span className="dot" />
              ÉDITEUR VISUEL · SANS CODE
            </div>
            <h1 className="adm-h1">Personnaliser l&apos;app</h1>
          </div>
          <div className="ab-publish-bar">
            {hasDraft && (
              <button type="button" className="adm-btn ghost sm" onClick={() => void handleDiscard()}>
                Ignorer
              </button>
            )}
            <button
              type="button"
              className={`adm-btn gold${!hasDraft ? " is-disabled" : ""}`}
              onClick={() => void handlePublish()}
              disabled={!hasDraft}
            >
              <Icon name="check" size={16} />
              Publier
              <Icon name="check" size={16} />
            </button>
          </div>
        </div>

        {hasDraft && (
          <div
            style={{
              background: "rgba(212,175,55,.1)",
              border: "1px solid rgba(212,175,55,.3)",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 13,
              color: "var(--adm-gold)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon name="alert" size={16} color="var(--adm-gold)" />
            Modifications en attente — publiez pour les rendre visibles aux clientes.
          </div>
        )}

        <div className="ab-layout">
          <div>
            <div className="adm-card" style={{ padding: "20px 20px 12px" }}>
              <div className="ab-list-head">
                <div>
                  <div className="ab-list-title">Sections · Fiche produit</div>
                  <div className="ab-list-sub">
                    {activeCount}/{sections.length} actives · glissez pour réordonner
                  </div>
                </div>
                <button type="button" className="adm-btn ghost sm" onClick={() => setAddingSection(true)}>
                  <Icon name="plus" size={15} />
                  Ajouter
                </button>
              </div>

              {sections.map((block) => {
                const m = productBlockMeta(block.type);
                const label = merchantBlockLabel(block.type);
                const locked = PRODUCT_PAGE_BLOCK_REGISTRY[block.type].locked;
                return (
                  <div
                    key={block.id}
                    className={`ab-row${dragOverId === block.id ? " drag-over" : ""}${!block.enabled ? " is-off" : ""}`}
                    draggable
                    onDragStart={() => onDragStart(block.id)}
                    onDragOver={(e) => onDragOver(e, block.id)}
                    onDrop={() => void onDrop(block.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => void handleEdit(block)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        void handleEdit(block);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <DragHandle />

                    <div className="ab-sec-icon" style={{ background: m.bg }}>
                      <Icon name={m.icon} size={18} color={m.color} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ab-sec-name">{label}</div>
                      {block.zone === "sticky" && (
                        <div className="ab-sec-meta">
                          <span className="ab-sec-tag">Bas de l&apos;écran</span>
                        </div>
                      )}
                    </div>

                    <div className="ab-row-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="adm-iconbtn sm"
                        title="Modifier"
                        onClick={() => void handleEdit(block)}
                      >
                        <Icon name="edit" size={14} />
                      </button>
                      {!locked && (
                        <button
                          type="button"
                          className="adm-iconbtn sm"
                          title="Dupliquer"
                          onClick={() => void handleDuplicate(block.id)}
                        >
                          <Icon name="share" size={14} />
                        </button>
                      )}
                      {!locked &&
                        (confirmDeleteId === block.id ? (
                          <button
                            type="button"
                            className="adm-iconbtn sm"
                            title="Confirmer la suppression"
                            style={{
                              color: "var(--tone-pink)",
                              fontWeight: 700,
                              fontSize: 10,
                              width: "auto",
                              padding: "0 6px",
                            }}
                            onClick={() => void handleDelete(block.id)}
                          >
                            Confirmer
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="adm-iconbtn sm"
                            title="Supprimer"
                            style={{ color: "var(--tone-pink)" }}
                            onClick={() => setConfirmDeleteId(block.id)}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        ))}
                      <Toggle checked={block.enabled} onChange={() => void handleToggle(block.id)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <PhonePreview blocks={blocks} />
        </div>
      </div>

      {editingBlock && (
        <ProductPageBlockEditor
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
          onSave={(patch) => void handleSaveEdit(patch)}
        />
      )}
      {addingSection && (
        <AddSectionModal onClose={() => setAddingSection(false)} onAdd={(t) => void handleAddSection(t)} />
      )}
      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}
    </>
  );
}
