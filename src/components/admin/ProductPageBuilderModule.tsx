"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { ProductPageBlockEditor } from "@/components/admin/ProductPageBlockEditor";
import {
  ADDABLE_BLOCK_TYPES,
  PRODUCT_PAGE_BLOCK_REGISTRY,
  newCustomBlock,
  reindexBlocks,
  createBlockOfType,
  useProductPageLayoutAdmin,
  type ProductPageBlock,
  type ProductPageBlockType,
  type ProductPageZone,
} from "@/lib/product-page-builder";

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  gallery: { icon: "camera", color: "#B8902B", bg: "rgba(212,175,55,.14)" },
  product_info: { icon: "tag", color: "#C2557A", bg: "rgba(194,85,122,.14)" },
  add_to_cart: { icon: "bag", color: "#C2557A", bg: "rgba(194,85,122,.14)" },
  trust_badges: { icon: "check", color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
  reviews: { icon: "star", color: "#B8902B", bg: "rgba(212,175,55,.14)" },
  faq: { icon: "info", color: "#3B7DD8", bg: "rgba(59,125,216,.14)" },
  video: { icon: "play", color: "#C2557A", bg: "rgba(194,85,122,.14)" },
  custom: { icon: "sparkle", color: "#B8902B", bg: "rgba(212,175,55,.14)" },
};

function blockMeta(type: ProductPageBlockType) {
  return TYPE_META[type] ?? { icon: "grid", color: "#837C72", bg: "rgba(124,117,107,.14)" };
}

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

