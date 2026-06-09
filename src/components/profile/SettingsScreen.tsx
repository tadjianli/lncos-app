"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { SubHeader } from "@/components/shared/ActionButtons";
import { useStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { getBrowserUser, getSupabase, isSupabaseConfigured, subscribeAuthChanges } from "@/lib/supabase";

/* --- Toggle --- */

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        border: "none",
        padding: 2,
        background: checked ? "var(--gold)" : "var(--charcoal-3)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        position: "relative",
        flexShrink: 0,
        transition: "background .2s",
      }}
    >
      <span
        style={{
          display: "block",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform .2s",
          boxShadow: "0 2px 6px rgba(0,0,0,.25)",
        }}
      />
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".16em",
        color: "var(--gold)",
        marginTop: 22,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function SettingsRow({
  icon,
  title,
  sub,
  right,
  onClick,
  href,
}: {
  icon: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: "var(--charcoal-2)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={18} color="var(--ink-soft)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>{sub}</div>}
      </div>
      {right ?? <Icon name="chevR" size={18} color="var(--ink-mute)" />}
    </div>
  );

  const baseStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    borderTop: "1px solid rgba(255,255,255,.05)",
    textDecoration: "none",
    color: "inherit",
  };

  if (href) {
    return (
      <Link href={href} style={baseStyle} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" style={baseStyle} onClick={onClick}>
      {inner}
    </button>
  );
}

