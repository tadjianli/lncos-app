"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast } from "@/components/admin/AdminToast";
import {
  RdvCatalogLinkPanel,
  RdvDepositSettingsPanel,
  RdvPageSettingsPanel,
} from "@/components/admin/RdvSettingsSection";
import { LegalSettingsPanel } from "@/components/admin/LegalSettingsPanel";

interface SettingValues {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  mondayOpen: string;
  mondayClose: string;
  saturdayOpen: string;
  saturdayClose: string;
  sundayClosed: boolean;
  stripePublishableKey: string;
  vatRate: string;
  emailSender: string;
  emailReplyTo: string;
  pushEnabled: boolean;
  pwaName: string;
  pwaShortName: string;
  pwaThemeColor: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  loyaltyPointsPerEur: string;
  loyaltyMinOrder: string;
}

const DEFAULT_SETTINGS: SettingValues = {
  storeName: "LN COS",
  storeAddress: "",
  storePhone: "",
  storeEmail: "",
  mondayOpen: "09:00",
  mondayClose: "19:00",
  saturdayOpen: "10:00",
  saturdayClose: "18:00",
  sundayClosed: true,
  stripePublishableKey: "",
  vatRate: "20",
  emailSender: "LN COS <hello@lncos.fr>",
  emailReplyTo: "",
  pushEnabled: false,
  pwaName: "LN COS — Nail Art & Beauté",
  pwaShortName: "LN COS",
  pwaThemeColor: "#1A1612",
  welcomeTitle: "Votre beauté, sublimée.",
  welcomeSubtitle: "Nail art premium · Soins · Parfums",
  loyaltyPointsPerEur: "10",
  loyaltyMinOrder: "15",
};

function loadSettings(): SettingValues {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("lncos-admin-settings");
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function SaveRow({ onSave }: { onSave: () => void }) {
  return (
    <div style={{ padding: "12px 0 4px", display: "flex", justifyContent: "flex-end" }}>
      <button className="adm-btn gold sm" onClick={onSave}>
        <Icon name="check" size={14} /> Enregistrer
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="ab-field" style={{ marginTop: 12 }}>
      <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5 }}>{label}</label>
      <input
        className="ab-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 6,
      background: "rgba(59,125,216,.12)",
      color: "var(--tone-blue)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: ".06em",
      marginLeft: 8,
    }}>À CONNECTER</span>
  );
}

