"use client";

import { useState, useRef, useEffect } from "react";
import type { Popup } from "@/lib/rdv-store";
import { usePopups } from "@/lib/admin-supabase";
import { Icon } from "@/components/shared/Icon";

type Tab = "list" | "analytics" | "tips";

/* ── Toggle ─────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="ab-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="ab-toggle-track" />
      <div className="ab-toggle-thumb" />
    </label>
  );
}

/* ── Mini popup preview ──────────────────────────────────────────────── */
function PopupPreview({ popup }: { popup: Partial<Popup> }) {
  return (
    <div className="pop-preview-frame">
      <div className="pop-preview-popup">
        <div className="eyebrow">{popup.eyebrow || "Offre"}</div>
        <div className="title">{popup.title || "Titre du popup"}</div>
        {popup.code && <div className="code-box">{popup.code}</div>}
        <div className="cta">{popup.ctaLabel || "Découvrir"}</div>
      </div>
    </div>
  );
}

/* ── Popup editor modal ──────────────────────────────────────────────── */
function PopupEditor({ popup, onClose, onSave }: {
  popup: Popup;
  onClose: () => void;
  onSave: (patch: Partial<Popup>) => void;
}) {
  const [form, setForm] = useState({ ...popup });

  function set<K extends keyof Popup>(key: K, val: Popup[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="pop-editor-modal" onClick={onClose}>
      <div className="pop-editor" onClick={(e) => e.stopPropagation()}>
        <div className="pop-editor-head">
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--adm-ink)" }}>
            {popup.id === "__new__" ? "Nouvelle popup" : `Modifier · ${popup.name}`}
          </div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>

        <div className="pop-editor-body">
          {/* Form */}
          <div className="pop-editor-form">
            <div className="pop-section-title">Contenu</div>

            {[
              { label: "Nom interne", key: "name" as const, type: "text" },
              { label: "Eyebrow", key: "eyebrow" as const, type: "text" },
              { label: "Titre", key: "title" as const, type: "text" },
              { label: "Sous-titre", key: "subtitle" as const, type: "text" },
              { label: "Code promo", key: "code" as const, type: "text" },
              { label: "Texte du bouton", key: "ctaLabel" as const, type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} className="pop-field-row">
                <label className="pop-field-label">{label}</label>
                <input
                  className="pop-input"
                  type={type}
                  value={String(form[key] ?? "")}
                  onChange={(e) => set(key, e.target.value as Popup[typeof key])}
                />
              </div>
            ))}

            <div className="pop-section-title">Ciblage</div>

            <div className="pop-field-row">
              <label className="pop-field-label">Audience</label>
              <select className="pop-input pop-select" value={form.audience} onChange={(e) => set("audience", e.target.value)}>
                <option value="all">Tout le monde</option>
                <option value="new">Nouveaux visiteurs</option>
                <option value="returning">Visiteurs récurrents</option>
                <option value="vip">Clientes VIP</option>
              </select>
            </div>

            <div className="pop-field-row">
              <label className="pop-field-label">Appareil</label>
              <select className="pop-input pop-select" value={form.device} onChange={(e) => set("device", e.target.value)}>
                <option value="all">Tous</option>
                <option value="mobile">Mobile uniquement</option>
                <option value="desktop">Desktop uniquement</option>
              </select>
            </div>

            <div className="pop-section-title">Déclencheur</div>

            <div className="pop-field-row">
              <label className="pop-field-label">Déclencheur</label>
              <select className="pop-input pop-select" value={form.trigger} onChange={(e) => set("trigger", e.target.value)}>
                <option value="delay">Délai</option>
                <option value="exit">Intention de sortie</option>
                <option value="scroll">Défilement</option>
                <option value="immediate">Immédiat</option>
              </select>
            </div>

            {form.trigger === "delay" && (
              <div className="pop-field-row">
                <label className="pop-field-label">Délai (secondes)</label>
                <input
                  className="pop-input"
                  type="number"
                  min={0}
                  max={60}
                  value={form.delaySec}
                  onChange={(e) => set("delaySec", Number(e.target.value))}
                />
              </div>
            )}

            <div className="pop-section-title">Options</div>

            <div className="pop-toggle-row">
              <span className="pop-toggle-label">Capture email</span>
              <Toggle checked={form.emailCapture} onChange={() => set("emailCapture", !form.emailCapture)} />
            </div>
            <div className="pop-toggle-row">
              <span className="pop-toggle-label">Compte à rebours</span>
              <Toggle checked={form.countdown.enabled} onChange={() => set("countdown", { ...form.countdown, enabled: !form.countdown.enabled })} />
            </div>
          </div>

          {/* Preview column */}
          <div className="pop-editor-preview-col">
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--adm-ink-mute)", marginBottom: 14, textAlign: "center", textTransform: "uppercase", letterSpacing: ".06em" }}>Aperçu</div>
            <PopupPreview popup={form} />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
              <div className="pop-toggle-row">
                <span className="pop-toggle-label" style={{ fontSize: 12 }}>Actif</span>
                <Toggle checked={form.enabled} onChange={() => set("enabled", !form.enabled)} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--adm-border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button className="adm-btn gold" onClick={() => onSave(form)}>
            <Icon name="check" size={15} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sparkline mini chart ───────────────────────────────────────────── */
