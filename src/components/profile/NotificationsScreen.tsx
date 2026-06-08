"use client";
/**
 * LN COS — Notifications screen (from handoff screens-account.jsx)
 */

import { Icon } from "@/components/shared/Icon";
import { SubHeader } from "@/components/shared/ActionButtons";

const NOTIFS = [
  { i: "tag",     c: "var(--pink)", t: "Vente Flash -30%",      s: "Sur tous les sérums, aujourd'hui seulement !",  d: "il y a 1h",      unread: true  },
  { i: "truck",   c: "var(--gold)", t: "Commande expédiée",     s: "Votre commande #LN-2480 est en route.",         d: "il y a 3h",      unread: true  },
  { i: "crown",   c: "var(--gold)", t: "+120 points gagnés",    s: "Merci pour votre dernier achat ✨",             d: "hier",           unread: true  },
  { i: "sparkle", c: "var(--pink)", t: "Nouveauté",             s: "Découvrez le Masque Argile Rose.",              d: "il y a 2 jours", unread: false },
  { i: "gift",    c: "var(--gold)", t: "Récompense débloquée",  s: "Livraison express offerte disponible.",         d: "il y a 3 jours", unread: false },
];

interface NotificationsScreenProps {
  onClose: () => void;
}

export function NotificationsScreen({ onClose }: NotificationsScreenProps) {
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
        <SubHeader
          title="Notifications"
          onBack={onClose}
          right={
            <span style={{ fontSize: 11.5, color: "var(--gold)", fontWeight: 600 }}>Tout lire</span>
          }
        />
      </div>

      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "4px 16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {NOTIFS.map((n, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 13,
                padding: "15px 15px",
                borderRadius: "var(--r-md)",
                background: n.unread ? "var(--charcoal)" : "transparent",
                border: n.unread ? "1px solid rgba(212,175,55,.14)" : "1px solid rgba(255,255,255,.04)",
                animation: `fadeUp .4s ease ${i * 0.05}s both`,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(255,255,255,.04)",
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 auto",
                }}
              >
                <Icon name={n.i} size={20} color={n.c} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{n.t}</span>
                  {n.unread && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--pink)",
                        flex: "0 0 auto",
                        marginTop: 5,
                      }}
                    />
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 3, lineHeight: 1.4 }}>{n.s}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 6 }}>{n.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
