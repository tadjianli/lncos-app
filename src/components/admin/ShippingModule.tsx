"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast } from "@/components/admin/AdminToast";
import { useShippingMethods, type ShippingMethod } from "@/lib/admin-supabase";
import {
  computeShippingCost,
  getShippingAdminBadges,
  getShippingPreviewConditions,
  validateShippingMethodForm,
  type ShippingMethodInput,
} from "@/lib/shipping-rules";

/* ─── ICON options shown in the method editor ────────────────────────── */
const ICONS = [
  { id: "truck",   label: "Camion" },
  { id: "flame",   label: "Express" },
  { id: "pin",     label: "Point relais" },
  { id: "bag",     label: "Sac" },
  { id: "sparkle", label: "Premium" },
  { id: "star",    label: "Étoile" },
];

const EMPTY_FORM: ShippingMethodInput = {
  name: "",
  description: "",
  price: 0,
  estimatedDays: "",
  icon: "truck",
  isActive: true,
  isFree: false,
  freeShippingEnabled: false,
  freeShippingThreshold: null,
  minimumOrderEnabled: false,
  minimumOrderAmount: null,
  maximumOrderEnabled: false,
  maximumOrderAmount: null,
  sortOrder: 0,
};

const PREVIEW_SUBTOTAL = 40;

function RuleToggleRow({
  label,
  hint,
  checked,
  onChange,
  children,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--adm-border-2)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-ink)" }}>{label}</div>
          {hint && <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 2 }}>{hint}</div>}
        </div>
        <label className="ab-toggle" style={{ cursor: "pointer", flexShrink: 0 }}>
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          <div className="ab-toggle-track" />
          <div className="ab-toggle-thumb" />
        </label>
      </div>
      {checked && children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

function MethodPreviewCard({ form }: { form: ShippingMethodInput }) {
  const previewMethod = { ...form, id: "preview", createdAt: "" } as ShippingMethod;
  const price = computeShippingCost(previewMethod, PREVIEW_SUBTOTAL);
  const conditions = getShippingPreviewConditions(form);

  return (
    <div
      className="adm-card"
      style={{
        marginTop: 20,
        padding: 16,
        background: "var(--adm-surface-2)",
        border: "1px dashed var(--adm-border)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--adm-ink-mute)", marginBottom: 12 }}>
        Aperçu (panier {PREVIEW_SUBTOTAL} €)
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--adm-ink)" }}>{form.name || "Méthode"}</div>
          <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 2 }}>
            Prix actuel : {price === 0 ? "GRATUIT" : `${price.toFixed(2)} €`}
          </div>
        </div>
        <Icon name={form.icon as "truck"} size={22} color="var(--adm-gold)" />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--adm-ink-soft)", marginBottom: 6 }}>Conditions</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {conditions.map((line) => (
          <div key={line} style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>{line}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── Method edit / create modal ─────────────────────────────────────── */
