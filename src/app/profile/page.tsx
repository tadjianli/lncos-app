"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import { useLoyaltyStore } from "@/lib/stores/loyalty-store";
import { getSupabase } from "@/lib/supabase";

interface UserData {
  id: string;
  name: string;
  email: string;
  initial: string;
}

export default function ProfilePage() {
  const favs              = useStore((s) => s.favs);
  const openLoyalty       = useStore((s) => s.openLoyalty);
  const openNotifications = useStore((s) => s.openNotifications);
  const openOrders        = useStore((s) => s.openOrders);
  const openAuth          = useStore((s) => s.openAuth);

  const loyaltyPoints = useLoyaltyStore((s) => s.points);
  const loyaltyTier   = useLoyaltyStore((s) => s.tier());

  const [user, setUser]           = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orderCount, setOrderCount]   = useState<number>(0);
  const [loggingOut, setLoggingOut]   = useState(false);

  const loadUser = useCallback(async () => {
    setAuthLoading(true);
    const { data: { user: u } } = await getSupabase().auth.getUser();
    if (u) {
      const name = u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "Membre";
      setUser({ id: u.id, name, email: u.email ?? "", initial: name[0]?.toUpperCase() ?? "M" });
      // Fetch real order count
      const { count } = await getSupabase()
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", u.id);
      setOrderCount(count ?? 0);
    } else {
      setUser(null);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
    // Re-run when auth state changes (login/logout from overlay)
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(() => {
      loadUser();
    });
    return () => subscription.unsubscribe();
  }, [loadUser]);

  async function handleLogout() {
    setLoggingOut(true);
    await getSupabase().auth.signOut();
    setLoggingOut(false);
  }

  const TIER_LABELS: Record<string, string> = {
    bronze: "BRONZE", argent: "ARGENT", or: "OR", platine: "PLATINE",
  };

  const MENU = [
    { i: "calendar", t: "Mes rendez-vous",   s: "Prendre ou gérer un RDV", href: "/rdv",       gold: true  },
    { i: "bag",      t: "Mes commandes",      s: orderCount > 0 ? `${orderCount} commande${orderCount > 1 ? "s" : ""}` : "Historique d'achats", overlay: "orders",  gold: false },
    { i: "heart",    t: "Mes favoris",        s: "",                         href: "/favorites", gold: false },
    { i: "crown",    t: "Programme VIP",      s: `Niveau ${TIER_LABELS[loyaltyTier] ?? "OR"} · ${loyaltyPoints.toLocaleString("fr-FR")} pts`, overlay: "loyalty", gold: true  },
    { i: "bell",     t: "Notifications",      s: "",                         overlay: "notifications", gold: false },
    { i: "sliders",  t: "Paramètres",         s: "",                         gold: false },
  ] as const;

  function handleOverlay(overlay: string) {
    if (overlay === "loyalty")       openLoyalty();
    if (overlay === "orders")        openOrders();
    if (overlay === "notifications") openNotifications();
  }

  const isLoggedIn = !authLoading && user !== null;
  const userName   = user?.name ?? "Mon profil";
  const userEmail  = user?.email ?? "";
  const userInitial = user?.initial ?? "?";

  return (
    <AppShell>
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "8px 0 24px" }}>
        {/* Header */}
        <div style={{ padding: "0 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: 22, color: "var(--ink)" }}>Profil</h2>
            <button onClick={openNotifications} style={{ color: "var(--ink)", position: "relative" }}>
              <Icon name="bell" size={22} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "var(--pink)" }} />
            </button>
          </div>

          {/* User card */}
          <div style={{
            display: "flex", alignItems: "center", gap: 15, padding: 18,
            borderRadius: "var(--r-lg)", position: "relative", overflow: "hidden",
            background: "linear-gradient(120deg, #1c1610, #241a12)",
            border: "1px solid rgba(212,175,55,.25)",
          }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,.18), transparent 70%)" }} />
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--pink-grad)", display: "grid", placeItems: "center", flex: "0 0 auto", fontSize: 26, fontWeight: 600, color: "#3a1020" }}>
              {authLoading ? "…" : userInitial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)" }}>{authLoading ? "Chargement…" : userName}</div>
              <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>{userEmail || (isLoggedIn ? "" : "Non connecté")}</div>
              {isLoggedIn && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "4px 11px", borderRadius: "var(--r-pill)", background: "rgba(212,175,55,.15)", border: "1px solid rgba(212,175,55,.3)" }}>
                  <Icon name="crown" size={13} color="var(--gold)" fill="rgba(212,175,55,.4)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: ".04em" }}>
                    MEMBRE {TIER_LABELS[loyaltyTier] ?? "BRONZE"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auth CTA — shown when not logged in */}
        {!authLoading && !isLoggedIn && (
          <div style={{ padding: "16px 18px 0" }}>
            <button
              onClick={openAuth}
              style={{
                width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14,
                padding: 16, borderRadius: "var(--r-lg)", position: "relative", overflow: "hidden",
                background: "var(--pink-grad)", boxShadow: "0 14px 32px -16px rgba(247,198,215,.5)",
                border: "none", cursor: "pointer",
              }}
            >
              <span style={{ position: "absolute", right: -24, top: -24, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,.14)" }} />
              <span style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(58,16,32,.16)", display: "grid", placeItems: "center", flex: "0 0 auto", position: "relative" }}>
                <Icon name="user" size={24} color="#3a1020" />
              </span>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#3a1020" }}>Se connecter</div>
                <div style={{ fontSize: 12, color: "rgba(58,16,32,.7)", marginTop: 2 }}>Accédez à vos commandes et au programme VIP</div>
              </div>
              <Icon name="arrowR" size={20} color="#3a1020" stroke={2.2} />
            </button>
          </div>
        )}

        {/* RDV CTA */}
        <div style={{ padding: "16px 18px 0" }}>
          <Link href="/rdv" style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: "var(--r-lg)", position: "relative", overflow: "hidden", background: "var(--gold-grad)", boxShadow: "0 14px 32px -16px rgba(212,175,55,.7)", textDecoration: "none" }}>
            <span style={{ position: "absolute", right: -24, top: -24, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,.18)" }} />
            <span style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(26,19,6,.16)", display: "grid", placeItems: "center", flex: "0 0 auto", position: "relative" }}>
              <Icon name="calendar" size={24} color="#1a1306" stroke={2} />
            </span>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1306" }}>Prendre rendez-vous</div>
              <div style={{ fontSize: 12, color: "rgba(26,19,6,.7)", marginTop: 2, fontWeight: 600 }}>Manucure · extensions · nail art — en 60s</div>
            </div>
            <Icon name="arrowR" size={20} color="#1a1306" stroke={2.2} />
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, padding: "16px 18px 4px" }}>
          {[
            { n: orderCount > 0 ? String(orderCount) : "—", l: "Commandes" },
            { n: loyaltyPoints > 0 ? loyaltyPoints.toLocaleString("fr-FR") : "—", l: "Points" },
            { n: String(favs.length), l: "Favoris" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "14px 8px", borderRadius: "var(--r-md)", background: "var(--charcoal)", textAlign: "center", border: "1px solid rgba(255,255,255,.05)" }}>
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
                  <span style={{ width: 38, height: 38, borderRadius: 11, background: m.gold ? "rgba(212,175,55,.12)" : "var(--charcoal-2)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
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

              const style: React.CSSProperties = { width: "100%", textAlign: "left", borderTop: i ? "1px solid rgba(255,255,255,.05)" : "none", background: "none" };

              if ("href" in m && m.href) {
                return <Link key={m.t} href={m.href} style={{ ...style, textDecoration: "none" }}>{row}</Link>;
              }
              return (
                <button key={m.t} style={style} onClick={"overlay" in m && m.overlay ? () => handleOverlay(m.overlay as string) : undefined}>
                  {row}
                </button>
              );
            })}
          </div>

          {/* Auth action button */}
          {!authLoading && (
            <button
              onClick={isLoggedIn ? handleLogout : openAuth}
              disabled={loggingOut}
              style={{ width: "100%", marginTop: 18, padding: "15px", borderRadius: "var(--r-pill)", color: isLoggedIn ? "var(--pink)" : "var(--gold)", fontSize: 13.5, fontWeight: 600, border: `1px solid ${isLoggedIn ? "rgba(247,198,215,.2)" : "rgba(212,175,55,.3)"}`, background: "none", cursor: loggingOut ? "default" : "pointer", opacity: loggingOut ? 0.5 : 1 }}
            >
              {loggingOut ? "Déconnexion…" : isLoggedIn ? "Se déconnecter" : "Se connecter / Créer un compte"}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
