"use client";
/**
 * LN COS — Loyalty / VIP screen — premium redesign
 */

import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/shared/Icon";
import { SubHeader, PinkBtn } from "@/components/shared/ActionButtons";
import { useLoyaltyStore } from "@/lib/stores/loyalty-store";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const TIERS = [
  { key: "bronze",  label: "Bronze",  min: 0    },
  { key: "argent",  label: "Argent",  min: 500  },
  { key: "or",      label: "Or",      min: 1000 },
  { key: "platine", label: "Platine", min: 2000 },
];

const REWARDS = [
  { i: "gift",    t: "-15% sur tout",            s: "500 pts",   threshold: 500  },
  { i: "truck",   t: "Livraison express offerte", s: "800 pts",   threshold: 800  },
  { i: "sparkle", t: "Coffret découverte",        s: "1 500 pts", threshold: 1500 },
  { i: "crown",   t: "Soin VIP exclusif",         s: "2 500 pts", threshold: 2500 },
  { i: "star",    t: "Accès vente privée",         s: "3 000 pts", threshold: 3000 },
  { i: "heart",   t: "Cadeau anniversaire",        s: "4 000 pts", threshold: 4000 },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

interface LoyaltyScreenProps {
  onClose: () => void;
}

export function LoyaltyScreen({ onClose }: LoyaltyScreenProps) {
  const userPts      = useLoyaltyStore((s) => s.points);
  const tierKey      = useLoyaltyStore((s) => s.tier());
  const transactions = useLoyaltyStore((s) => s.transactions);

  const tierIdx = TIERS.findIndex((t) => t.key === tierKey);
  const currentTierIdx = tierIdx >= 0 ? tierIdx : 0;

  const [mounted, setMounted]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [displayPts, setDisplayPts] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);

    const DURATION = 1600;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / DURATION);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPts(Math.round(eased * userPts));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [userPts]);

  const nextTier    = TIERS[currentTierIdx + 1];
  const currTierMin = TIERS[currentTierIdx].min;
  const nextTierMin = nextTier?.min ?? currTierMin;
  const ptsInTier   = userPts - currTierMin;
  const tierRange   = nextTierMin - currTierMin;
  const pct         = Math.min(100, Math.round((ptsInTier / (tierRange || 1)) * 100));
  const ptsToNext   = nextTierMin - userPts;

  function handleCopy() {
    navigator.clipboard?.writeText("LNCOS-VIP").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overlay-screen">
      <SubHeader title="Programme Fidélité" onBack={onClose} safeArea />

      {/* Scroll area */}
      <div className="noscroll overlay-screen-scroll" style={{ paddingBottom: 16 }}>
        <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── VIP Member Card ────────────────────────────────────────── */}
          <div
            style={{
              background: "linear-gradient(135deg, #241d0a 0%, #1a1306 45%, #2c2318 100%)",
              borderRadius: 20,
              padding: "24px 22px 20px",
              border: "1px solid rgba(212,175,55,.28)",
              boxShadow: "0 24px 60px -20px rgba(212,175,55,.35)",
              position: "relative",
              overflow: "hidden",
              minHeight: 160,
            }}
          >
            {/* Background shimmer pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(60deg, rgba(212,175,55,.03) 0px, rgba(212,175,55,.03) 1px, transparent 1px, transparent 20px)",
                pointerEvents: "none",
              }}
            />

            {/* Top-right glow orb */}
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(212,175,55,.22), transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Card header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
                position: "relative",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: ".22em",
                    textTransform: "uppercase",
                    color: "rgba(212,175,55,.6)",
                    marginBottom: 3,
                  }}
                >
                  Carte Membre
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--gold)",
                    letterSpacing: ".04em",
                  }}
                >
                  LN COS Club
                </div>
              </div>

              {/* Chip */}
              <div
                style={{
                  width: 38,
                  height: 28,
                  borderRadius: 6,
                  background: "linear-gradient(135deg, #F0D98C 0%, #B8902B 100%)",
                  border: "1px solid rgba(212,175,55,.4)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 14,
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,.2)",
                    background: "linear-gradient(135deg, #e8c84a, #c49b28)",
                  }}
                />
              </div>
            </div>

            {/* Member number */}
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(212,175,55,.8)",
                letterSpacing: ".18em",
                marginBottom: 14,
                position: "relative",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              •••• •••• •••• 4242
            </div>

            {/* Card footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                position: "relative",
              }}
            >
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(212,175,55,.45)", marginBottom: 2 }}>
                  Titulaire
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: ".06em" }}>
                  EMMA DUBOIS
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--r-pill)",
                    background: "linear-gradient(135deg,#F0D98C 0%,#D4AF37 42%,#B8902B 100%)",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#1a1306",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                  }}
                >
                  Membre Or
                </div>
                <div style={{ fontSize: 10, color: "rgba(212,175,55,.4)", fontWeight: 600 }}>
                  Valable jusqu&apos;au 12/26
                </div>
              </div>
            </div>
          </div>

          {/* ── Points Card (cream luxury) ─────────────────────────────── */}
          <div
            style={{
              background: "linear-gradient(135deg, #FAF0E4 0%, #F5E8D6 50%, #EFE0C8 100%)",
              borderRadius: "var(--r-xl)",
              padding: "28px 24px 24px",
              border: "1px solid rgba(212,175,55,.3)",
              boxShadow: "0 20px 50px -20px rgba(212,175,55,.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              willChange: "transform",
            }}
          >
            {/* Crown icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#F0D98C 0%,#D4AF37 42%,#B8902B 100%)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 20px -8px rgba(212,175,55,.6)",
                marginBottom: 8,
              }}
            >
              <Icon name="crown" size={22} color="#1a1306" stroke={2} />
            </div>

            {/* Points number — animated count-up */}
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#8B6914",
                lineHeight: 1,
                letterSpacing: "-.02em",
                fontVariantNumeric: "tabular-nums",
                transition: "none",
              }}
            >
              {displayPts.toLocaleString("fr-FR")}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(0,0,0,.45)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Points Fidélité
            </div>

            {/* Tier badge */}
            <div
              style={{
                padding: "5px 14px",
                borderRadius: "var(--r-pill)",
                background: "linear-gradient(135deg,#F0D98C 0%,#D4AF37 42%,#B8902B 100%)",
                fontSize: 11,
                fontWeight: 800,
                color: "#1a1306",
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}
            >
              Membre Or
            </div>

            {/* Progress bar */}
            <div style={{ width: "100%", marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 11, color: "rgba(0,0,0,.5)", fontWeight: 600 }}>
                  {userPts} pts
                </span>
                <span style={{ fontSize: 11, color: "rgba(0,0,0,.5)", fontWeight: 600 }}>
                  {ptsToNext} pts → Platine
                </span>
              </div>

              {/* Track */}
              <div
                style={{
                  position: "relative",
                  height: 10,
                  borderRadius: "var(--r-pill)",
                  background: "rgba(0,0,0,.1)",
                  overflow: "visible",
                }}
              >
                {/* Tier marker dots at 25%, 50%, 75% */}
                {[25, 50, 75].map((pos, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: `${pos}%`,
                      transform: "translate(-50%,-50%)",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: pos <= pct ? "#B8902B" : "rgba(0,0,0,.2)",
                      zIndex: 2,
                    }}
                  />
                ))}

                {/* Fill */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "var(--r-pill)",
                    background: "linear-gradient(135deg,#F0D98C 0%,#D4AF37 42%,#B8902B 100%)",
                    width: mounted ? `${pct}%` : "0%",
                    transition: "width 1.2s cubic-bezier(.22,.68,0,1)",
                    willChange: "width",
                  }}
                />

                {/* Glowing dot at progress tip */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: mounted ? `${pct}%` : "0%",
                    transform: "translate(-50%,-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#F0D98C,#D4AF37)",
                    boxShadow: "0 0 10px 3px rgba(212,175,55,.55)",
                    border: "2.5px solid #FAF0E4",
                    transition: "left 1.2s cubic-bezier(.22,.68,0,1)",
                    willChange: "left",
                    zIndex: 3,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Tier Cards Row ──────────────────────────────────────────── */}
          <div
            style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}
            className="noscroll"
          >
            {TIERS.map((tier, idx) => {
              const isActive = idx === currentTierIdx;
              const isPast   = idx < currentTierIdx;
              const isFuture = idx > currentTierIdx;
              return (
                <div
                  key={tier.key}
                  style={{
                    flex: "0 0 80px",
                    height: 100,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: isActive
                      ? "linear-gradient(135deg,#F0D98C 0%,#D4AF37 42%,#B8902B 100%)"
                      : isPast
                      ? "var(--charcoal-2)"
                      : "var(--charcoal)",
                    border: isActive
                      ? "none"
                      : "1px solid rgba(255,255,255,.06)",
                    boxShadow: isActive ? "var(--glow-gold)" : "none",
                    opacity: isFuture ? 0.7 : 1,
                    willChange: "transform",
                  }}
                >
                  <Icon
                    name={isActive ? "crown" : isPast ? "check" : "lock"}
                    size={20}
                    color={
                      isActive
                        ? "#1a1306"
                        : isPast
                        ? "rgba(255,255,255,.4)"
                        : "rgba(255,255,255,.3)"
                    }
                    stroke={2}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: isActive
                        ? "#1a1306"
                        : isPast
                        ? "rgba(255,255,255,.4)"
                        : "rgba(255,255,255,.3)",
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {tier.label}
                  </span>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      color: isActive
                        ? "rgba(0,0,0,.5)"
                        : "rgba(255,255,255,.25)",
                      letterSpacing: ".04em",
                    }}
                  >
                    {tier.min === 0 ? "0+" : `${tier.min}+`} pts
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Rewards Grid (2 columns) ────────────────────────────────── */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--ink)",
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Vos Récompenses
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {REWARDS.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: 16,
                    borderRadius: "var(--r-md)",
                    background: userPts >= r.threshold
                      ? "rgba(251,239,228,.06)"
                      : "var(--charcoal)",
                    border: userPts >= r.threshold
                      ? "1px solid rgba(212,175,55,.25)"
                      : "1px solid rgba(255,255,255,.05)",
                    opacity: userPts >= r.threshold ? 1 : 0.65,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* Icon square */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: userPts >= r.threshold
                        ? "linear-gradient(135deg,rgba(240,217,140,.2),rgba(212,175,55,.15))"
                        : "rgba(255,255,255,.06)",
                      border: userPts >= r.threshold
                        ? "1px solid rgba(212,175,55,.3)"
                        : "1px solid rgba(255,255,255,.06)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon
                      name={userPts >= r.threshold ? r.i : "lock"}
                      size={18}
                      color={userPts >= r.threshold ? "#D4AF37" : "rgba(255,255,255,.3)"}
                      stroke={1.8}
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: userPts >= r.threshold ? "var(--ink)" : "var(--ink-mute)",
                        lineHeight: 1.35,
                        marginBottom: 4,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      } as React.CSSProperties}
                    >
                      {r.t}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: userPts >= r.threshold ? "var(--gold)" : "var(--ink-mute)",
                      }}
                    >
                      {userPts >= r.threshold ? r.s : `${r.s} requis`}
                    </div>
                  </div>

                  {/* CTA */}
                  {userPts >= r.threshold ? (
                    <button
                      style={{
                        width: "100%",
                        padding: "9px 0",
                        borderRadius: "var(--r-pill)",
                        background: "var(--pink-grad)",
                        color: "#3a1020",
                        fontWeight: 700,
                        fontSize: 11.5,
                        letterSpacing: ".03em",
                        boxShadow: "0 8px 20px -10px rgba(239,169,192,.6)",
                        WebkitTapHighlightColor: "transparent",
                        touchAction: "manipulation",
                        cursor: "pointer",
                      }}
                    >
                      Utiliser
                    </button>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        padding: "9px 0",
                        borderRadius: "var(--r-pill)",
                        background: "rgba(255,255,255,.04)",
                        border: "1px solid rgba(255,255,255,.08)",
                        color: "var(--ink-mute)",
                        fontWeight: 600,
                        fontSize: 11,
                        textAlign: "center",
                      }}
                    >
                      Verrouillé
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Transaction History ─────────────────────────────────────── */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--ink)",
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Historique des points
            </div>
            <div
              style={{
                borderRadius: "var(--r-lg)",
                background: "var(--charcoal)",
                border: "1px solid rgba(255,255,255,.06)",
                overflow: "hidden",
              }}
            >
              {transactions.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ink-mute)", fontSize: 13 }}>
                  Aucune transaction pour l&apos;instant.
                </div>
              ) : transactions.slice(0, 10).map((tx, i) => {
                const date = new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                const iconName = tx.description.includes("ommande") ? "bag" : tx.description.includes("inscription") ? "crown" : tx.description.includes("arrainag") ? "heart" : "sparkle";
                return (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      borderBottom:
                        i < Math.min(transactions.length, 10) - 1
                          ? "1px solid rgba(255,255,255,.05)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: tx.type === "redeem" ? "rgba(247,198,215,.1)" : "rgba(212,175,55,.1)",
                        border: tx.type === "redeem" ? "1px solid rgba(247,198,215,.2)" : "1px solid rgba(212,175,55,.2)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={iconName} size={16} color={tx.type === "redeem" ? "#F7C6D7" : "#D4AF37"} stroke={1.8} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tx.description}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}>{date}</div>
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: tx.type === "redeem" ? "var(--pink)" : "#D4AF37",
                        flexShrink: 0,
                      }}
                    >
                      {tx.type === "redeem" ? "-" : "+"}{tx.pts} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Referral Block ──────────────────────────────────────────── */}
          <div
            style={{
              background: "linear-gradient(135deg,#F0D98C 0%,#D4AF37 42%,#B8902B 100%)",
              borderRadius: "var(--r-xl)",
              padding: "24px 20px",
              boxShadow: "var(--glow-gold)",
              willChange: "transform",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <Icon name="gift" size={20} color="#1a1306" stroke={2} />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#1a1306",
                  letterSpacing: "-.01em",
                }}
              >
                Parrainez vos amis
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(0,0,0,.6)",
                marginBottom: 18,
                lineHeight: 1.4,
              }}
            >
              Gagnez 500 pts pour chaque filleul
            </div>

            {/* Code pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(0,0,0,.12)",
                borderRadius: "var(--r-pill)",
                padding: "10px 16px",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#1a1306",
                  letterSpacing: ".08em",
                }}
              >
                LNCOS-VIP
              </span>
              <button
                onClick={handleCopy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#1a1306",
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                  cursor: "pointer",
                  opacity: 0.75,
                }}
              >
                <Icon
                  name={copied ? "check" : "send"}
                  size={14}
                  color="#1a1306"
                  stroke={2}
                />
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>

            <button
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "var(--r-pill)",
                background: "rgba(0,0,0,.15)",
                color: "#1a1306",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                cursor: "pointer",
                border: "1.5px solid rgba(0,0,0,.2)",
              }}
            >
              Parrainez Maintenant
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
