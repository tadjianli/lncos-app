"use client";

import { useState } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { SubHeader } from "@/components/shared/ActionButtons";
import { isVipProgramEnabled } from "@/lib/feature-flags";

/* ─── Types ────────────────────────────────────────────────────────────── */

type NotifType = "promo" | "order" | "points" | "new_product" | "rdv_reminder";

interface Notif {
  type: NotifType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  badge?: string;
  order?: string;
  status?: string;
  pts?: number;
  service?: string;
  apptTime?: string;
}

/* ─── Mock data ─────────────────────────────────────────────────────────── */

const TODAY: Notif[] = [
  {
    type: "promo",
    title: "Vente Flash -30%",
    body: "Sur tous les sérums, aujourd'hui seulement !",
    time: "il y a 1h",
    unread: true,
    badge: "-30%",
  },
  {
    type: "order",
    title: "Commande expédiée",
    body: "Votre commande #LN-2480 est en route",
    time: "il y a 3h",
    unread: true,
    order: "LN-2480",
    status: "En route",
  },
];

const YESTERDAY: Notif[] = [
  {
    type: "points",
    title: "+240 points gagnés",
    body: "Merci pour votre dernier achat ✨",
    time: "hier 16h",
    unread: true,
    pts: 240,
  },
  {
    type: "rdv_reminder",
    title: "Rappel rendez-vous",
    body: "Manucure Gel · Demain à 14h30",
    time: "hier 14h",
    unread: false,
    service: "Manucure Gel",
    apptTime: "Demain 14:30",
  },
];

const THIS_WEEK: Notif[] = [
  {
    type: "new_product",
    title: "Nouveauté",
    body: "Découvrez le Masque Argile Rose Intense",
    time: "il y a 2j",
    unread: false,
  },
  {
    type: "promo",
    title: "Récompense débloquée",
    body: "Livraison express offerte disponible !",
    time: "il y a 3j",
    unread: false,
  },
];

/* ─── Icon config per type ──────────────────────────────────────────────── */

const TYPE_ICON: Record<NotifType, { icon: string; bg: string; color: string }> = {
  promo: { icon: "tag", bg: "rgba(247,198,215,.12)", color: "var(--pink)" },
  order: { icon: "truck", bg: "rgba(212,175,55,.10)", color: "var(--gold)" },
  points: { icon: "crown", bg: "rgba(212,175,55,.10)", color: "var(--gold)" },
  new_product: { icon: "sparkle", bg: "rgba(247,198,215,.08)", color: "var(--pink)" },
  rdv_reminder: { icon: "calendar", bg: "rgba(212,175,55,.08)", color: "var(--gold)" },
};

/* ─── NotifCard ─────────────────────────────────────────────────────────── */

function NotifCard({ n, allRead, delay = 0 }: { n: Notif; allRead: boolean; delay?: number }) {
  const isUnread = n.unread && !allRead;
  const cfg = TYPE_ICON[n.type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 14px 14px 17px",
        borderRadius: "var(--r-md)",
        background: isUnread ? "var(--charcoal)" : "transparent",
        border: `1px solid ${isUnread ? "rgba(212,175,55,.14)" : "rgba(255,255,255,.04)"}`,
        marginBottom: 8,
        position: "relative",
        overflow: "hidden",
        willChange: "transform, opacity",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        animation: `notifIn .38s var(--ease-lux) ${delay}s both`,
      }}
    >
      {/* Gold left accent bar for unread */}
      {isUnread && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: "var(--gold)",
            borderRadius: "3px 0 0 3px",
          }}
        />
      )}

      {/* Icon area */}
      <div style={{ position: "relative", flex: "0 0 auto" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: cfg.bg,
            display: "grid",
            placeItems: "center",
            color: cfg.color,
          }}
        >
          <Icon name={cfg.icon} size={22} stroke={1.8} />
        </div>
        {/* Unread dot */}
        {isUnread && (
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--pink)",
              border: "1.5px solid var(--noir)",
            }}
          />
        )}
      </div>

      {/* Text body */}
      <div style={{ flex: "1 1 auto", minWidth: 0, paddingTop: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: isUnread ? 700 : 600,
            color: "var(--ink)",
            marginBottom: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {n.title}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--ink-soft)",
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {n.body}
        </div>

        {/* Order progress line */}
        {n.type === "order" && n.status && (
          <div
            style={{
              marginTop: 7,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <div
              style={{
                height: 2,
                flex: 1,
                borderRadius: 2,
                background: "rgba(212,175,55,.15)",
                overflow: "hidden",
                maxWidth: 80,
              }}
            >
              <div
                style={{
                  width: "60%",
                  height: "100%",
                  background: "var(--gold-grad)",
                  borderRadius: 2,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 10.5,
                color: "var(--ink-mute)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {n.status} · Livraison prévue demain
            </span>
          </div>
        )}

        <div style={{ marginTop: 6, fontSize: 11, color: "var(--ink-mute)" }}>{n.time}</div>
      </div>

      {/* Right area */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
          paddingTop: 2,
        }}
      >
        {/* Promo discount badge */}
        {n.type === "promo" && n.badge && (
          <div
            style={{
              padding: "3px 9px",
              borderRadius: "var(--r-pill)",
              background: "rgba(247,198,215,.18)",
              color: "var(--pink)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".04em",
            }}
          >
            {n.badge}
          </div>
        )}

        {/* Order: thumbnail + order number chip */}
        {n.type === "order" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--charcoal-3)",
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,.12)",
              }}
            >
              <FadeImage
                src="/assets/icon-192.png"
                alt="Commande"
                width={40}
                height={40}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {n.order && (
              <div
                style={{
                  padding: "2px 7px",
                  borderRadius: "var(--r-pill)",
                  background: "rgba(212,175,55,.10)",
                  color: "var(--gold)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".03em",
                }}
              >
                #{n.order}
              </div>
            )}
          </div>
        )}

        {/* Points: large gold number */}
        {n.type === "points" && n.pts && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                background: "var(--gold-grad)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-.01em",
                lineHeight: 1,
              }}
            >
              +{n.pts}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--gold-soft)",
                letterSpacing: ".12em",
                marginTop: 3,
              }}
            >
              POINTS GAGNÉS
            </div>
          </div>
        )}

        {/* New product: thumbnail + NOUVEAU chip */}
        {n.type === "new_product" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                overflow: "hidden",
                background: "var(--charcoal-3)",
                border: "1px solid rgba(247,198,215,.15)",
              }}
            >
              <FadeImage
                src="/assets/icon-192.png"
                alt="Nouveau produit"
                width={44}
                height={44}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                padding: "2px 8px",
                borderRadius: "var(--r-pill)",
                background: "rgba(247,198,215,.16)",
                color: "var(--pink)",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: ".10em",
              }}
            >
              NOUVEAU
            </div>
          </div>
        )}

        {/* RDV: time chip + staff avatar */}
        {n.type === "rdv_reminder" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div
              style={{
                padding: "3px 9px",
                borderRadius: "var(--r-pill)",
                background: "var(--charcoal-3)",
                color: "var(--ink-soft)",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: ".04em",
                border: "1px solid rgba(255,255,255,.06)",
                whiteSpace: "nowrap",
              }}
            >
              {n.apptTime}
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--charcoal-3), var(--charcoal-2))",
                border: "1.5px solid rgba(212,175,55,.2)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink-mute)",
              }}
            >
              <Icon name="user" size={16} stroke={1.8} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Group label ───────────────────────────────────────────────────────── */