export function SettingsModule() {
  const [values, setValues] = useState<SettingValues>(DEFAULT_SETTINGS);
  const [active, setActive] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setValues(loadSettings());
  }, []);

  function set<K extends keyof SettingValues>(key: K, val: SettingValues[K]) {
    setValues((p) => ({ ...p, [key]: val }));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function save() {
    localStorage.setItem("lncos-admin-settings", JSON.stringify(values));
    showToast("Paramètres enregistrés");
  }

  const toggle = (key: string) => setActive(active === key ? null : key);

  const GROUPS = [
    {
      title: "Boutique",
      items: [
        {
          icon: "sparkle", label: "Informations de la boutique", sub: "Nom, adresse, contact",
          content: (
            <>
              <Field label="Nom de la boutique" value={values.storeName} onChange={(v) => set("storeName", v)} />
              <Field label="Adresse" value={values.storeAddress} onChange={(v) => set("storeAddress", v)} placeholder="12 rue de la Paix, Paris" />
              <Field label="Téléphone" value={values.storePhone} onChange={(v) => set("storePhone", v)} placeholder="+33 6 00 00 00 00" type="tel" />
              <Field label="Email de contact" value={values.storeEmail} onChange={(v) => set("storeEmail", v)} placeholder="contact@lncos.fr" type="email" />
              <SaveRow onSave={save} />
            </>
          ),
        },
        {
          icon: "star", label: "Horaires d'ouverture", sub: "Jours et heures d'ouverture",
          content: (
            <>
              <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 12, marginBottom: 4 }}>Lundi – Vendredi</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="ab-input" type="time" value={values.mondayOpen} onChange={(e) => set("mondayOpen", e.target.value)} />
                <span style={{ color: "var(--adm-ink-mute)" }}>→</span>
                <input className="ab-input" type="time" value={values.mondayClose} onChange={(e) => set("mondayClose", e.target.value)} />
              </div>
              <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 10, marginBottom: 4 }}>Samedi</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="ab-input" type="time" value={values.saturdayOpen} onChange={(e) => set("saturdayOpen", e.target.value)} />
                <span style={{ color: "var(--adm-ink-mute)" }}>→</span>
                <input className="ab-input" type="time" value={values.saturdayClose} onChange={(e) => set("saturdayClose", e.target.value)} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer", fontSize: 13, color: "var(--adm-ink-mute)" }}>
                <input type="checkbox" checked={values.sundayClosed} onChange={(e) => set("sundayClosed", e.target.checked)} />
                Dimanche fermé
              </label>
              <SaveRow onSave={save} />
            </>
          ),
        },
        {
          icon: "bag", label: "Livraison & frais de port", sub: "Zones, tarifs, délais",
          content: (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(59,125,216,.06)", border: "1px solid rgba(59,125,216,.15)", borderRadius: 8 }}>
              <div style={{ fontSize: 12.5, color: "var(--tone-blue)", fontWeight: 600 }}>Module dédié disponible</div>
              <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 4, lineHeight: 1.6 }}>
                Gérez les méthodes de livraison (prix, délais, icônes, activation) depuis le module{" "}
                <a href="/admin/shipping" style={{ color: "var(--adm-gold)", fontWeight: 600 }}>Livraison</a>{" "}
                dans le menu latéral.
              </div>
            </div>
          ),
        },
        {
          icon: "info", label: "Pages légales", sub: "Hébergement — mentions légales",
          content: <LegalSettingsPanel onSaved={showToast} />,
        },
      ],
    },
    {
      title: "Paiement",
      items: [
        {
          icon: "sliders", label: "Stripe", sub: "Configuration du prestataire de paiement",
          badge: <ComingSoonBadge />,
          content: (
            <>
              <Field
                label="Clé publique Stripe (pk_live_...)"
                value={values.stripePublishableKey}
                onChange={(v) => set("stripePublishableKey", v)}
                placeholder="pk_live_..."
              />
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(59,125,216,.06)", border: "1px solid rgba(59,125,216,.15)", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>
                  La clé secrète (STRIPE_SECRET_KEY) et le secret webhook (STRIPE_WEBHOOK_SECRET) sont configurés
                  via les variables d&apos;environnement serveur et ne sont jamais exposés côté client.
                </div>
              </div>
              <SaveRow onSave={save} />
            </>
          ),
        },
        {
          icon: "gift", label: "Devises & TVA", sub: "Euro, TVA applicable aux produits",
          content: (
            <>
              <div className="ab-field" style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginBottom: 5 }}>Devise</label>
                <select className="ab-input" defaultValue="eur">
                  <option value="eur">Euro (€)</option>
                  <option value="usd">US Dollar ($)</option>
                  <option value="gbp">British Pound (£)</option>
                </select>
              </div>
              <Field label="Taux de TVA (%)" value={values.vatRate} onChange={(v) => set("vatRate", v)} type="number" />
              <SaveRow onSave={save} />
            </>
          ),
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: "star", label: "Emails transactionnels", sub: "Expéditeur, template de confirmation",
          badge: <ComingSoonBadge />,
          content: (
            <>
              <Field label="Expéditeur" value={values.emailSender} onChange={(v) => set("emailSender", v)} placeholder="LN COS <hello@lncos.fr>" />
              <Field label="Reply-to" value={values.emailReplyTo} onChange={(v) => set("emailReplyTo", v)} type="email" />
              <SaveRow onSave={save} />
            </>
          ),
        },
        {
          icon: "sparkle", label: "Notifications push", sub: "Clés VAPID et conditions d'envoi",
          badge: <ComingSoonBadge />,
          content: (
            <>
              <div className="ab-field" style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ margin: 0, fontSize: 12 }}>Activer les notifications push</label>
                <label className="ab-toggle" style={{ cursor: "pointer" }}>
                  <input type="checkbox" checked={values.pushEnabled} onChange={(e) => set("pushEnabled", e.target.checked)} />
                  <div className="ab-toggle-track" />
                  <div className="ab-toggle-thumb" />
                </label>
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(59,125,216,.06)", border: "1px solid rgba(59,125,216,.15)", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>
                  Les clés VAPID sont configurées automatiquement via le manifest PWA. Aucune action requise.
                </div>
              </div>
              <SaveRow onSave={save} />
            </>
          ),
        },
      ],
    },
    {
      title: "Application cliente",
      items: [
        {
          icon: "grid", label: "PWA & manifest", sub: "Icône, nom court, couleur de thème",
          content: (
            <>
              <Field label="Nom complet de l'app" value={values.pwaName} onChange={(v) => set("pwaName", v)} />
              <Field label="Nom court" value={values.pwaShortName} onChange={(v) => set("pwaShortName", v)} />
              <Field label="Couleur de thème" value={values.pwaThemeColor} onChange={(v) => set("pwaThemeColor", v)} type="color" />
              <SaveRow onSave={save} />
            </>
          ),
        },
        {
          icon: "flame", label: "Bannière de bienvenue", sub: "Texte et image de l'onboarding",
          content: (
            <>
              <Field label="Titre" value={values.welcomeTitle} onChange={(v) => set("welcomeTitle", v)} />
              <Field label="Sous-titre" value={values.welcomeSubtitle} onChange={(v) => set("welcomeSubtitle", v)} />
              <SaveRow onSave={save} />
            </>
          ),
        },
        {
          icon: "heart", label: "Programme de fidélité", sub: "Règles d'accumulation de points",
          content: (
            <>
              <Field label="Points par euro dépensé" value={values.loyaltyPointsPerEur} onChange={(v) => set("loyaltyPointsPerEur", v)} type="number" />
              <Field label="Commande minimum pour points (€)" value={values.loyaltyMinOrder} onChange={(v) => set("loyaltyMinOrder", v)} type="number" />
              <SaveRow onSave={save} />
            </>
          ),
        },
      ],
    },
    {
      title: "Rendez-vous",
      items: [
        {
          icon: "calendar",
          label: "Page RDV client",
          sub: "Textes hero, bandeau confiance, confirmation",
          content: <RdvPageSettingsPanel onSaved={showToast} />,
        },
        {
          icon: "sliders",
          label: "Acompte & réservation",
          sub: "Paiement Stripe à la réservation",
          content: <RdvDepositSettingsPanel onSaved={showToast} />,
        },
        {
          icon: "star",
          label: "Prestations & équipe",
          sub: "Services, prothésistes, créneaux",
          content: <RdvCatalogLinkPanel />,
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          icon: "user", label: "Comptes administrateurs", sub: "Gérer les accès et rôles admin",
          badge: <ComingSoonBadge />,
          content: (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(59,125,216,.06)", border: "1px solid rgba(59,125,216,.15)", borderRadius: 8 }}>
              <div style={{ fontSize: 12.5, color: "var(--tone-blue)", fontWeight: 600 }}>Gestion des rôles admin</div>
              <div style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 4 }}>
                Invitez des administrateurs via le dashboard Supabase → Authentication → Users. Définissez <code style={{ fontSize: 11 }}>is_admin = true</code> dans la table profiles.
              </div>
            </div>
          ),
        },
        {
          icon: "sliders", label: "Journaux d'activité", sub: "Historique des actions admin",
          badge: <ComingSoonBadge />,
          content: (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(59,125,216,.06)", border: "1px solid rgba(59,125,216,.15)", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>
                Les journaux d&apos;activité seront disponibles une fois le système d&apos;audit Supabase configuré.
              </div>
            </div>
          ),
        },
        {
          icon: "x", label: "Zone de danger", sub: "Réinitialisation, export de données",
          danger: true,
          content: (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="adm-btn ghost sm"
                style={{ alignSelf: "flex-start", color: "var(--tone-pink)", borderColor: "rgba(194,85,122,.3)" }}
                onClick={() => {
                  if (confirm("Réinitialiser tous les paramètres locaux ? (Supabase non affecté)")) {
                    localStorage.removeItem("lncos-admin-settings");
                    setValues(DEFAULT_SETTINGS);
                    showToast("Paramètres réinitialisés");
                  }
                }}
              >
                Réinitialiser les paramètres locaux
              </button>
              <div style={{ fontSize: 11, color: "var(--adm-ink-mute)" }}>
                Supprime uniquement les paramètres stockés localement. Les données Supabase ne sont pas affectées.
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <>
      <div className="adm-content">
        <div className="adm-topbar">
          <div>
            <h1 className="adm-h1">Paramètres</h1>
            <p className="adm-sub">Configuration globale de LN COS</p>
          </div>
        </div>

        {/* Settings groups */}
        {GROUPS.map((group) => (
          <div key={group.title} className="adm-card adm-settings-card">
            <div className="adm-settings-head">
              <div className="adm-settings-grouptitle">{group.title}</div>
            </div>
            <div className="adm-list-card-body">
              {group.items.map((item) => {
                const key = item.label;
                const isOpen = active === key;
                return (
                  <div key={key}>
                    <button
                      type="button"
                      className={`adm-setrow${isOpen ? " on" : ""}`}
                      aria-expanded={isOpen}
                      onClick={() => toggle(key)}
                    >
                      <div
                        className="adm-set-icon"
                        style={("danger" in item && item.danger) ? { background: "rgba(194,85,122,.1)" } : {}}
                      >
                        <Icon
                          name={item.icon as "sparkle"}
                          size={18}
                          color={("danger" in item && item.danger) ? "var(--tone-pink)" : "var(--adm-ink-soft)"}
                        />
                      </div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div className="adm-set-t" style={("danger" in item && item.danger) ? { color: "var(--tone-pink)" } : {}}>
                          {item.label}
                          {"badge" in item && item.badge}
                        </div>
                        <div className="adm-set-s">{item.sub}</div>
                      </div>
                      <Icon
                        name="chevR"
                        size={16}
                        color="var(--adm-ink-mute)"
                        style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}
                      />
                    </button>
                    {isOpen && (
                      <div className="adm-set-panel">
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Version info */}
        <div style={{ padding: "8px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>LN COS Admin · Phase 2 build</span>
          <span style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>v2.0.0-beta</span>
        </div>
      </div>

      {toast && <AdminToast msg={toast} />}
    </>
  );
}