function Sparkline({ data, color = "var(--gold)" }: { data: number[]; color?: string }) {
  const series = data.length > 0 ? data : new Array(14).fill(0);
  const max = Math.max(...series, 1);
  return (
    <div className="pop-sparkline">
      {series.map((v, i) => (
        <div
          key={i}
          className="pop-sparkbar"
          style={{ height: `${Math.max(4, (v / max) * 40)}px`, background: color }}
          title={String(v)}
        />
      ))}
    </div>
  );
}

/* ── Analytics tab ──────────────────────────────────────────────────── */
function AnalyticsView({ popups }: { popups: Popup[] }) {
  const totalViews = popups.reduce((t, p) => t + p.stats.views, 0);
  const totalClicks = popups.reduce((t, p) => t + p.stats.clicks, 0);
  const totalConversions = popups.reduce((t, p) => t + p.stats.conversions, 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  // Aggregate daily data across all popups
  const aggDaily = Array.from({ length: 14 }, (_, i) =>
    popups.reduce((t, p) => t + (p.stats.daily[i] ?? 0), 0)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="adm-grid-4">
        {[
          { label: "Vues totales",   val: totalViews.toLocaleString("fr-FR"),   icon: "bell",    color: "#3B7DD8", bg: "rgba(59,125,216,.14)" },
          { label: "Taux de clic",   val: ctr + "%",                            icon: "arrowR",  color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
          { label: "Conversions",    val: totalConversions.toLocaleString("fr-FR"), icon: "check",color: "#B8902B", bg: "rgba(212,175,55,.14)" },
          { label: "Popups actives", val: popups.filter((p) => p.enabled).length,  icon: "gift", color: "#C2557A", bg: "rgba(194,85,122,.14)" },
        ].map((s) => (
          <div key={s.label} className="adm-card adm-stat">
            <div className="adm-stat-top">
              <div className="adm-stat-icon" style={{ background: s.bg }}>
                <Icon name={s.icon} size={18} color={s.color} />
              </div>
            </div>
            <div className="adm-stat-value">{s.val}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-card-head">
          <div className="adm-card-title">Activité des 14 derniers jours</div>
        </div>
        <div className="pop-sparkline-wrap">
          <Sparkline data={aggDaily} />
        </div>
      </div>

      {popups.map((p) => (
        <div key={p.id} className="adm-card">
          <div className="adm-card-head">
            <div>
              <div className="adm-card-title">{p.name}</div>
              <div className="adm-card-sub">{p.stats.views} vues · {((p.stats.clicks / Math.max(p.stats.views, 1)) * 100).toFixed(1)}% CTR · {p.stats.conversions} conversions</div>
            </div>
            <span className={`adm-badge`} style={{ color: p.enabled ? "#2F9E68" : "#7C756B", background: p.enabled ? "rgba(47,158,104,.12)" : "rgba(124,117,107,.12)" }}>{p.enabled ? "Actif" : "Inactif"}</span>
          </div>
          <div className="pop-sparkline-wrap">
            <Sparkline data={p.stats.daily} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Tips tab ───────────────────────────────────────────────────────── */
function TipsView() {
  const tips = [
    { icon: "clock", title: "Délai optimal", body: "Un délai de 5 à 8 secondes maximise l'engagement sans perturber la navigation." },
    { icon: "user",  title: "Personnalisation", body: "Ciblez vos clientes VIP avec des offres exclusives pour augmenter la fidélité." },
    { icon: "star",  title: "Code promo", body: "Les popups avec code promo ont un taux de conversion 3× supérieur aux popups génériques." },
    { icon: "bell",  title: "Fréquence", body: "Limitez les popups à une fois par semaine pour ne pas lasser vos clientes." },
  ];
  return (
    <div className="adm-grid-2">
      {tips.map((t) => (
        <div key={t.title} className="adm-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div className="adm-stat-icon" style={{ background: "var(--adm-gold-bg)", flexShrink: 0 }}>
            <Icon name={t.icon} size={18} color="var(--adm-gold)" />
          </div>
          <div>
            <div className="adm-card-title" style={{ fontSize: 14, marginBottom: 6 }}>{t.title}</div>
            <div style={{ fontSize: 13, color: "var(--adm-ink-soft)", lineHeight: 1.6 }}>{t.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Root Popups module ─────────────────────────────────────────────── */
export function PopupsModule() {
  const [tab, setTab] = useState<Tab>("list");
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { popups, updatePopup, insertPopup, deletePopup } = usePopups();

  function selectTab(next: Tab) {
    setTab(next);
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    const el = contentRef.current?.closest(".adm-content");
    if (el) el.scrollTop = 0;
  }, [tab]);

  function handleToggle(id: string) {
    const p = popups.find((x) => x.id === id);
    if (p) updatePopup(id, { enabled: !p.enabled });
  }

  async function handleSave(patch: Partial<Popup>) {
    if (!editingPopup) return;
    if (editingPopup.id === "__new__") {
      const { id: _id, ...rest } = patch as Popup;
      void _id;
      await insertPopup(rest as Omit<Popup, "id">);
    } else {
      await updatePopup(editingPopup.id, patch);
    }
    setEditingPopup(null);
  }

  const totalViews = popups.reduce((t, p) => t + p.stats.views, 0);
  const totalCtr = popups.length > 0
    ? ((popups.reduce((t, p) => t + p.stats.clicks, 0) / Math.max(totalViews, 1)) * 100).toFixed(1) + "%"
    : "0%";
  const totalConversions = popups.reduce((t, p) => t + p.stats.conversions, 0);
  const activeCount = popups.filter((p) => p.enabled).length;

  const tabs = [
    { id: "list" as Tab,      icon: "gift",    label: "Mes popups", badge: activeCount },
    { id: "analytics" as Tab, icon: "sliders", label: "Analytics" },
    { id: "tips" as Tab,      icon: "sparkle", label: "Bonnes pratiques" },
  ];

  return (
    <>
      <div className="adm-content">
        <div className="adm-topbar">
          <div>
            <div className="adm-page-eyebrow"><span className="dot" />DIFFUSION TEMPS RÉEL · APP CLIENTE</div>
            <h1 className="adm-h1">Popups Marketing</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="adm-avatar">L</div>
            <button className="adm-btn gold" onClick={() => setEditingPopup({ id: "__new__", name: "", enabled: true, type: "promo_code", layout: "centered", eyebrow: "", title: "", subtitle: "", code: "", ctaLabel: "Découvrir", ctaAction: "copy", emailCapture: false, accent: "#D4AF37", image: false, imageId: "", delaySec: 7, trigger: "delay", frequency: { mode: "once", days: 7 }, audience: "all", device: "all", pages: ["home"], countdown: { enabled: false, minutes: 30 }, schedule: { enabled: false, start: "", end: "" }, stats: { views: 0, closes: 0, clicks: 0, copies: 0, conversions: 0, daily: new Array(14).fill(0) } })}>
              <Icon name="plus" size={16} /> Créer une popup
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="adm-subtabs" role="tablist" aria-label="Sections popups">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`adm-subtab${tab === t.id ? " on" : ""}`}
              onClick={() => selectTab(t.id)}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
              {t.badge !== undefined && t.badge > 0 && <span className="badge">{t.badge}</span>}
            </button>
          ))}
        </div>

        <div ref={contentRef} className="adm-tab-panel" role="tabpanel">
        {/* Summary bar */}
        {tab === "list" && (
          <div className="pop-summary-bar">
            <div className="pop-summary-text">
              <div className="pop-summary-icon"><Icon name="bolt" size={17} color="var(--adm-gold)" /></div>
              <span style={{ fontSize: 13.5, color: "var(--adm-ink-soft)" }}>
                <strong style={{ color: "var(--adm-ink)" }}>{activeCount} popup{activeCount !== 1 ? "s" : ""} en ligne</strong> — diffusée{activeCount !== 1 ? "s" : ""}{" "}en temps réel sur l&apos;app cliente selon votre ciblage.
              </span>
            </div>
            <div className="pop-summary-stats">
              <div className="pop-summary-stat">
                <div className="pop-summary-val">{totalViews.toLocaleString("fr-FR")}</div>
                <div className="pop-summary-label">vues totales</div>
              </div>
              <div className="pop-summary-stat">
                <div className="pop-summary-val">{totalCtr}</div>
                <div className="pop-summary-label">taux de clic</div>
              </div>
              <div className="pop-summary-stat">
                <div className="pop-summary-val">{totalConversions}</div>
                <div className="pop-summary-label">conversions</div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {tab === "list" && (
          <div className="adm-card adm-list-card">
            {popups.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center", color: "var(--adm-ink-mute)" }}>
                <Icon name="gift" size={40} color="var(--adm-border)" />
                <div style={{ marginTop: 14, fontSize: 14, fontWeight: 600 }}>Aucune popup créée</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Créez votre première popup pour engager vos clientes</div>
              </div>
            ) : (
              popups.map((p) => {
                const ctr = p.stats.views > 0 ? ((p.stats.clicks / p.stats.views) * 100).toFixed(1) + "%" : "0%";
                return (
                  <div key={p.id} className="pop-row">
                    <div className="pop-row-icon"><Icon name="gift" size={18} color="var(--adm-gold)" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="pop-row-name">{p.name}</div>
                      <div className="pop-row-type">{p.type === "promo_code" ? "Code promo" : p.type} · {p.trigger === "delay" ? `délai ${p.delaySec}s` : p.trigger}</div>
                    </div>
                    <div className="pop-row-stats">
                      <div className="pop-row-stat">
                        <div className="pop-row-stat-val">{p.stats.views.toLocaleString("fr-FR")}</div>
                        <div className="pop-row-stat-label">vues</div>
                      </div>
                      <div className="pop-row-stat">
                        <div className="pop-row-stat-val">{ctr}</div>
                        <div className="pop-row-stat-label">CTR</div>
                      </div>
                      <div className="pop-row-stat">
                        <div className="pop-row-stat-val">{p.stats.conversions}</div>
                        <div className="pop-row-stat-label">conv.</div>
                      </div>
                    </div>
                    <div className="adm-rowactions" style={{ marginLeft: 16 }}>
                      <button className="adm-act" onClick={() => setEditingPopup(p)}>
                        <Icon name="edit" size={14} />
                      </button>
                      <button className="adm-act danger" onClick={() => deletePopup(p.id)}>
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                    <Toggle checked={p.enabled} onChange={() => handleToggle(p.id)} />
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "analytics" && <AnalyticsView popups={popups} />}
        {tab === "tips" && <TipsView />}
        </div>
      </div>

      {editingPopup && (
        <PopupEditor popup={editingPopup} onClose={() => setEditingPopup(null)} onSave={handleSave} />
      )}
    </>
  );
}