/* ─── Main screen ───────────────────────────────────────────────────── */

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const showToast = useStore((s) => s.showToast);
  const clearCart = useStore((s) => s.clearCart);
  const openAuth = useStore((s) => s.openAuth);

  const notifPromos = useSettingsStore((s) => s.notifPromos);
  const notifOrders = useSettingsStore((s) => s.notifOrders);
  const notifRdv = useSettingsStore((s) => s.notifRdv);
  const notifNewsletter = useSettingsStore((s) => s.notifNewsletter);
  const marketingEmails = useSettingsStore((s) => s.marketingEmails);
  const setPref = useSettingsStore((s) => s.set);
  const resetPrefs = useSettingsStore((s) => s.reset);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingPwd, setResettingPwd] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setUserId(null);
      setEmail("");
      setFullName("");
      setPhone("");
      setLoading(false);
      return;
    }

    const user = await getBrowserUser();
    if (!user) {
      setUserId(null);
      setEmail("");
      setFullName("");
      setPhone("");
      setLoading(false);
      return;
    }
    setUserId(user.id);
    setEmail(user.email ?? "");
    const { data: profile } = await getSupabase()
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", user.id)
      .single();
    setFullName(
      profile?.full_name ??
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      ""
    );
    setPhone(profile?.phone ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
    return subscribeAuthChanges(() => {
      void loadProfile();
    });
  }, [loadProfile]);

  async function handleSaveProfile() {
    if (!userId) {
      openAuth();
      return;
    }
    setSaving(true);
    try {
      const { error: profileErr } = await getSupabase()
        .from("profiles")
        .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
        .eq("id", userId);
      if (profileErr) throw profileErr;

      const { error: authErr } = await getSupabase().auth.updateUser({
        data: { full_name: fullName.trim() || null },
      });
      if (authErr) throw authErr;

      showToast("Profil mis à jour");
    } catch (err: unknown) {
      showToast((err as { message?: string }).message ?? "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      showToast("Connectez-vous pour modifier le mot de passe");
      openAuth();
      return;
    }
    setResettingPwd(true);
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      showToast("Email de réinitialisation envoyé");
    } catch (err: unknown) {
      showToast((err as { message?: string }).message ?? "Envoi impossible");
    } finally {
      setResettingPwd(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await getSupabase().auth.signOut();
    setLoggingOut(false);
    showToast("Déconnecté");
    onClose();
  }

  function handleClearCart() {
    clearCart();
    showToast("Panier vidé");
  }

  function handleResetPrefs() {
    resetPrefs();
    showToast("Préférences réinitialisées");
  }

  const isLoggedIn = Boolean(userId);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        animation: "overlayIn 0.38s cubic-bezier(0.22,0.68,0,1) both",
      }}
    >
      <div style={{ flex: "0 0 auto", paddingTop: 4 }}>
        <SubHeader title="Paramètres" onBack={onClose} />
      </div>

      <div
        className="noscroll"
        style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "0 18px 40px" }}
      >
        {/* ── Compte ─────────────────────────────────────────────── */}
        <SectionTitle>Compte</SectionTitle>
        <div
          style={{
            borderRadius: "var(--r-md)",
            background: "var(--charcoal)",
            border: "1px solid rgba(255,255,255,.05)",
            overflow: "hidden",
          }}
        >
          {!isLoggedIn && !loading ? (
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 14px", lineHeight: 1.5 }}>
                Connectez-vous pour modifier votre profil et gérer votre compte.
              </p>
              <button
                type="button"
                onClick={openAuth}
                style={{
                  width: "100%",
                  padding: "13px 18px",
                  borderRadius: "var(--r-pill)",
                  background: "var(--gold-grad)",
                  color: "#1a1306",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                }}
              >
                Se connecter
              </button>
            </div>
          ) : (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-mute)" }}>Prénom / Nom</span>
                <input
                  className="ab-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading || !isLoggedIn}
                  placeholder="Votre nom"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--charcoal-2)", border: "1px solid rgba(255,255,255,.08)", color: "var(--ink)", fontSize: 14 }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-mute)" }}>Email</span>
                <input
                  value={email}
                  readOnly
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--charcoal-3)", border: "1px solid rgba(255,255,255,.06)", color: "var(--ink-mute)", fontSize: 14 }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-mute)" }}>Téléphone</span>
                <input
                  className="ab-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading || !isLoggedIn}
                  placeholder="06 12 34 56 78"
                  inputMode="tel"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--charcoal-2)", border: "1px solid rgba(255,255,255,.08)", color: "var(--ink)", fontSize: 14 }}
                />
              </label>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving || loading || !isLoggedIn}
                style={{
                  marginTop: 4,
                  padding: "12px 18px",
                  borderRadius: "var(--r-pill)",
                  background: "var(--gold-grad)",
                  color: "#1a1306",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Enregistrement…" : "Enregistrer le profil"}
              </button>
            </div>
          )}
        </div>

        {/* ── Notifications ─────────────────────────────────────── */}
        <SectionTitle>Notifications</SectionTitle>
        <div
          style={{
            borderRadius: "var(--r-md)",
            background: "var(--charcoal)",
            border: "1px solid rgba(255,255,255,.05)",
            overflow: "hidden",
          }}
        >
          {[
            { key: "notifPromos" as const, label: "Promotions & offres", sub: "Ventes flash, codes promo", value: notifPromos },
            { key: "notifOrders" as const, label: "Commandes", sub: "Suivi livraison et statut", value: notifOrders },
            { key: "notifRdv" as const, label: "Rendez-vous", sub: "Rappels et confirmations RDV", value: notifRdv },
            { key: "notifNewsletter" as const, label: "Club beauté", sub: "Conseils et nouveautés LN COS", value: notifNewsletter },
            { key: "marketingEmails" as const, label: "Emails marketing", sub: "Offres par email", value: marketingEmails },
          ].map((row, i) => (
            <div
              key={row.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderTop: i ? "1px solid rgba(255,255,255,.05)" : "none",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{row.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>{row.sub}</div>
              </div>
              <Toggle
                checked={row.value}
                onChange={() => {
                  setPref(row.key, !row.value);
                  showToast(row.value ? "Notification désactivée" : "Notification activée");
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Sécurité ──────────────────────────────────────────── */}
        <SectionTitle>Sécurité</SectionTitle>
        <div
          style={{
            borderRadius: "var(--r-md)",
            background: "var(--charcoal)",
            border: "1px solid rgba(255,255,255,.05)",
            overflow: "hidden",
          }}
        >
          <SettingsRow
            icon="lock"
            title="Modifier le mot de passe"
            sub={resettingPwd ? "Envoi en cours…" : "Recevoir un lien par email"}
            onClick={handleResetPassword}
            right={<Icon name="mail" size={18} color="var(--gold)" />}
          />
        </div>

        {/* ── Application ───────────────────────────────────────── */}
        <SectionTitle>Application</SectionTitle>
        <div
          style={{
            borderRadius: "var(--r-md)",
            background: "var(--charcoal)",
            border: "1px solid rgba(255,255,255,.05)",
            overflow: "hidden",
          }}
        >
          <SettingsRow icon="bag" title="Vider le panier" sub="Supprime tous les articles" onClick={handleClearCart} />
          <SettingsRow icon="sliders" title="Réinitialiser les préférences" sub="Notifications par défaut" onClick={handleResetPrefs} />
          <SettingsRow icon="calendar" title="Mes rendez-vous" href="/rdv/appointments" onClick={onClose} />
          <SettingsRow icon="heart" title="Mes favoris" href="/favorites" onClick={onClose} />
        </div>

        {/* ── Informations ──────────────────────────────────────── */}
        <SectionTitle>Informations</SectionTitle>
        <div
          style={{
            borderRadius: "var(--r-md)",
            background: "var(--charcoal)",
            border: "1px solid rgba(255,255,255,.05)",
            overflow: "hidden",
          }}
        >
          <SettingsRow icon="info" title="Version de l'app" sub="LN COS · 1.0" right={<span />} />
          <SettingsRow icon="mail" title="Contact" sub="bonjour@lncos.fr" right={<span />} />
        </div>

        {isLoggedIn && (
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: "100%",
              marginTop: 24,
              padding: "15px",
              borderRadius: "var(--r-pill)",
              color: "var(--pink)",
              fontSize: 13.5,
              fontWeight: 600,
              border: "1px solid rgba(247,198,215,.2)",
              background: "none",
              opacity: loggingOut ? 0.5 : 1,
            }}
          >
            {loggingOut ? "Déconnexion…" : "Se déconnecter"}
          </button>
        )}
      </div>
    </div>
  );
}
