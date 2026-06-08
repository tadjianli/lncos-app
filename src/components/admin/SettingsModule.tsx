"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";

const GROUPS = [
  {
    title: "Boutique",
    items: [
      { icon: "sparkle", label: "Informations de la boutique", sub: "Nom, adresse, contact" },
      { icon: "star",    label: "Horaires d'ouverture",        sub: "Jours et heures d'ouverture" },
      { icon: "bag",     label: "Livraison & frais de port",   sub: "Zones, tarifs, délais" },
    ],
  },
  {
    title: "Paiement",
    items: [
      { icon: "sliders", label: "Stripe",                       sub: "Clés API et configuration de paiement" },
      { icon: "gift",    label: "Devises & TVA",                sub: "Euro, TVA applicable aux produits" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { icon: "star",    label: "Emails transactionnels",       sub: "Expéditeur, template de confirmation" },
      { icon: "sparkle", label: "Notifications push",           sub: "Clés VAPID et conditions d'envoi" },
    ],
  },
  {
    title: "Application cliente",
    items: [
      { icon: "grid",    label: "PWA & manifest",               sub: "Icône, nom court, couleur de thème" },
      { icon: "flame",   label: "Bannière de bienvenue",        sub: "Texte et image de l'onboarding" },
      { icon: "heart",   label: "Programme de fidélité",        sub: "Règles d'accumulation de points" },
    ],
  },
  {
    title: "Administration",
    items: [
      { icon: "user",    label: "Comptes administrateurs",      sub: "Gérer les accès et rôles admin" },
      { icon: "sliders", label: "Journaux d'activité",          sub: "Historique des actions admin" },
      { icon: "x",       label: "Zone de danger",               sub: "Réinitialisation, export de données", danger: true },
    ],
  },
];

export function SettingsModule() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="adm-content">
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Paramètres</h1>
          <p className="adm-sub">Configuration globale de LN COS</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="adm-card" style={{
        background: "linear-gradient(135deg, rgba(59,125,216,.07), rgba(59,125,216,.02))",
        border: "1px solid rgba(59,125,216,.18)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: "rgba(59,125,216,.14)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}>
          <Icon name="sliders" size={20} color="var(--tone-blue)" />
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--adm-ink)", marginBottom: 2 }}>
            Paramètres en cours de développement
          </div>
          <div style={{ fontSize: 12.5, color: "var(--adm-ink-mute)" }}>
            Les formulaires de configuration seront disponibles une fois les intégrations Stripe et email connectées.
          </div>
        </div>
      </div>

      {/* Settings groups */}
      {GROUPS.map((group) => (
        <div key={group.title} className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--adm-border)",
          }}>
            <div className="adm-settings-grouptitle">{group.title}</div>
          </div>
          <div>
            {group.items.map((item, i) => (
              <button
                key={item.label}
                className="adm-setrow"
                style={{
                  borderBottom: i < group.items.length - 1 ? "1px solid var(--adm-border-2)" : "none",
                  width: "100%",
                }}
                onClick={() => setActive(active === item.label ? null : item.label)}
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
                  <div
                    className="adm-set-t"
                    style={("danger" in item && item.danger) ? { color: "var(--tone-pink)" } : {}}
                  >
                    {item.label}
                  </div>
                  <div className="adm-set-s">{item.sub}</div>
                </div>
                <Icon
                  name="chevR"
                  size={16}
                  color="var(--adm-ink-mute)"
                  style={{ transform: active === item.label ? "rotate(90deg)" : "none", transition: "transform .2s" }}
                />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Version info */}
      <div style={{ padding: "8px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>LN COS Admin · Phase 2 build</span>
        <span style={{ fontSize: 12, color: "var(--adm-ink-mute)" }}>v2.0.0-beta</span>
      </div>
    </div>
  );
}
