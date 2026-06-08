"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/shared/Icon";

interface PromoCode {
  id: string;
  code: string;
  desc: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  maxUses: number | null;
  uses: number;
  expiry: string | null;
  enabled: boolean;
  createdAt: string;
}

const STORAGE_KEY = "lncos-promos";

function loadPromos(): PromoCode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePromos(list: PromoCode[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

const TYPE_LABELS: Record<PromoCode["type"], string> = {
  percentage: "Pourcentage",
  fixed: "Montant fixe",
  shipping: "Livraison",
};

function fmtValue(p: PromoCode): string {
  if (p.type === "percentage") return `${p.value}%`;
  if (p.type === "fixed") return `-${p.value} €`;
  return "Gratuit";
}

/* ── Create/Edit modal ───────────────────────────────────────────────── */
function PromoModal({ promo, onClose, onSave }: {
  promo?: PromoCode;
  onClose: () => void;
  onSave: (p: PromoCode) => void;
}) {
  const isNew = !promo;
  const [form, setForm] = useState<Omit<PromoCode, "id" | "uses" | "createdAt">>({
    code: promo?.code ?? "",
    desc: promo?.desc ?? "",
    type: promo?.type ?? "percentage",
    value: promo?.value ?? 10,
    maxUses: promo?.maxUses ?? null,
    expiry: promo?.expiry ?? null,
    enabled: promo?.enabled ?? true,
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function handleSave() {
    if (!form.code.trim()) return;
    onSave({
      ...(promo ?? { id: `promo-${Date.now()}`, uses: 0, createdAt: new Date().toISOString() }),
      ...form,
      code: form.code.toUpperCase().trim(),
    });
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">{isNew ? "Créer un code promo" : `Modifier · ${promo.code}`}</div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>

        <div className="ab-field">
          <label>Code promo <span style={{ color: "var(--tone-pink)", marginLeft: 4 }}>*</span></label>
          <input
            className="ab-input"
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
            placeholder="ex : BIENVENUE10"
            style={{ textTransform: "uppercase" }}
          />
        </div>

        <div className="ab-field">
          <label>Description</label>
          <input
            className="ab-input"
            value={form.desc}
            onChange={(e) => set("desc", e.target.value)}
            placeholder="ex : 10% pour les nouveaux clients"
          />
        </div>

        <div className="ab-field">
          <label>Type de réduction</label>
          <select className="ab-input" value={form.type} onChange={(e) => set("type", e.target.value as PromoCode["type"])}>
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (€)</option>
            <option value="shipping">Livraison gratuite</option>
          </select>
        </div>

        {form.type !== "shipping" && (
          <div className="ab-field">
            <label>{form.type === "percentage" ? "Pourcentage (%)" : "Montant (€)"}</label>
            <input
              className="ab-input"
              type="number"
              min={1}
              max={form.type === "percentage" ? 100 : undefined}
              value={form.value}
              onChange={(e) => set("value", Number(e.target.value))}
            />
          </div>
        )}

        <div className="ab-field">
          <label>Date d&apos;expiration</label>
          <input
            className="ab-input"
            type="date"
            value={form.expiry ?? ""}
            onChange={(e) => set("expiry", e.target.value || null)}
          />
          <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 4 }}>Laissez vide pour illimité</div>
        </div>

        <div className="ab-field">
          <label>Limite d&apos;utilisations</label>
          <input
            className="ab-input"
            type="number"
            min={1}
            value={form.maxUses ?? ""}
            placeholder="Illimité"
            onChange={(e) => set("maxUses", e.target.value ? Number(e.target.value) : null)}
          />
        </div>

        <div className="ab-field" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ margin: 0 }}>Activer immédiatement</label>
          <label className="ab-toggle" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} />
            <div className="ab-toggle-track" />
            <div className="ab-toggle-thumb" />
          </label>
        </div>

        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(212,175,55,.08)", border: "1px solid rgba(212,175,55,.18)", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--adm-gold)" }}>
            <Icon name="sparkle" size={13} color="var(--adm-gold)" />
            <span style={{ fontWeight: 700 }}>Stripe sync pending</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginTop: 4 }}>
            Le code est créé localement. La synchronisation Stripe sera automatique une fois l&apos;intégration configurée.
          </div>
        </div>

        <div className="ab-modal-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button className="adm-btn gold" onClick={handleSave} disabled={!form.code.trim()}>
            <Icon name="check" size={15} /> {isNew ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PromotionsModule ────────────────────────────────────────────────── */
export function PromotionsModule() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPromos(loadPromos());
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleSave(p: PromoCode) {
    setPromos((prev) => {
      const existing = prev.findIndex((x) => x.id === p.id);
      const next = existing >= 0 ? prev.map((x) => x.id === p.id ? p : x) : [...prev, p];
      savePromos(next);
      return next;
    });
    setCreating(false);
    setEditing(null);
    showToast(editing ? "Code mis à jour" : "Code créé");
  }

  function toggleEnabled(id: string) {
    setPromos((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p);
      savePromos(next);
      return next;
    });
  }

  function deletePromo(id: string) {
    setPromos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      savePromos(next);
      return next;
    });
    setConfirmDeleteId(null);
    showToast("Code supprimé");
  }

  function fmtExpiry(expiry: string | null): string {
    if (!expiry) return "Illimité";
    return new Date(expiry).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }

  const active = promos.filter((p) => p.enabled).length;

  return (
    <>
      <div className="adm-content">
        {/* Header */}
        <div className="adm-topbar">
          <div>
            <h1 className="adm-h1">Promotions</h1>
            <p className="adm-sub">{promos.length} code{promos.length !== 1 ? "s" : ""} · {active} actif{active !== 1 ? "s" : ""}</p>
          </div>
          <button className="adm-btn gold" onClick={() => setCreating(true)}>
            <Icon name="plus" size={15} /> Créer un code
          </button>
        </div>

        {/* Stripe sync badge */}
        <div className="adm-card" style={{
          background: "linear-gradient(135deg, rgba(212,175,55,.08), rgba(212,175,55,.03))",
          border: "1px solid rgba(212,175,55,.2)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 18px",
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--adm-gold-bg)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name="sparkle" size={20} color="var(--adm-gold)" />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--adm-gold)", marginBottom: 2 }}>Stripe sync pending</div>
            <div style={{ fontSize: 12.5, color: "var(--adm-ink-mute)" }}>
              Les codes sont stockés localement. L&apos;intégration Stripe Coupons sera activée dans la prochaine phase.
            </div>
          </div>
        </div>

        {/* Promo list */}
        {promos.length === 0 ? (
          <div className="adm-card" style={{ padding: "56px 20px", textAlign: "center" }}>
            <Icon name="gift" size={40} color="var(--adm-ink-mute)" />
            <p style={{ marginTop: 12, color: "var(--adm-ink-mute)", fontSize: 14 }}>Aucun code promo créé</p>
            <button className="adm-btn gold" style={{ marginTop: 16 }} onClick={() => setCreating(true)}>
              <Icon name="plus" size={15} /> Créer le premier code
            </button>
          </div>
        ) : (
          <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
            {promos.map((p, i) => (
              <div key={p.id} className="adm-promo" style={{ padding: "14px 20px", borderBottom: i < promos.length - 1 ? "1px solid var(--adm-border-2)" : "none" }}>
                <div className="adm-promo-icon">
                  <Icon name="gift" size={18} color="var(--adm-gold)" />
                </div>
                <div className="adm-promo-main">
                  <div className="adm-promo-coderow">
                    <span className="adm-promo-code">{p.code}</span>
                    <span className="adm-badge" style={{ background: "var(--adm-surface-2)", color: "var(--adm-ink-mute)", fontSize: 11 }}>{TYPE_LABELS[p.type]}</span>
                    <span className="adm-badge" style={p.enabled
                      ? { background: "rgba(47,158,104,.12)", color: "#2F9E68", fontSize: 11 }
                      : { background: "rgba(199,122,51,.1)", color: "var(--tone-orange)", fontSize: 11 }
                    }>
                      {p.enabled ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  {p.desc && <div className="adm-promo-desc">{p.desc}</div>}
                  <div className="adm-promo-foot">
                    <span>{p.uses} utilisation{p.uses !== 1 ? "s" : ""}{p.maxUses ? ` / ${p.maxUses}` : ""}</span>
                    <span>Expire : {fmtExpiry(p.expiry)}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "var(--adm-gold)", whiteSpace: "nowrap", alignSelf: "center", marginRight: 12 }}>
                  {fmtValue(p)}
                </div>
                <div className="adm-rowactions">
                  <button
                    className="adm-act"
                    title={p.enabled ? "Désactiver" : "Activer"}
                    onClick={() => toggleEnabled(p.id)}
                    style={{ color: p.enabled ? "#2F9E68" : "var(--adm-ink-mute)" }}
                  >
                    <Icon name={p.enabled ? "check" : "x"} size={14} />
                  </button>
                  <button className="adm-act" title="Modifier" onClick={() => setEditing(p)}>
                    <Icon name="edit" size={14} />
                  </button>
                  {confirmDeleteId === p.id ? (
                    <button
                      className="adm-act"
                      onClick={() => deletePromo(p.id)}
                      style={{ color: "var(--tone-pink)", fontWeight: 700, fontSize: 10, width: "auto", padding: "0 6px" }}
                    >
                      Confirmer
                    </button>
                  ) : (
                    <button className="adm-act danger" title="Supprimer" onClick={() => setConfirmDeleteId(p.id)}>
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {creating && <PromoModal onClose={() => setCreating(false)} onSave={handleSave} />}
      {editing && <PromoModal promo={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
      {toast && (
        <div className="adm-toast">
          <Icon name="check" size={14} color="#2F9E68" />
          {toast}
        </div>
      )}
    </>
  );
}