function MethodModal({
  method,
  isNew,
  onClose,
  onSave,
}: {
  method: ShippingMethodInput;
  isNew: boolean;
  onClose: () => void;
  onSave: (m: ShippingMethodInput) => void;
}) {
  const [form, setForm] = useState({ ...method });
  const [errors, setErrors] = useState<string[]>([]);

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors([]);
  }

  function handleSubmit() {
    const result = validateShippingMethodForm(form);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    onSave(form);
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal ab-modal-wide ab-modal-scroll" onClick={(e) => e.stopPropagation()}>
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
        <div className="adm-form-cols">
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
                  const checked = e.target.checked;
                  set("isFree", checked);
                  if (checked) {
                    set("price", 0);
                    set("freeShippingEnabled", false);
                    set("freeShippingThreshold", null);
                  }
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

        <RuleToggleRow
          label="Activer la livraison gratuite à partir d'un montant"
          hint={form.isFree ? "Désactivé — la méthode est déjà toujours gratuite" : undefined}
          checked={form.freeShippingEnabled && !form.isFree}
          onChange={(v) => {
            if (form.isFree) return;
            set("freeShippingEnabled", v);
            if (!v) set("freeShippingThreshold", null);
          }}
        >
          <div className="ab-field" style={{ marginBottom: 0 }}>
            <label>Livraison offerte dès (€)</label>
            <input
              className="ab-input"
              type="number"
              min={0.01}
              step={0.01}
              value={form.freeShippingThreshold ?? ""}
              onChange={(e) =>
                set("freeShippingThreshold", e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="Ex : 50"
              disabled={form.isFree}
            />
          </div>
        </RuleToggleRow>

        <RuleToggleRow
          label="Activer un minimum de commande"
          checked={form.minimumOrderEnabled}
          onChange={(v) => {
            set("minimumOrderEnabled", v);
            if (!v) set("minimumOrderAmount", null);
          }}
        >
          <div className="ab-field" style={{ marginBottom: 0 }}>
            <label>Commande minimum (€)</label>
            <input
              className="ab-input"
              type="number"
              min={0.01}
              step={0.01}
              value={form.minimumOrderAmount ?? ""}
              onChange={(e) =>
                set("minimumOrderAmount", e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="Ex : 20"
            />
          </div>
        </RuleToggleRow>

        <RuleToggleRow
          label="Limiter à un montant maximum"
          checked={form.maximumOrderEnabled}
          onChange={(v) => {
            set("maximumOrderEnabled", v);
            if (!v) set("maximumOrderAmount", null);
          }}
        >
          <div className="ab-field" style={{ marginBottom: 0 }}>
            <label>Commande maximum (€)</label>
            <input
              className="ab-input"
              type="number"
              min={0.01}
              step={0.01}
              value={form.maximumOrderAmount ?? ""}
              onChange={(e) =>
                set("maximumOrderAmount", e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="Ex : 100"
            />
          </div>
        </RuleToggleRow>

        <MethodPreviewCard form={form} />

        {errors.length > 0 && (
          <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(194,85,122,.08)", border: "1px solid rgba(194,85,122,.2)" }}>
            {errors.map((err) => (
              <div key={err} style={{ fontSize: 12, color: "#C2557A", lineHeight: 1.5 }}>{err}</div>
            ))}
          </div>
        )}

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
            onClick={handleSubmit}
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
  const [modal, setModal] = useState<{ open: boolean; isNew: boolean; method: ShippingMethodInput; id?: string } | null>(null);
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
        freeShippingEnabled: m.freeShippingEnabled,
        freeShippingThreshold: m.freeShippingThreshold,
        minimumOrderEnabled: m.minimumOrderEnabled,
        minimumOrderAmount: m.minimumOrderAmount,
        maximumOrderEnabled: m.maximumOrderEnabled,
        maximumOrderAmount: m.maximumOrderAmount,
        sortOrder: m.sortOrder,
      },
    });
  }

  async function handleSave(form: ShippingMethodInput) {
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
        <div className="adm-card adm-list-card">
          <div className="adm-list-card-head">
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
                  className={m.isActive ? "" : "adm-row-inactive"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    borderBottom: i < methods.length - 1 ? "1px solid var(--adm-border-2)" : "none",
                    transition: "opacity .2s",
                  }}
                >
                  {/* Icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--adm-gold-bg)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                    <Icon name={m.icon as "truck"} size={20} color="var(--adm-gold)" />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--adm-ink)" }}>{m.name}</span>
                      {getShippingAdminBadges(m).map((badge) => {
                        const isInactive = badge === "INACTIF";
                        const isFree = badge === "GRATUIT" || badge.startsWith("OFFERT");
                        const isLimit = badge.startsWith("MIN") || badge.startsWith("MAX");
                        const bg = isInactive
                          ? "var(--adm-surface-2)"
                          : isFree
                            ? "rgba(47,158,104,.1)"
                            : isLimit
                              ? "rgba(59,125,216,.1)"
                              : "rgba(47,158,104,.1)";
                        const color = isInactive
                          ? "var(--adm-ink-mute)"
                          : isFree
                            ? "#2F9E68"
                            : isLimit
                              ? "#3B7DD8"
                              : "#2F9E68";
                        return (
                          <span
                            key={badge}
                            style={{ padding: "2px 8px", borderRadius: 6, background: bg, color, fontSize: 10, fontWeight: 700 }}
                          >
                            {badge}
                          </span>
                        );
                      })}
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
      {toast && <AdminToast msg={toast.msg} variant={toast.error ? "error" : "success"} />}
    </>
  );
}