function GroupLabel({ label, first }: { label: string; first?: boolean }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 2,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".18em",
        color: "var(--gold)",
        paddingTop: first ? 8 : 20,
        paddingBottom: 10,
        /* extend across the scroll-container's 18px gutter */
        marginLeft: -18,
        marginRight: -18,
        paddingLeft: 18,
        paddingRight: 18,
        background: "rgba(8,8,8,.90)",
        backdropFilter: "blur(24px) saturate(1.1)",
        WebkitBackdropFilter: "blur(24px) saturate(1.1)",
      }}
    >
      {label}
    </div>
  );
}

/* ─── Main screen ───────────────────────────────────────────────────────── */

interface NotificationsScreenProps {
  onClose: () => void;
}

export function NotificationsScreen({ onClose }: NotificationsScreenProps) {
  const [allRead, setAllRead] = useState(false);
  const vipEnabled = isVipProgramEnabled();

  const filterNotifs = (items: Notif[]) =>
    vipEnabled ? items : items.filter((n) => n.type !== "points");

  const todayNotifs = filterNotifs(TODAY);
  const yesterdayNotifs = filterNotifs(YESTERDAY);
  const weekNotifs = filterNotifs(THIS_WEEK);

  return (
    <div className="overlay-screen">
      <SubHeader
        title="Notifications"
        onBack={onClose}
        safeArea
        right={
            <button
              onClick={() => setAllRead(true)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: allRead ? "var(--ink-mute)" : "var(--gold)",
                letterSpacing: ".02em",
                whiteSpace: "nowrap",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                transition: "color .2s",
                cursor: allRead ? "default" : "pointer",
                pointerEvents: allRead ? "none" : "auto",
              }}
            >
              Tout marquer lu
            </button>
          }
      />

      {/* Scroll container */}
      <div className="noscroll overlay-screen-scroll" style={{ padding: "0 18px 16px" }}>
        {todayNotifs.length > 0 && (
          <>
            <GroupLabel label="Aujourd'hui" first />
            {todayNotifs.map((n, i) => (
              <NotifCard key={`today-${i}`} n={n} allRead={allRead} delay={i * 0.05} />
            ))}
          </>
        )}

        {yesterdayNotifs.length > 0 && (
          <>
            <GroupLabel label="Hier" first={todayNotifs.length === 0} />
            {yesterdayNotifs.map((n, i) => (
              <NotifCard key={`yesterday-${i}`} n={n} allRead={allRead} delay={i * 0.05} />
            ))}
          </>
        )}

        {weekNotifs.length > 0 && (
          <>
            <GroupLabel label="Cette semaine" first={todayNotifs.length === 0 && yesterdayNotifs.length === 0} />
            {weekNotifs.map((n, i) => (
              <NotifCard key={`week-${i}`} n={n} allRead={allRead} delay={i * 0.05} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