function ProductPagePreview({
  blocks,
  mode,
}: {
  blocks: ProductPageBlock[];
  mode: "mobile" | "desktop";
}) {
  const main = blocks.filter((b) => b.enabled && b.zone === "main");
  const sticky = blocks.filter((b) => b.enabled && b.zone === "sticky");

  return (
    <div className={`ppb-preview ppb-preview--${mode}`}>
      <div className={mode === "mobile" ? "ab-phone-frame" : "ppb-desktop-frame"}>
        {mode === "mobile" && <div className="ab-phone-notch" />}
        <div className={mode === "mobile" ? "ab-phone-screen" : "ppb-desktop-screen"}>
          <div className="ppb-preview-scroll">
            {main.map((block) => {
              const m = blockMeta(block.type);
              return (
                <div key={block.id} className="ppb-preview-block">
                  <div className="ppb-preview-block-icon" style={{ background: m.bg }}>
                    <Icon name={m.icon} size={12} color={m.color} />
                  </div>
                  <span>{block.title}</span>
                </div>
              );
            })}
            {main.length === 0 && (
              <div className="ppb-preview-empty">Aucun bloc actif</div>
            )}
          </div>
          {sticky.length > 0 && (
            <div className="ppb-preview-sticky">
              {sticky.map((block) => (
                <div key={block.id} className="ppb-preview-sticky-item">
                  {block.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddBlockModal({
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
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Ajouter un bloc</div>
          <button type="button" className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {options.map((type) => {
            const schema = PRODUCT_PAGE_BLOCK_REGISTRY[type];
            const m = blockMeta(type);
            return (
              <button
                key={type}
                type="button"
                className="ab-add-type-row"
                onClick={() => onAdd(type)}
              >
                <div className="ab-sec-icon" style={{ background: m.bg }}>
                  <Icon name={m.icon} size={18} color={m.color} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{schema.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)" }}>{schema.description}</div>
                </div>
              </button>
            );
          })}
        </div>
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
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [editingBlock, setEditingBlock] = useState<ProductPageBlock | null>(null);
  const [addingZone, setAddingZone] = useState<ProductPageZone | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [publishNote, setPublishNote] = useState("");
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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
      return;
    }
    const draft = await ensureDraft();
    const from = draft.find((b) => b.id === fromId);
    const target = draft.find((b) => b.id === targetId);
    if (!from || !target || from.zone !== zone || target.zone !== zone) {
      dragId.current = null;
      setDragOverId(null);
      return;
    }
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

  async function handleToggle(id: string) {
    const draft = await ensureDraft();
    await persist(draft.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  }

  async function handleSaveEdit(patch: Partial<ProductPageBlock>) {
    if (!editingBlock) return;
    const draft = await ensureDraft();
    await persist(
      draft.map((b) => (b.id === editingBlock.id ? { ...b, ...patch } : b))
    );
    setEditingBlock(null);
  }

  async function handleAdd(type: ProductPageBlockType) {
    const draft = await ensureDraft();
    const zone = PRODUCT_PAGE_BLOCK_REGISTRY[type].zone;
    if (type !== "custom" && draft.some((b) => b.type === type && b.zone === zone)) {
      showToast("Ce type de bloc existe déjà dans cette zone", "error");
      setAddingZone(null);
      return;
    }
    const zoneCount = draft.filter((b) => b.zone === zone).length;
    const newBlock =
      type === "custom" ? newCustomBlock(zoneCount) : createBlockOfType(type, zoneCount);
    await persist([...draft, newBlock]);
    setAddingZone(null);
    showToast("Bloc ajouté");
  }

  async function handleDelete(id: string) {
    const draft = await ensureDraft();
    const block = draft.find((b) => b.id === id);
    if (block && PRODUCT_PAGE_BLOCK_REGISTRY[block.type].locked) {
      showToast("Ce bloc système ne peut pas être supprimé", "error");
      setConfirmDeleteId(null);
      return;
    }
    await persist(draft.filter((b) => b.id !== id));
    setConfirmDeleteId(null);
    showToast("Bloc supprimé");
  }

  function renderBlockList(zoneBlocks: ProductPageBlock[], zone: ProductPageZone) {
    return zoneBlocks.map((block) => {
      const m = blockMeta(block.type);
      const locked = PRODUCT_PAGE_BLOCK_REGISTRY[block.type].locked;
      return (
        <div
          key={block.id}
          className={`ab-sec-row${dragOverId === block.id ? " is-drag-over" : ""}${!block.enabled ? " is-off" : ""}`}
          draggable
          onDragStart={() => { dragId.current = block.id; }}
          onDragOver={(e) => { e.preventDefault(); setDragOverId(block.id); }}
          onDrop={() => void onDrop(block.id, zone)}
          onDragEnd={() => { dragId.current = null; setDragOverId(null); }}
        >
          <DragHandle />
          <div className="ab-sec-icon" style={{ background: m.bg }}>
            <Icon name={m.icon} size={18} color={m.color} />
          </div>
          <div className="ab-sec-info">
            <div className="ab-sec-name">{block.title}</div>
            <div className="ab-sec-type">{PRODUCT_PAGE_BLOCK_REGISTRY[block.type].label}</div>
          </div>
          <Toggle checked={block.enabled} onChange={() => void handleToggle(block.id)} />
          <button
            type="button"
            className="adm-iconbtn"
            title="Paramètres"
            onClick={() => void ensureDraft().then(() => setEditingBlock(block))}
          >
            <Icon name="sliders" size={15} />
          </button>
          {!locked && (
            <button
              type="button"
              className="adm-iconbtn"
              title="Supprimer"
              onClick={() => setConfirmDeleteId(block.id)}
            >
              <Icon name="trash" size={15} color="var(--tone-pink)" />
            </button>
          )}
        </div>
      );
    });
  }

  if (loading) {
    return (
      <div className="adm-content">
        <div className="adm-sub">Chargement du layout fiche produit…</div>
      </div>
    );
  }

  return (
    <div className="adm-content ppb-module">
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Product Page Builder</h1>
          <p className="adm-sub">
            Layout global appliqué à toutes les fiches produit · version publiée v{meta.publishedVersion}
          </p>
        </div>
        <div className="ppb-toolbar-actions">
          {hasDraft && (
            <>
              <button type="button" className="adm-btn ghost" onClick={() => void discardDraft().then(() => { setLocalDraft(null); showToast("Brouillon annulé"); })}>
                Annuler
              </button>
              <button
                type="button"
                className="adm-btn gold"
                onClick={() => void publishDraft(blocks, publishNote).then(({ error }) => {
                  if (error) showToast(error, "error");
                  else {
                    setLocalDraft(null);
                    showToast("Layout publié sur toute la boutique");
                  }
                })}
              >
                <Icon name="check" size={15} /> Publier
              </button>
            </>
          )}
        </div>
      </div>

      <div className="ppb-layout-grid">
        <div className="ppb-editor-col">
          <div className="adm-card ppb-zone-card">
            <div className="ppb-zone-head">
              <h2>Contenu scrollable</h2>
              <button type="button" className="adm-btn ghost sm" onClick={() => setAddingZone("main")}>
                <Icon name="plus" size={14} /> Ajouter
              </button>
            </div>
            {renderBlockList(mainBlocks, "main")}
          </div>

          <div className="adm-card ppb-zone-card">
            <div className="ppb-zone-head">
              <h2>Barre sticky (CTA)</h2>
              <button type="button" className="adm-btn ghost sm" onClick={() => setAddingZone("sticky")}>
                <Icon name="plus" size={14} /> Ajouter
              </button>
            </div>
            {renderBlockList(stickyBlocks, "sticky")}
          </div>

          <div className="adm-card">
            <h2 className="ppb-versions-title">Historique des versions</h2>
            {versions.length === 0 ? (
              <p className="adm-sub">Aucune version archivée.</p>
            ) : (
              <ul className="ppb-versions-list">
                {versions.map((v) => (
                  <li key={v.id}>
                    <span>v{v.versionNumber}</span>
                    <span>{new Date(v.createdAt).toLocaleString("fr-FR")}</span>
                    <button
                      type="button"
                      className="adm-btn ghost sm"
                      onClick={() =>
                        void restoreVersion(v).then(({ error }) => {
                          if (error) showToast(error, "error");
                          else showToast(`Version v${v.versionNumber} restaurée en brouillon`);
                        })
                      }
                    >
                      Restaurer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="ppb-preview-col">
          <div className="ab-preview-panel">
            <div className="ab-preview-head">
              <div className="ab-preview-title">
                <span className="ab-preview-live" />
                Aperçu temps réel
              </div>
              <div className="ppb-preview-toggle">
                <button
                  type="button"
                  className={`adm-btn sm${previewMode === "mobile" ? " gold" : " ghost"}`}
                  onClick={() => setPreviewMode("mobile")}
                >
                  Mobile
                </button>
                <button
                  type="button"
                  className={`adm-btn sm${previewMode === "desktop" ? " gold" : " ghost"}`}
                  onClick={() => setPreviewMode("desktop")}
                >
                  Desktop
                </button>
              </div>
            </div>
            <ProductPagePreview blocks={blocks} mode={previewMode} />
            <input
              className="ab-input"
              placeholder="Note de publication (optionnel)"
              value={publishNote}
              onChange={(e) => setPublishNote(e.target.value)}
              style={{ marginTop: 12 }}
            />
            <p className="ab-phone-caption">
              Les blocs désactivés sont masqués côté boutique. Publiez pour appliquer à toutes les fiches produit.
            </p>
          </div>
        </div>
      </div>

      {editingBlock && (
        <ProductPageBlockEditor
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
          onSave={(patch) => void handleSaveEdit(patch)}
        />
      )}

      {addingZone && (
        <AddBlockModal zone={addingZone} onClose={() => setAddingZone(null)} onAdd={(t) => void handleAdd(t)} />
      )}

      {confirmDeleteId && (
        <div className="ab-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ab-modal-head">
              <div className="ab-modal-title">Supprimer ce bloc ?</div>
            </div>
            <p style={{ fontSize: 13, color: "var(--adm-ink-mute)" }}>Action irréversible après publication.</p>
            <div className="ab-modal-foot">
              <button type="button" className="adm-btn ghost" onClick={() => setConfirmDeleteId(null)}>Annuler</button>
              <button type="button" className="adm-btn" style={{ background: "var(--tone-pink)" }} onClick={() => void handleDelete(confirmDeleteId)}>
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
