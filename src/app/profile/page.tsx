"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";

const MENU = [
  { i: "calendar", t: "Mes rendez-vous",   s: "1 à venir",          href: "/rdv",       gold: true  },
  { i: "bag",      t: "Mes commandes",      s: "3 en cours",         overlay: "orders",  gold: false },
  { i: "heart",    t: "Mes favoris",        s: "",                   href: "/favorites", gold: false },
  { i: "crown",    t: "Programme VIP",      s: "Niveau Or · 1 240 pts", overlay: "loyalty", gold: true },
  { i: "bell",     t: "Notifications",      s: "3 nouvelles",        overlay: "notifications", gold: false },
  { i: "card",     t: "Moyens de paiement", s: "•••• 4242",          gold: false },
  { i: "sliders",  t: "Paramètres",         s: "",                   gold: false },
] as const;

export default function ProfilePage() {
  const favs             = useStore((s) => s.favs);
  const openLoyalty      = useStore((s) => s.openLoyalty);
  const openNotifications = useStore((s) => s.openNotifications);
  const openOrders       = useStore((s) => s.openOrders);

  const [userName, setUserName] = useState("Mon profil");
  const [userEmail, setUserEmail] = useState("");
  const [userInitial, setUserInitial] = useState("?");

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Membre";
      setUserName(name);
      setUserEmail(user.email ?? "");
      setUserInitial(name[0]?.toUpperCase() ?? "M");
    });
  }, []);

  function handleOverlay(overlay: string) {
    if (overlay === "loyalty")       openLoyalty();
    if (overlay === "orders")        openOrders();
    if (overlay === "notifications") openNotifications();
  }

  return (
    <AppShell>
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "8px 0 24px" }}>
        {/* Header row */}
        <div style={{ padding: "0 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: 22, color: "var(--ink)" }}>Profil</h2>
            <button onClick={openNotifications} style={{ color: "var(--ink)", position: "relative" }}>
              <Icon name="bell" size={22} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "var(--pink)" }} />
            </button>
          </div>

          {/* User card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
              padding: 18,
              borderRadius: "var(--r-lg)",
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(120deg, #1c1610, #241a12)",
              border: "1px solid rgba(212,175,55,.25)",
            }}
          >
            <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,.18), transparent 70%)" }} />
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--pink-grad)",
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
                fontSize: 26,
                fontWeight: 600,
                color: "#3a1020",
              }}
            >
              {userInitial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)" }}>{userName}</div>
              <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>{userEmail}</div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 8,
                  padding: "4px 11px",
                  borderRadius: "var(--r-pill)",
                  background: "rgba(212,175,55,.15)",
                  border: "1px solid rgba(212,175,55,.3)",
                }}
              >
                <Icon name="crown" size={13} color="var(--gold)" fill="rgba(212,175,55,.4)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: ".04em" }}>MEMBRE OR</span>
              </div>
            </div>
          </div>
        </div>

        {/* RDV CTA */}
        <div style={{ padding: "16px 18px 0" }}>
          <Link
            href="/rdv"
            style={{
              width: "100%",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: "var(--r-lg)",
              position: "relative",
              overflow: "hidden",
              background: "var(--gold-grad)",
              boxShadow: "0 14px 32px -16px rgba(212,175,55,.7)",
              textDecoration: "none",
            }}
          >
            <span style={{ position: "absolute", right: -24, top: -24, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,.18)" }} />
            <span style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(26,19,6,.16)", display: "grid", placeItems: "center", flex: "0 0 auto", position: "relative" }}>
              <Icon name="calendar" size={24} color="#1a1306" stroke={2} />
            </span>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1306" }}>Prendre rendez-vous</div>
              <div style={{ fontSize: 12, color: "rgba(26,19,6,.7)", marginTop: 2, fontWeight: 600 }}>
                Manucure · extensions · nail art — en 60s
              </div>
            </div>
            <Icon name="arrowR" size={20} color="#1a1306" stroke={2.2} />
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, padding: "16px 18px 4px" }}>
          {[
            { n: "12", l: "Commandes" },
            { n: "1 240", l: "Points" },
            { n: String(favs.length), l: "Favoris" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "14px 8px",
                borderRadius: "var(--r-md)",
                background: "var(--charcoal)",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,.05)",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--gold)" }}>{s.n}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div style={{ padding: "14px 18px 0" }}>
          <div style={{ borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.05)", overflow: "hidden" }}>
            {MENU.map((m, i) => {
              const row = (
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 16px" }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: m.gold ? "rgba(212,175,55,.12)" : "var(--charcoal-2)",
                      display: "grid",
                      placeItems: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    <Icon name={m.i} size={19} color={m.gold ? "var(--gold)" : "var(--ink-soft)"} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{m.t}</div>
                    {m.s && (
                      <div style={{ fontSize: 11.5, color: m.gold ? "var(--gold)" : "var(--ink-mute)", marginTop: 1 }}>
                        {(m.i as string) === "heart" ? `${favs.length} produits` : m.s}
                      </div>
                    )}
                  </div>
                  <Icon name="chevR" size={18} color="var(--ink-mute)" />
                </div>
              );

              const style: React.CSSProperties = {
                width: "100%",
                textAlign: "left",
                borderTop: i ? "1px solid rgba(255,255,255,.05)" : "none",
                background: "none",
              };

              if ("href" in m && m.href) {
                return (
                  <Link key={m.t} href={m.href} style={{ ...style, textDecoration: "none" }}>
                    {row}
                  </Link>
                );
              }
              return (
                <button
                  key={m.t}
                  style={style}
                  onClick={"overlay" in m && m.overlay ? () => handleOverlay(m.overlay as string) : undefined}
                >
                  {row}
                </button>
              );
            })}
          </div>
          <button
            style={{
              width: "100%",
              marginTop: 18,
              padding: "15px",
              borderRadius: "var(--r-pill)",
              color: "var(--ink-mute)",
              fontSize: 13.5,
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </AppShell>
  );
}
