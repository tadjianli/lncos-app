"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { useShippingMethods, type ShippingMethod } from "@/lib/admin-supabase";

/* ─── ICON options shown in the method editor ────────────────────────── */
const ICONS = [
  { id: "truck",   label: "Camion" },
  { id: "flame",   label: "Express" },
  { id: "pin",     label: "Point relais" },
  { id: "bag",     label: "Sac" },
  { id: "sparkle", label: "Premium" },
  { id: "star",    label: "Étoile" },
];

const EMPTY_FORM: Omit<ShippingMethod, "id" | "createdAt"> = {
  name: "",
  description: "",
  price: 0,
  estimatedDays: "",
  icon: "truck",
  isActive: true,
  isFree: false,
  sortOrder: 0,
};

/* ─── Method edit / create modal ─────────────────────────────────────── */
function MethodModal({
  method,
  isNew,
  onClose,
  onSave,
}: {
  method: Omit<ShippingMethod, "id" | "createdAt">;
  isNew: boolean;
  onClose: () => void;
  onSave: (m: Omit<ShippingMethod, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState({ ...method });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">
            {isNew ? "Nouvelle méthode" : `Modifier · ${method.name}`}
          </div>
          <button className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>

        {/* Name */}
        <div className="ab-field">
          <label>Nom</label>
          <input
            className="ab-input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ex : Express, Standard…"
          />
        </div>

        {/* Description */}
        <div className="ab-field">
          <label>Description</label>
          <input
            className="ab-input"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Ex : 24-48h · suivi inclus"
          />
        </div>

        {/* Délai estimé */}
        <div className="ab-field">
          <label>Délai estimé</label>
          <input
            className="ab-input"
            value={form.estimatedDays}
            onChange={(e) => set("estimatedDays", e.target.value)}
            placeholder="Ex : 24-48h, 3-5 jours…"
          />
        </div>

        {/* Price + isFree */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="ab-field" style={{ marginBottom: 0 }}>
            <label>Prix (€)</label>
            <input
              className="ab-input"
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
              disabled={form.isFree}
            />
          </div>
          <div className="ab-field" style={{ marginBottom: 0 }}>
            <label>Livraison gratuite</label>
            <label
              className="ab-toggle"
              style={{ display: "flex", alignItems: "center", height: 44, gap: 10, cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => {
                  set("isFree", e.target.checked);
                  if (e.target.checked) set("price", 0);
                }}
              />
              <div className="ab-toggle-track" />
              <div className="ab-toggle-thumb" />
              <span style={{ fontSize: 13, color: "var(--adm-ink-soft)", marginLeft: 6 }}>
                {form.isFree ? "Oui" : "Non"}
              </span>
            </label>
          </div>
        </div>

        {/* Icon picker */}
        <div className="ab-field" style={{ marginTop: 18 }}>
          <label>Icône</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {ICONS.map((ic) => (
              <button
                key={ic.id}
                onClick={() => set("icon", ic.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: form.icon === ic.id ? "2px solid var(--gold)" : "1px solid var(--adm-border)",
                  background: form.icon === ic.id ? "var(--adm-gold-bg)" : "var(--adm-surface-2)",
                  cursor: "pointer",
                  transition: "all .15s",
                  minWidth: 60,
                }}
              >
                <Icon name={ic.id as "truck"} size={18} color={form.icon === ic.id ? "var(--adm-gold)" : "var(--adm-ink-mute)"} />
                <span style={{ fontSize: 10, color: form.icon === ic.id ? "var(--adm-gold)" : "var(--adm-ink-mute)", fontWeight: 600 }}>
                  {ic.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* isActive */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--adm-border-2)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-ink)" }}>Méthode active</div>
            <div style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>Visible dans le checkout client</div>
          </div>
          <label className="ab-toggle" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            <div className="ab-toggle-track" />
            <div className="ab-toggle-thumb" />
          </label>
        </div>

        <div className="ab-modal-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button
            className="adm-btn gold"
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
          >
            <Icon name="check" size={15} />
            {isNew ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main module ────────────────────────────────────────────────────── */
export function ShippingModule() {
  const { methods, loading, updateMethod, insertMethod, deleteMethod, reorderMethods } = useShippingMethods();
  const [modal, setModal] = useState<{ open: boolean; isNew: boolean; method: Omit<ShippingMethod, "id" | "createdAt">; id?: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(null);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function showToast(msg: string, isError = false) {
    setToast({ msg: isError ? `Erreur : ${msg}` : msg, error: isError });
    setTimeout(() => setToast(null), isError ? 6000 : 2500);
  }

  function openNew() {
    const nextOrder = methods.length > 0 ? Math.max(...methods.map((m) => m.sortOrder)) + 1 : 0;
    setModal({ open: true, isNew: true, method: { ...EMPTY_FORM, sortOrder: nextOrder } });
  }

  function openEdit(m: ShippingMethod) {
    setModal({
      open: true,
      isNew: false,
      id: m.id,
      method: {
        name: m.name,
        description: m.description,
        price: m.price,
        estimatedDays: m.estimatedDays,
        icon: m.icon,
        isActive: m.isActive,
        isFree: m.isFree,
        sortOrder: m.sortOrder,
      },
    });
  }

  async function handleSave(form: Omit<ShippingMethod, "id" | "createdAt">) {
    setSaving(true);
    try {
      if (modal?.isNew) {
        await insertMethod(form);
        showToast("Méthode créée");
      } else if (modal?.id) {
        await updateMethod(modal.id, form);
        showToast("Méthode mise à jour");
      }
      setModal(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur inconnue", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(m: ShippingMethod) {
    try {
      await updateMethod(m.id, { isActive: !m.isActive });
      showToast(m.isActive ? "Méthode désactivée" : "Méthode activée");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de mise à jour", true);
    }
  }

  async function handleToggleFree(m: ShippingMethod) {
    try {
      await updateMethod(m.id, { isFree: !m.isFree, price: !m.isFree ? 0 : m.price });
      showToast(!m.isFree ? "Livraison gratuite activée" : "Prix réactivé");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de mise à jour", true);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMethod(id);
      setDelConfirm(null);
      showToast("Méthode supprimée");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de suppression", true);
    }
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const next = [...methods];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    await reorderMethods(next.map((m, i) => ({ ...m, sortOrder: i })));
  }

  async function moveDown(index: number) {
    if (index === methods.length - 1) return;
    const next = [...methods];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    await reorderMethods(next.map((m, i) => ({ ...m, sortOrder: i })));
  }

  return (
    <>
      <div className="adm-content">
        {/* Header */}
        <div className="adm-topbar">
          <div>
            <h1 className="adm-h1">Livraison</h1>
            <p className="adm-sub">Méthodes de livraison affichées dans le checkout</p>
          </div>
          <div className="adm-topbar-right">
            <button className="adm-btn gold" onClick={openNew}>
              <Icon name="plus" size={15} /> Ajouter une méthode
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: methods.length, icon: "truck", color: "var(--adm-gold-bg)", iconColor: "var(--adm-gold)" },
            { label: "Actives", value: methods.filter((m) => m.isActive).length, icon: "check", color: "rgba(47,158,104,.1)", iconColor: "#2F9E68" },
            { label: "Gratuites", value: methods.filter((m) => m.isFree).length, icon: "sparkle", color: "rgba(59,125,216,.1)", iconColor: "#3B7DD8" },
          ].map((s) => (
            <div
              key={s.label}
              className="adm-card"
              style={{ flex: "1 1 160px", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                <Icon name={s.icon as "truck"} size={18} color={s.iconColor} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--adm-ink)", letterSpacing: "-.02em", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Methods list */}
        <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--adm-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--adm-ink)" }}>Méthodes configurées</div>
            <div style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>Ordre affiché dans le checkout ↕</div>
          </div>

          {loading ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>
              Chargement…
            </div>
          ) : methods.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--adm-surface-2)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                <Icon name="truck" size={26} color="var(--adm-ink-mute)" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--adm-ink)", marginBottom: 6 }}>Aucune méthode</div>
              <div style={{ fontSize: 13, color: "var(--adm-ink-mute)", marginBottom: 20 }}>
                Créez votre première méthode de livraison.
              </div>
              <button className="adm-btn gold" onClick={openNew}>
                <Icon name="plus" size={14} /> Ajouter
              </button>
            </div>
          ) : (
            <div>
              {methods.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    borderBottom: i < methods.length - 1 ? "1px solid var(--adm-border-2)" : "none",
                    opacity: m.isActive ? 1 : 0.55,
                    transition: "opacity .2s",
                  }}
                >
                  {/* Icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--adm-gold-bg)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                    <Icon name={m.icon as "truck"} size={20} color="var(--adm-gold)" />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--adm-ink)" }}>{m.name}</span>
                      {m.isFree && (
                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(47,158,104,.1)", color: "#2F9E68", fontSize: 10.5, fontWeight: 700 }}>
                          GRATUIT
                        </span>
                      )}
                      {!m.isActive && (
                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--adm-surface-2)", color: "var(--adm-ink-mute)", fontSize: 10.5, fontWeight: 700 }}>
                          INACTIF
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 2 }}>
                      {m.description}
                      {m.estimatedDays ? ` · ${m.estimatedDays}` : ""}
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: "right", flex: "0 0 auto", minWidth: 70 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: m.isFree ? "#2F9E68" : "var(--adm-ink)" }}>
                      {m.isFree ? "Gratuit" : `${m.price.toFixed(2)} €`}
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--adm-ink-mute)", marginTop: 1 }}>
                      {m.estimatedDays}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flex: "0 0 auto" }}>
                    {/* Reorder */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4 }}>
                      <button
                        className="adm-iconbtn sm"
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        title="Monter"
                        style={{ opacity: i === 0 ? 0.3 : 1 }}
                      >
                        <Icon name="chevR" size={12} style={{ transform: "rotate(-90deg)" }} />
                      </button>
                      <button
                        className="adm-iconbtn sm"
                        onClick={() => moveDown(i)}
                        disabled={i === methods.length - 1}
                        title="Descendre"
                        style={{ opacity: i === methods.length - 1 ? 0.3 : 1 }}
                      >
                        <Icon name="chevR" size={12} style={{ transform: "rotate(90deg)" }} />
                      </button>
                    </div>

                    {/* Toggle free */}
                    <button
                      className="adm-iconbtn"
                      onClick={() => handleToggleFree(m)}
                      title={m.isFree ? "Rendre payant" : "Rendre gratuit"}
                      style={{ color: m.isFree ? "#2F9E68" : undefined }}
                    >
                      <Icon name="sparkle" size={15} />
                    </button>

                    {/* Toggle active */}
                    <label className="ab-toggle" style={{ cursor: "pointer", flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={m.isActive}
                        onChange={() => handleToggleActive(m)}
                      />
                      <div className="ab-toggle-track" />
                      <div className="ab-toggle-thumb" />
                    </label>

                    {/* Edit */}
                    <button className="adm-iconbtn" onClick={() => openEdit(m)} title="Modifier">
                      <Icon name="sliders" size={15} />
                    </button>

                    {/* Delete */}
                    {delConfirm === m.id ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="adm-iconbtn"
                          onClick={() => handleDelete(m.id)}
                          style={{ background: "rgba(194,85,122,.12)", color: "#C2557A", borderColor: "rgba(194,85,122,.3)" }}
                          title="Confirmer la suppression"
                        >
                          <Icon name="check" size={14} />
                        </button>
                        <button className="adm-iconbtn" onClick={() => setDelConfirm(null)} title="Annuler">
                          <Icon name="x" size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="adm-iconbtn"
                        onClick={() => setDelConfirm(m.id)}
                        title="Supprimer"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help card */}
        <div className="adm-card" style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,125,216,.1)", display: "grid", placeItems: "center", flex: "0 0 auto", marginTop: 2 }}>
            <Icon name="sparkle" size={16} color="#3B7DD8" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-ink)", marginBottom: 4 }}>Comment ça marche ?</div>
            <div style={{ fontSize: 12.5, color: "var(--adm-ink-mute)", lineHeight: 1.6 }}>
              Les méthodes actives apparaissent dans l&apos;étape 2 du checkout client. Le client sélectionne sa méthode préférée et le total se met à jour automatiquement. Les méthodes inactives sont masquées sans être supprimées.
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal?.open && (
        <MethodModal
          method={modal.method}
          isNew={modal.isNew}
          onClose={() => setModal(null)}
          onSave={async (form) => {
            if (!saving) await handleSave(form);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="adm-toast"
          style={toast.error ? { background: "rgba(194,85,122,.15)", border: "1px solid rgba(194,85,122,.3)", color: "var(--tone-pink)" } : undefined}
        >
          <Icon name={toast.error ? "x" : "check"} size={14} color={toast.error ? "var(--tone-pink)" : "#2F9E68"} />
          {toast.msg}
        </div>
      )}
    </>
  );
}
