"use client";

import { Icon } from "@/components/shared/Icon";

const SAMPLE_REVIEWS = [
  {
    author: "Sophie M.",
    rating: 5,
    product: "Sérum Éclat Vitamine C",
    text: "Produit absolument incroyable ! Ma peau est lumineuse en seulement 2 semaines.",
    date: "12 mai 2026",
    status: "pending",
  },
  {
    author: "Camille R.",
    rating: 4,
    product: "Crème Hydra-Luxe 24h",
    text: "Très bonne crème, texture légère et agréable. Léger retard de livraison.",
    date: "8 mai 2026",
    status: "pending",
  },
  {
    author: "Julie B.",
    rating: 5,
    product: "Huile Corps Rose Précieuse",
    text: "Parfum envoûtant et peau ultra douce. Je recommande vivement !",
    date: "3 mai 2026",
    status: "pending",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          size={13}
          color={i < n ? "var(--tone-gold)" : "var(--adm-border)"}
          fill={i < n ? "var(--tone-gold)" : "none"}
        />
      ))}
    </div>
  );
}

export function ReviewsModule() {
  return (
    <div className="adm-content">
      {/* Header */}
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Avis clients</h1>
          <p className="adm-sub">Modération et gestion des avis produits</p>
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="adm-card" style={{
        background: "linear-gradient(135deg, rgba(194,85,122,.06), rgba(194,85,122,.02))",
        border: "1px solid rgba(194,85,122,.18)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 22px",
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          background: "rgba(194,85,122,.12)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}>
          <Icon name="star" size={22} color="var(--tone-pink)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--adm-ink)", marginBottom: 2 }}>
            Système d&apos;avis — bientôt disponible
          </div>
          <div style={{ fontSize: 13, color: "var(--adm-ink-mute)" }}>
            La collecte et modération d&apos;avis sera disponible dans la prochaine phase. Les clients pourront laisser des avis après livraison.
          </div>
        </div>
      </div>

      {/* Stats preview */}
      <div className="adm-grid-4">
        {[
          { label: "Avis total", value: "—", color: "var(--adm-ink-mute)" },
          { label: "Note moyenne", value: "—", color: "var(--tone-gold)" },
          { label: "En attente", value: "—", color: "var(--tone-orange)" },
          { label: "Publiés", value: "—", color: "var(--tone-green)" },
        ].map((s) => (
          <div key={s.label} className="adm-card adm-stat" style={{ opacity: 0.5 }}>
            <div className="adm-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Preview reviews */}
      <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--adm-border)" }}>
          <div className="adm-card-title">Aperçu — format des avis à venir</div>
          <div className="adm-card-sub">Ces avis sont des exemples illustratifs</div>
        </div>
        <div>
          {SAMPLE_REVIEWS.map((r, i) => (
            <div
              key={i}
              style={{
                padding: "16px 20px",
                borderBottom: i < SAMPLE_REVIEWS.length - 1 ? "1px solid var(--adm-border-2)" : "none",
                opacity: 0.55,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--adm-gold-bg)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--adm-gold)",
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {r.author[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--adm-ink)" }}>{r.author}</span>
                    <Stars n={r.rating} />
                    <span className="adm-badge" style={{ background: "rgba(199,122,51,.1)", color: "var(--tone-orange)", marginLeft: "auto" }}>
                      En attente
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginBottom: 6 }}>
                    {r.product} · {r.date}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--adm-ink-soft)", margin: 0, lineHeight: 1.5 }}>{r.text}</p>
                </div>
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
            "Collecte automatique d'avis après livraison (email trigger)",
            "Interface de modération : approuver / rejeter / répondre",
            "Affichage des avis sur les fiches produits (app cliente)",
            "Note moyenne et distribution des étoiles par produit",
            "Export CSV des avis pour analyse",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--adm-border)",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, color: "var(--adm-ink-soft)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
