export default function DashboardPage() {
  return (
    <div className="adm-content">
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Bonjour, LN COS ✨</h1>
          <div className="adm-sub">Voici l&apos;activité de votre boutique aujourd&apos;hui</div>
        </div>
      </div>

      {/* KPI cards placeholder */}
      <div className="adm-grid-4">
        {[
          { label: "Ventes totales",  value: "12 590 €", delta: "+18,2%",  up: true  },
          { label: "Commandes",       value: "245",       delta: "+11,2%",  up: true  },
          { label: "Clients",         value: "1 248",     delta: "+8,7%",   up: true  },
          { label: "Panier moyen",    value: "51,40 €",   delta: "+2,1%",   up: true  },
        ].map((s) => (
          <div key={s.label} className="adm-card adm-stat">
            <div className="adm-stat-top">
              <span className="adm-stat-icon" style={{ background: "rgba(212,175,55,.12)", color: "#B8902B" }}>—</span>
              <span className={`adm-delta ${s.up ? "up" : "down"}`}>{s.delta}</span>
            </div>
            <div className="adm-stat-value">{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Placeholder body */}
      <div className="adm-card">
        <div className="adm-card-head">
          <div className="adm-card-title">Tableau de bord</div>
          <div className="adm-card-sub">Les modules seront ajoutés en Phase 6.</div>
        </div>
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>
          Utilisez la navigation à gauche pour accéder aux sections.
        </div>
      </div>
    </div>
  );
}
