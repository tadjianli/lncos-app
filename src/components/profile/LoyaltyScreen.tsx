"use client";
/**
 * LN COS — Loyalty / VIP screen (from handoff screens-account.jsx LoyaltyScreen)
 */

import { Icon } from "@/components/shared/Icon";
import { SubHeader, PinkBtn } from "@/components/shared/ActionButtons";

const POINTS = 1240;
const NEXT = 2000;
const PCT = Math.round((POINTS / NEXT) * 100);

const REWARDS = [
  { i: "gift",    t: "-15% sur tout",         s: "500 pts",   unlocked: true  },
  { i: "truck",   t: "Livraison express offerte", s: "800 pts",  unlocked: true  },
  { i: "sparkle", t: "Coffret découverte",     s: "1 500 pts", unlocked: false },
  { i: "crown",   t: "Soin VIP exclusif",      s: "2 500 pts", unlocked: false },
];

const TIERS = [
  { t: "Argent",  p: "0",     on: false },
  { t: "Or",      p: "1 000", on: true  },
  { t: "Platine", p: "2 000", on: false },
];

interface LoyaltyScreenProps {
  onClose: () => void;
}

export function LoyaltyScreen({ onClose }: LoyaltyScreenProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        zIndex: 80,
        animation: "slideUp .3s cubic-bezier(.2,.8,.2,1) both",
      }}
    >
      <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
        <SubHeader title="Programme VIP" onBack={onClose} />
      </div>

      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "4px 18px 24px" }}>
        {/* Points card */}
        <div
          style={{
            borderRadius: "var(--r-lg)",
            padding: "26px 22px",
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
            background: "linear-gradient(135deg, #241a10 0%, #2c2012 50%, #1a130b 100%)",
            border: "1px solid rgba(212,175,55,.35)",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,175,55,.2), transparent 70%)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 14,
                padding: "5px 14px",
                borderRadius: "var(--r-pill)",
                background: "rgba(212,175,55,.15)",
                border: "1px solid rgba(212,175,55,.3)",
              }}
            >
              <Icon name="crown" size={14} color="var(--gold)" fill="rgba(212,175,55,.4)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: ".08em" }}>
                NIVEAU OR
              </span>
            </div>
            <div className="gold-text" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}>
              {POINTS.toLocaleString("fr")}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, letterSpacing: ".06em" }}>
              POINTS FIDÉLITÉ
            </div>
          </div>
        </div>

        {/* Progress */}
        <div
          style={{
            marginBottom: 16,
            padding: 18,
            borderRadius: "var(--r-md)",
            background: "var(--charcoal)",
            border: "1px solid rgba(255,255,255,.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
            <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
              Vers le niveau <span style={{ color: "var(--gold)", fontWeight: 600 }}>Platine</span>
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>
              {POINTS} / {NEXT}
            </span>
          </div>
          <div style={{ height: 9, borderRadius: 5, background: "var(--charcoal-2)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: PCT + "%",
                background: "var(--gold-grad)",
                borderRadius: 5,
                transition: "width 1s ease",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 9 }}>
            Plus que{" "}
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>{NEXT - POINTS} points</span>{" "}
            pour débloquer les avantages Platine.
          </div>
        </div>

        {/* Tiers */}
        <div style={{ display: "flex", gap: 9, marginBottom: 24 }}>
          {TIERS.map((t) => (
            <div
              key={t.t}
              style={{
                flex: 1,
                padding: "13px 8px",
                borderRadius: "var(--r-md)",
                textAlign: "center",
                background: t.on ? "rgba(212,175,55,.1)" : "var(--charcoal)",
                border: t.on ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.05)",
              }}
            >
              <Icon name="crown" size={20} color={t.on ? "var(--gold)" : "var(--ink-mute)"} fill={t.on ? "rgba(212,175,55,.3)" : "none"} />
              <div style={{ fontSize: 12.5, fontWeight: 700, color: t.on ? "var(--gold)" : "var(--ink-soft)", marginTop: 6 }}>
                {t.t}
              </div>
              <div style={{ fontSize: 10, color: "var(--ink-mute)", marginTop: 1 }}>{t.p} pts</div>
            </div>
          ))}
        </div>

        {/* Rewards */}
        <h3 style={{ margin: "0 0 14px", fontWeight: 600, fontSize: "var(--fs-h3)", color: "var(--ink)" }}>
          Récompenses
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {REWARDS.map((r) => (
            <div
              key={r.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: "var(--r-md)",
                background: "var(--charcoal)",
                border: "1px solid rgba(255,255,255,.05)",
                opacity: r.unlocked ? 1 : 0.55,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: r.unlocked ? "rgba(212,175,55,.12)" : "var(--charcoal-2)",
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 auto",
                }}
              >
                <Icon name={r.i} size={20} color={r.unlocked ? "var(--gold)" : "var(--ink-mute)"} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{r.t}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 1 }}>{r.s}</div>
              </div>
              {r.unlocked ? (
                <PinkBtn style={{ width: "auto", padding: "8px 16px", fontSize: 12 }}>
                  Utiliser
                </PinkBtn>
              ) : (
                <Icon name="clock" size={18} color="var(--ink-mute)" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
