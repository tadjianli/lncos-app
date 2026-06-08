"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/shared/Icon";

/* ─── Stats card ─────────────────────────────────────────────── */

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 8px",
        borderRadius: "var(--r-md)",
        background: "rgba(212,175,55,.08)",
        border: "1px solid rgba(212,175,55,.14)",
      }}
    >
      <span
        style={{
          fontSize: "var(--fs-h1)",
          fontWeight: 700,
          lineHeight: 1,
          color: "var(--gold)",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "var(--fs-nano)",
          color: "var(--ink-mute)",
          marginTop: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Menu row ───────────────────────────────────────────────── */

function MenuRow({
  icon,
  iconBg,
  title,
  subtitle,
  subtitleColor,
  isLast,
}: {
  icon: string;
  iconBg?: string;
  title: string;
  subtitle: string;
  subtitleColor?: string;
  isLast?: boolean;
}) {
  return (
    <>
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
          padding: "14px 18px",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: iconBg || "var(--charcoal-3)",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
          }}
        >
          <Icon name={icon} size={20} color="var(--gold)" />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
            {title}
          </div>
          <div
            style={{
              fontSize: 12,
              marginTop: 2,
              color: subtitleColor || "var(--ink-mute)",
            }}
          >
            {subtitle}
          </div>
        </div>
        <Icon name="chevR" size={18} color="var(--ink-mute)" />
      </button>
      {!isLast && (
        <div
          style={{
            margin: "0 18px",
            height: 1,
            background: "rgba(255,255,255,.06)",
          }}
        />
      )}
    </>
  );
}

/* ─── Profile page ───────────────────────────────────────────── */

export default function ProfilePage() {
  return (
    <AppShell>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "58px 18px 20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "var(--fs-h2)",
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          Profil
        </h1>
        <button style={{ color: "var(--ink-soft)" }}>
          <Icon name="bell" size={22} />
        </button>
      </div>

      <div
        style={{
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* User card */}
        <div
          style={{
            borderRadius: "var(--r-lg)",
            padding: "18px 18px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "linear-gradient(160deg, rgba(40,33,22,.9), rgba(20,16,10,.96))",
            border: "1px solid rgba(212,175,55,.18)",
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "var(--pink-light)",
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
              fontSize: 28,
              fontWeight: 700,
              color: "#C77B98",
            }}
          >
            E
          </div>
          <div>
            <div
              style={{
                fontSize: "var(--fs-title)",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              Emma Dubois
            </div>
            <div
              style={{
                fontSize: "var(--fs-xs)",
                color: "var(--ink-mute)",
                marginTop: 3,
              }}
            >
              emma.d@email.com
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: "var(--r-pill)",
                border: "1px solid rgba(212,175,55,.35)",
                background: "rgba(212,175,55,.08)",
              }}
            >
              <Icon name="crown" size={12} color="var(--gold)" />
              <span
                style={{
                  fontSize: "var(--fs-nano)",
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                }}
              >
                Membre Or
              </span>
            </div>
          </div>
        </div>

        {/* RDV CTA */}
        <button
          style={{
            width: "100%",
            borderRadius: "var(--r-lg)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 18px",
            background: "var(--gold-grad)",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(0,0,0,.22)",
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
            }}
          >
            <Icon name="calendar" size={22} color="rgba(0,0,0,.8)" />
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "var(--fs-body)",
                fontWeight: 700,
                color: "#1a1306",
              }}
            >
              Prendre rendez-vous
            </div>
            <div
              style={{
                fontSize: "var(--fs-nano)",
                color: "rgba(26,18,0,.7)",
                marginTop: 2,
              }}
            >
              Manucure · extensions · nail art — en 60s
            </div>
          </div>
          <Icon name="arrowR" size={22} color="rgba(26,18,0,.7)" />
        </button>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10 }}>
          <StatCard value="12"    label="Commandes" />
          <StatCard value="1 240" label="Points"    />
          <StatCard value="2"     label="Favoris"   />
        </div>

        {/* Menu */}
        <div
          style={{
            borderRadius: "var(--r-lg)",
            background: "var(--charcoal)",
            border: "1px solid rgba(255,255,255,.05)",
            overflow: "hidden",
          }}
        >
          <MenuRow
            icon="calendar"
            iconBg="rgba(212,175,55,.12)"
            title="Mes rendez-vous"
            subtitle="1 à venir"
            subtitleColor="var(--gold)"
          />
          <MenuRow
            icon="bag"
            title="Mes commandes"
            subtitle="3 en cours"
          />
          <MenuRow
            icon="heart"
            title="Mes favoris"
            subtitle="2 produits"
          />
          <MenuRow
            icon="crown"
            iconBg="rgba(212,175,55,.12)"
            title="Programme VIP"
            subtitle="Niveau Or · 1 240 pts"
            subtitleColor="var(--gold)"
            isLast
          />
        </div>
      </div>
    </AppShell>
  );
}
