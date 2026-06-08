"use client";

import { Icon } from "@/components/shared/Icon";

const SAMPLE_PROMOS = [
  {
    code: "BIENVENUE10",
    desc: "10% de réduction pour les nouveaux clients",
    type: "Pourcentage",
    value: "10%",
    uses: 0,
    maxUses: 500,
    expiry: "31 déc. 2026",
    active: false,
  },
  {
    code: "FLASH25",
    desc: "Vente flash — 25% sur toute la gamme visage",
    type: "Pourcentage",
    value: "25%",
    uses: 0,
    maxUses: 100,
    expiry: "30 juin 2026",
    active: false,
  },
  {
    code: "LIVRAISONGRATUITE",
    desc: "Livraison gratuite dès 50 € d'achat",
    type: "Livraison",
    value: "Gratuit",
    uses: 0,
    maxUses: null,
    expiry: "Illimité",
    active: false,
  },
];

export function PromotionsModule() {
  return (
    <div className="adm-content">
      {/* Header */}
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Promotions</h1>
          <p className="adm-sub">Codes promo et campagnes de réduction</p>
        </div>
        <button className="adm-btn gold is-disabled">
          <Icon name="plus" size={15} /> Créer un code
        </button>
      </div>

      {/* Coming soon banner */}
      <div className="adm-card" style={{
        background: "linear-gradient(135deg, rgba(212,175,55,.08), rgba(212,175,55,.03))",
        border: "1px solid rgba(212,175,55,.2)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 22px",
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          background: "var(--adm-gold-bg)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}>
          <Icon name="sparkle" size={22} color="var(--adm-gold)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--adm-ink)", marginBottom: 2 }}>
            Module promotions — bientôt disponible
          </div>
          <div style={{ fontSize: 13, color: "var(--adm-ink-mute)" }}>
            La gestion des codes promo sera connectée à Stripe et au moteur de checkout dans la prochaine phase de développement.
          </div>
        </div>
      </div>

      {/* Preview of upcoming promo structure */}
      <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--adm-border)" }}>
          <div className="adm-card-title">Aperçu des codes à venir</div>
          <div className="adm-card-sub">Ces codes seront activables une fois Stripe connecté</div>
        </div>
        <div className="adm-promo-grid" style={{ padding: "8px 0" }}>
          {SAMPLE_PROMOS.map((p) => (
            <div key={p.code} className="adm-promo" style={{ padding: "14px 20px", borderBottom: "1px solid var(--adm-border-2)", opacity: 0.6 }}>
              <div className="adm-promo-icon">
                <Icon name="gift" size={18} color="var(--adm-gold)" />
              </div>
              <div className="adm-promo-main">
                <div className="adm-promo-coderow">
                  <span className="adm-promo-code">{p.code}</span>
                  <span className="adm-badge" style={{ background: "var(--adm-surface-2)", color: "var(--adm-ink-mute)", fontSize: 11 }}>
                    {p.type}
                  </span>
                  <span className="adm-badge" style={{ background: "rgba(199,122,51,.1)", color: "var(--tone-orange)", fontSize: 11 }}>
                    Inactif
                  </span>
                </div>
                <div className="adm-promo-desc">{p.desc}</div>
                <div className="adm-promo-foot">
                  <span>{p.uses} utilisation{p.uses !== 1 ? "s" : ""}{p.maxUses ? ` / ${p.maxUses}` : ""}</span>
                  <span>Expire : {p.expiry}</span>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "var(--adm-gold)", whiteSpace: "nowrap", alignSelf: "center" }}>
                {p.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ marginBottom: 16 }}>Fonctionnalités prévues</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "sparkle", label: "Création et édition de codes promo", done: false },
            { icon: "sliders", label: "Règles de réduction avancées (catégorie, montant min)", done: false },
            { icon: "bag",     label: "Intégration Stripe Coupons API", done: false },
            { icon: "star",    label: "Statistiques d'utilisation en temps réel", done: false },
            { icon: "gift",    label: "Campagnes email liées aux codes", done: false },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "var(--adm-surface-2)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}>
                <Icon name={item.icon as "sparkle"} size={15} color="var(--adm-ink-mute)" />
              </div>
              <span style={{ fontSize: 13, color: "var(--adm-ink-soft)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
