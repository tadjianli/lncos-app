"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast } from "@/components/admin/AdminToast";
import {
  slugifyServiceCategory,
  useAdminServiceCategories,
  type ServiceCategory,
} from "@/lib/rdv-services-db";

const ICON_OPTIONS = ["scissors", "sparkle", "star", "heart", "bolt", "calendar", "gift"] as const;

function CategoryModal({
  category,
  onClose,
  onSave,
  saving,
}: {
  category?: ServiceCategory;
  onClose: () => void;
  onSave: (data: Omit<ServiceCategory, "createdAt" | "updatedAt" | "serviceCount">) => void;
  saving: boolean;
}) {
  const isNew = !category;
  const [form, setForm] = useState(() =>
    category ?? {
      id: "",
      name: "",
      slug: "",
      icon: "scissors" as string,
      color: "#D4AF37",
      sortOrder: 0,
      isActive: true,
    }
  );

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((p) => {
      const next = { ...p, [key]: val };
      if (key === "name" && isNew) {
        const slug = slugifyServiceCategory(String(val));
        next.id = slug;
        next.slug = slug;
      }
      return next;
    });
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">{isNew ? "Nouvelle catégorie" : `Modifier · ${category.name}`}</div>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Fermer">
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="ab-field">
          <label>Nom</label>
          <input className="ab-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Manucure" />
        </div>
        <div className="ab-field">
          <label>Slug URL</label>
          <input
            className="ab-input"
            value={form.slug}
            onChange={(e) => set("slug", slugifyServiceCategory(e.target.value))}
            placeholder="manucure"
          />
        </div>
        <div className="ab-field">
          <label>Icône</label>
          <select className="ab-input" value={form.icon} onChange={(e) => set("icon", e.target.value)}>
            {ICON_OPTIONS.map((ic) => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </select>
        </div>
        <div className="ab-field">
          <label>Couleur</label>
          <input className="ab-input" type="color" value={form.color} onChange={(e) => set("color", e.target.value)} />
        </div>
        <div className="ab-field" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ margin: 0 }}>Catégorie active</label>
          <label className="ab-toggle" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            <div className="ab-toggle-track" />
            <div className="ab-toggle-thumb" />
          </label>
        </div>

        <div className="ab-modal-foot">
          <button type="button" className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button
            type="button"
            className="adm-btn gold"
            disabled={saving || !form.name.trim() || !form.slug.trim()}
            onClick={() => onSave(form)}
          >
            <Icon name="check" size={15} /> {isNew ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferDeleteModal({
  category,
  others,
  onClose,
  onConfirm,
}: {
  category: ServiceCategory;
  others: ServiceCategory[];
  onClose: () => void;
  onConfirm: (transferToId: string) => void;
}) {
  const [targetId, setTargetId] = useState(others[0]?.id ?? "");

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Transférer les prestations</div>
          <button type="button" className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--adm-ink-soft)", lineHeight: 1.5, margin: "0 0 16px" }}>
          La catégorie <strong>{category.name}</strong> contient {category.serviceCount ?? 0} prestation(s).
          Choisissez une catégorie de destination avant suppression.
        </p>
        <div className="ab-field">
          <label>Transférer vers</label>
          <select className="ab-input" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            {others.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="ab-modal-foot">
          <button type="button" className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button type="button" className="adm-btn gold" disabled={!targetId} onClick={() => onConfirm(targetId)}>
            Transférer et supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

interface ServiceCategoriesModuleProps {
  embedded?: boolean;
}

export function ServiceCategoriesModule({ embedded }: ServiceCategoriesModuleProps) {
  const {
    categories,
    loading,
    insertCategory,
    updateCategory,
    reorderCategories,
    deleteCategory,
  } = useAdminServiceCategories();

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [transferDelete, setTransferDelete] = useState<ServiceCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  function showToast(msg: string, error = false) {
    setToast({ msg, error });
    setTimeout(() => setToast(null), error ? 5000 : 2500);
  }

  async function handleSave(data: Omit<ServiceCategory, "createdAt" | "updatedAt" | "serviceCount">) {
    setSaving(true);
    const maxOrder = Math.max(0, ...categories.map((c) => c.sortOrder));
    const result = editing
      ? await updateCategory(editing.id, data)
      : await insertCategory({ ...data, sortOrder: maxOrder + 1 });
    setSaving(false);
    if (result.error) {
      showToast(result.error, true);
      return;
    }
    setAdding(false);
    setEditing(null);
    showToast(editing ? "Catégorie mise à jour" : "Catégorie créée");
  }

  async function handleDelete(id: string, transferToId?: string) {
    const result = await deleteCategory(id, transferToId);
    if (result.error === "TRANSFER_REQUIRED") {
      const cat = categories.find((c) => c.id === id);
      if (cat) setTransferDelete(cat);
      return;
    }
    if (result.error) {
      showToast(result.error, true);
      return;
    }
    setTransferDelete(null);
    showToast("Catégorie supprimée");
  }

  async function onDrop(targetId: string) {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) {
      setDragOverId(null);
      return;
    }
    const ids = sorted.map((c) => c.id);
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...ids];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    const { error } = await reorderCategories(next);
    if (error) showToast(error, true);
    dragId.current = null;
    setDragOverId(null);
  }

  const content = (
    <>
      {!embedded && (
        <div className="adm-topbar">
          <div>
            <div className="adm-page-eyebrow"><span className="dot" />PRESTATIONS · TEMPS RÉEL</div>
            <h1 className="adm-h1">Catégories de prestations</h1>
            <p className="adm-sub">{sorted.length} catégorie{sorted.length !== 1 ? "s" : ""} · synchronisées avec la prise de RDV client</p>
          </div>
          <button type="button" className="adm-btn gold" onClick={() => setAdding(true)}>
            <Icon name="plus" size={15} /> Ajouter une catégorie
          </button>
        </div>
      )}

      {embedded && (
        <div className="adm-list-card-head" style={{ marginBottom: 12 }}>
          <div>
            <div className="adm-card-title">Catégories de prestations</div>
            <div className="adm-card-sub">{sorted.length} catégories · glisser-déposer pour réordonner</div>
          </div>
          <button type="button" className="adm-btn gold sm" onClick={() => setAdding(true)}>
            <Icon name="plus" size={14} /> Ajouter
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--adm-ink-mute)" }}>Chargement…</div>
      ) : sorted.length === 0 ? (
        <div className="adm-card" style={{ padding: 40, textAlign: "center" }}>
          <Icon name="grid" size={36} color="var(--adm-ink-mute)" />
          <p style={{ marginTop: 12, color: "var(--adm-ink-mute)" }}>Aucune catégorie — créez la première pour organiser vos prestations.</p>
        </div>
      ) : (
        <div className="adm-card adm-list-card">
          {sorted.map((cat) => (
            <div
              key={cat.id}
              className={`ab-row${dragOverId === cat.id ? " drag-over" : ""}`}
              draggable
              onDragStart={() => { dragId.current = cat.id; }}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(cat.id); }}
              onDrop={() => onDrop(cat.id)}
              onDragEnd={() => { dragId.current = null; setDragOverId(null); }}
              style={{ alignItems: "center", padding: "12px 14px" }}
            >
              <div className="ab-drag" title="Glisser pour réordonner">
                <span /><span /><span />
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${cat.color}22`,
                  border: `1px solid ${cat.color}44`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={cat.icon as "scissors"} size={18} color={cat.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginTop: 2 }}>
                  {cat.slug} · {cat.serviceCount ?? 0} prestation{(cat.serviceCount ?? 0) !== 1 ? "s" : ""}
                </div>
              </div>
              <span
                className="adm-badge"
                style={{
                  color: cat.isActive ? "#2F9E68" : "var(--adm-ink-mute)",
                  background: cat.isActive ? "rgba(47,158,104,.12)" : "var(--adm-bg)",
                }}
              >
                {cat.isActive ? "Active" : "Inactive"}
              </span>
              <div className="adm-rowactions">
                <button type="button" className="adm-act" onClick={() => updateCategory(cat.id, { isActive: !cat.isActive })} title={cat.isActive ? "Désactiver" : "Activer"}>
                  <Icon name={cat.isActive ? "eye" : "x"} size={14} />
                </button>
                <button type="button" className="adm-act" onClick={() => setEditing(cat)}><Icon name="edit" size={14} /></button>
                <button type="button" className="adm-act danger" onClick={() => handleDelete(cat.id)}><Icon name="trash" size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && <CategoryModal onClose={() => setAdding(false)} onSave={handleSave} saving={saving} />}
      {editing && <CategoryModal category={editing} onClose={() => setEditing(null)} onSave={handleSave} saving={saving} />}
      {transferDelete && (
        <TransferDeleteModal
          category={transferDelete}
          others={categories.filter((c) => c.id !== transferDelete.id)}
          onClose={() => setTransferDelete(null)}
          onConfirm={(targetId) => handleDelete(transferDelete.id, targetId)}
        />
      )}
      {toast && <AdminToast msg={toast.msg} variant={toast.error ? "error" : "success"} />}
    </>
  );

  if (embedded) return <div>{content}</div>;

  return <div className="adm-content">{content}</div>;
}
