"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast } from "@/components/admin/AdminToast";
import { usePromos, type Promo } from "@/lib/admin-supabase";

const TYPE_LABELS: Record<Promo["type"], string> = {
  percentage: "Pourcentage",
  fixed: "Montant fixe",
  shipping: "Livraison",
};

function fmtValue(p: Promo): string {
  if (p.type === "percentage") return `−${p.value}%`;
  if (p.type === "fixed") return `−${p.value.toFixed(2)} €`;
  return "Livraison offerte";
}

function fmtExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "Illimité";
  return new Date(expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Create / Edit modal ─────────────────────────────────────────────── */
function PromoModal({
  promo,
  onClose,
  onSave,
}: {
  promo?: Promo;
  onClose: () => void;
  onSave: (p: Omit<Promo, "id" | "currentUses" | "createdAt">) => void;
}) {
  const isNew = !promo;
  const [form, setForm] = useState<Omit<Promo, "id" | "currentUses" | "createdAt">>({
    code: promo?.code ?? "",
    description: promo?.description ?? "",
    type: promo?.type ?? "percentage",
    value: promo?.value ?? 10,
    isActive: promo?.isActive ?? true,
    expiresAt: promo?.expiresAt ?? null,
    maxUses: promo?.maxUses ?? null,
    freeShipping: promo?.freeShipping ?? false,
    minimumOrder: promo?.minimumOrder ?? 0,
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">
            {isNew ? "Créer un code promo" : `Modifier · ${promo!.code}`}
          </div>
          <button className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>

        {/* Code */}
        <div className="ab-field">
          <label>
            Code promo <span style={{ color: "var(--tone-pink)", marginLeft: 4 }}>*</span>
          </label>
          <input
            className="ab-input"
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder="ex : LNBV, BIENVENUE10…"
            style={{ textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700 }}
          />
        </div>

        {/* Description */}
        <div className="ab-field">
          <label>Description</label>
          <input
            className="ab-input"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="ex : 10% pour les nouveaux clients"
          />
        </div>

        {/* Type */}
        <div className="ab-field">
          <label>Type de réduction</label>
          <select
            className="ab-input"
            value={form.type}
            onChange={(e) => set("type", e.target.value as Promo["type"])}
          >
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (€)</option>
            <option value="shipping">Livraison gratuite</option>
          </select>
        </div>

        {/* Value (hidden for shipping type) */}
        {form.type !== "shipping" && (
          <div className="ab-field">
            <label>{form.type === "percentage" ? "Réduction (%)" : "Montant (€)"}</label>
            <input
              className="ab-input"
              type="number"
              min={0.01}
              step={form.type === "percentage" ? 1 : 0.01}
              max={form.type === "percentage" ? 100 : undefined}
              value={form.value}
              onChange={(e) => set("value", parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        {/* Free shipping toggle (for percentage / fixed types) */}
        {form.type !== "shipping" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: "1px solid var(--adm-border-2)",
              marginTop: 4,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-ink)" }}>
                Inclure livraison gratuite
              </div>
              <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)" }}>
                La réduction s&apos;applique ET la livraison est offerte
              </div>
            </div>
            <label className="ab-toggle" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.freeShipping}
                onChange={(e) => set("freeShipping", e.target.checked)}
              />
              <div className="ab-toggle-track" />
              <div className="ab-toggle-thumb" />
            </label>
          </div>
        )}

        {/* Minimum order */}
        <div className="ab-field" style={{ marginTop: 16 }}>
          <label>Commande minimum (€)</label>
          <input
            className="ab-input"
            type="number"
            min={0}
            step={0.01}
            value={form.minimumOrder}
            onChange={(e) => set("minimumOrder", parseFloat(e.target.value) || 0)}
            placeholder="0 = aucun minimum"
          />
        </div>

        {/* Expiry */}
        <div className="ab-field">
          <label>Date d&apos;expiration</label>
          <input
            className="ab-input"
            type="date"
            value={form.expiresAt ? form.expiresAt.split("T")[0] : ""}
            onChange={(e) => set("expiresAt", e.target.value ? `${e.target.value}T23:59:59Z` : null)}
          />
          <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 4 }}>
            Laissez vide pour illimité
          </div>
        </div>

        {/* Max uses */}
        <div className="ab-field">
          <label>Limite d&apos;utilisations</label>
          <input
            className="ab-input"
            type="number"
            min={1}
            value={form.maxUses ?? ""}
            placeholder="Illimité"
            onChange={(e) => set("maxUses", e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        {/* Active toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: "1px solid var(--adm-border-2)",
          }}
        >
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-ink)", margin: 0 }}>
            Activer immédiatement
          </label>
          <label className="ab-toggle" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
            />
            <div className="ab-toggle-track" />
            <div className="ab-toggle-thumb" />
          </label>
        </div>

        <div className="ab-modal-foot">
          <button className="adm-btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            className="adm-btn gold"
            onClick={() => form.code.trim() && onSave(form)}
            disabled={!form.code.trim()}
          >
            <Icon name="check" size={15} />
            {isNew ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PromotionsModule ────────────────────────────────────────────────── */
export function PromotionsModule() {
  const { promos, loading, updatePromo, insertPromo, deletePromo } = usePromos();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(null);

  function showToast(msg: string, isError = false) {
    setToast({ msg: isError ? `Erreur : ${msg}` : msg, error: isError });
    setTimeout(() => setToast(null), isError ? 6000 : 2500);
  }

  async function handleCreate(form: Omit<Promo, "id" | "currentUses" | "createdAt">) {
    try {
      await insertPromo(form);
      setCreating(false);
      showToast("Code créé");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur inconnue", true);
    }
  }

  async function handleEdit(form: Omit<Promo, "id" | "currentUses" | "createdAt">) {
    if (!editing) return;
    try {
      await updatePromo(editing.id, form);
      setEditing(null);
      showToast("Code mis à jour");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur inconnue", true);
    }
  }

  async function handleToggleActive(p: Promo) {
    try {
      await updatePromo(p.id, { isActive: !p.isActive });
      showToast(p.isActive ? "Code désactivé" : "Code activé");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de mise à jour", true);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePromo(id);
      setConfirmDeleteId(null);
      showToast("Code supprimé");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de suppression", true);
    }
  }

  const active = promos.filter((p) => p.isActive).length;

  return (
    <>
      <div className="adm-content">
        {/* Header */}
        <div className="adm-topbar">
          <div>
            <h1 className="adm-h1">Promotions</h1>
            <p className="adm-sub">
              {promos.length} code{promos.length !== 1 ? "s" : ""} · {active} actif
              {active !== 1 ? "s" : ""}
            </p>
          </div>
          <button className="adm-btn gold" onClick={() => setCreating(true)}>
            <Icon name="plus" size={15} /> Créer un code
          </button>
        </div>

        {/* Status badge */}
        <div
          className="adm-card"
          style={{
            background: "linear-gradient(135deg, rgba(47,158,104,.08), rgba(47,158,104,.03))",
            border: "1px solid rgba(47,158,104,.2)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 18px",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "rgba(47,158,104,.12)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={20} color="#2F9E68" />
          </div>
          <div>
            <div
              style={{ fontSize: 13.5, fontWeight: 700, color: "#2F9E68", marginBottom: 2 }}
            >
              Supabase · Temps réel
            </div>
            <div style={{ fontSize: 12.5, color: "var(--adm-ink-mute)" }}>
              Les codes sont stockés dans Supabase et appliqués en temps réel dans le checkout
              client.
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div
            className="adm-card"
            style={{ padding: "40px 20px", textAlign: "center", color: "var(--adm-ink-mute)" }}
          >
            Chargement…
          </div>
        ) : promos.length === 0 ? (
          <div className="adm-card" style={{ padding: "56px 20px", textAlign: "center" }}>
            <Icon name="gift" size={40} color="var(--adm-ink-mute)" />
            <p style={{ marginTop: 12, color: "var(--adm-ink-mute)", fontSize: 14 }}>
              Aucun code promo créé
            </p>
            <button
              className="adm-btn gold"
              style={{ marginTop: 16 }}
              onClick={() => setCreating(true)}
            >
              <Icon name="plus" size={15} /> Créer le premier code
            </button>
          </div>
        ) : (
          <div className="adm-card adm-card-scroll">
            {promos.map((p, i) => (
              <div
                key={p.id}
                className="adm-promo"
                style={{
                  padding: "14px 20px",
                  borderBottom: i < promos.length - 1 ? "1px solid var(--adm-border-2)" : "none",
                  opacity: p.isActive ? 1 : 0.6,
                  transition: "opacity .2s",
                }}
              >
                <div className="adm-promo-icon">
                  <Icon name="gift" size={18} color="var(--adm-gold)" />
                </div>

                <div className="adm-promo-main">
                  <div className="adm-promo-coderow">
                    <span className="adm-promo-code">{p.code}</span>
                    <span
                      className="adm-badge"
                      style={{
                        background: "var(--adm-surface-2)",
                        color: "var(--adm-ink-mute)",
                        fontSize: 11,
                      }}
                    >
                      {TYPE_LABELS[p.type]}
                    </span>
                    {p.freeShipping && p.type !== "shipping" && (
                      <span
                        className="adm-badge"
                        style={{
                          background: "rgba(59,125,216,.1)",
                          color: "#3B7DD8",
                          fontSize: 11,
                        }}
                      >
                        + Livraison
                      </span>
                    )}
                    <span
                      className="adm-badge"
                      style={
                        p.isActive
                          ? { background: "rgba(47,158,104,.12)", color: "#2F9E68", fontSize: 11 }
                          : {
                              background: "rgba(199,122,51,.1)",
                              color: "var(--tone-orange)",
                              fontSize: 11,
                            }
                      }
                    >
                      {p.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  {p.description && (
                    <div className="adm-promo-desc">{p.description}</div>
                  )}

                  <div className="adm-promo-foot">
                    <span>
                      {p.currentUses} utilisation{p.currentUses !== 1 ? "s" : ""}
                      {p.maxUses ? ` / ${p.maxUses}` : ""}
                    </span>
                    {p.minimumOrder > 0 && (
                      <span>Min. {p.minimumOrder.toFixed(2)} €</span>
                    )}
                    <span>Expire : {fmtExpiry(p.expiresAt)}</span>
                  </div>
                </div>

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: "var(--adm-gold)",
                    whiteSpace: "nowrap",
                    alignSelf: "center",
                    marginRight: 12,
                  }}
                >
                  {fmtValue(p)}
                </div>

                <div className="adm-rowactions">
                  <button
                    className="adm-act"
                    title={p.isActive ? "Désactiver" : "Activer"}
                    onClick={() => handleToggleActive(p)}
                    style={{ color: p.isActive ? "#2F9E68" : "var(--adm-ink-mute)" }}
                  >
                    <Icon name={p.isActive ? "check" : "x"} size={14} />
                  </button>

                  <button
                    className="adm-act"
                    title="Modifier"
                    onClick={() => setEditing(p)}
                  >
                    <Icon name="sliders" size={14} />
                  </button>

                  {confirmDeleteId === p.id ? (
                    <button
                      className="adm-act"
                      onClick={() => handleDelete(p.id)}
                      style={{
                        color: "var(--tone-pink)",
                        fontWeight: 700,
                        fontSize: 10,
                        width: "auto",
                        padding: "0 6px",
                      }}
                    >
                      Confirmer
                    </button>
                  ) : (
                    <button
                      className="adm-act danger"
                      title="Supprimer"
                      onClick={() => setConfirmDeleteId(p.id)}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <PromoModal onClose={() => setCreating(false)} onSave={handleCreate} />
      )}
      {editing && (
        <PromoModal
          promo={editing}
          onClose={() => setEditing(null)}
          onSave={handleEdit}
        />
      )}

      {toast && <AdminToast msg={toast.msg} variant={toast.error ? "error" : "success"} />}
    </>
  );
}
