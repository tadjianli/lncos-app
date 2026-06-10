"use client";
/**
 * LN COS — Customer Auth Overlay
 * Sign in / sign up — renders as a full-screen overlay inside AppShell.
 */

import { useState, useRef } from "react";
import { Icon } from "@/components/shared/Icon";
import { MobileBackButton } from "@/components/shared/ActionButtons";
import { getSupabase } from "@/lib/supabase";

type Tab = "login" | "signup";

interface AuthScreenProps {
  onClose: () => void;
}

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (msg.includes("already registered") || msg.includes("already been registered")) return "Cet email est déjà utilisé.";
  if (msg.includes("Password should be at least 6")) return "Le mot de passe doit comporter au moins 6 caractères.";
  if (msg.includes("Unable to validate email address")) return "Adresse email invalide.";
  if (msg.includes("Email not confirmed")) return "Confirmez votre email avant de vous connecter.";
  return msg;
}

export function AuthScreen({ onClose }: AuthScreenProps) {
  const [tab, setTab]         = useState<Tab>("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [sent, setSent]       = useState(false);
  const emailRef              = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "login") {
        const { error } = await getSupabase().auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await getSupabase().auth.signUp({
          email,
          password,
          options: { data: { full_name: name || email.split("@")[0] } },
        });
        if (error) throw error;
        setSent(true);
      }
    } catch (err: unknown) {
      setError(translateError((err as { message?: string }).message ?? "Erreur inconnue."));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        className="overlay-shell"
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-grad)", display: "grid", placeItems: "center", marginBottom: 24 }}>
          <Icon name="check" size={36} color="#1a1306" stroke={2.5} />
        </div>
        <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700, marginBottom: 12 }}>
          Vérifiez votre email
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", margin: "0 0 12px", lineHeight: 1.25 }}>
          Confirmation envoyée
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 32px" }}>
          Un lien de confirmation a été envoyé à <strong style={{ color: "var(--gold)" }}>{email}</strong>. Cliquez dessus pour activer votre compte.
        </p>
        <button
          onClick={onClose}
          style={{ padding: "14px 36px", borderRadius: "var(--r-pill)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", color: "var(--ink-soft)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
        >
          Fermer
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "var(--r-sm)",
    background: "var(--charcoal)",
    border: "1px solid rgba(255,255,255,.08)",
    color: "var(--ink)",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div className="overlay-shell">
      <div className="mobile-screen-header" style={{ paddingBottom: 0 }}>
        <MobileBackButton onClick={onClose} />
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--gold)",
          }}
        >
          LN COS
        </div>
        <div className="mobile-screen-header__slot" aria-hidden />
      </div>

      {/* Body */}
      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "24px 24px 32px" }}>
        {/* Headline */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--gold-grad)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <Icon name="crown" size={26} color="#1a1306" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-.02em" }}>
            {tab === "login" ? "Bienvenue" : "Créer un compte"}
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-mute)", margin: 0, lineHeight: 1.5 }}>
            {tab === "login" ? "Connectez-vous pour accéder à votre espace" : "Rejoignez le programme VIP LN COS"}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex",
          background: "var(--charcoal)",
          borderRadius: "var(--r-pill)",
          padding: 4,
          marginBottom: 24,
          border: "1px solid rgba(255,255,255,.05)",
        }}>
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: "var(--r-pill)",
                fontSize: 13,
                fontWeight: 600,
                background: tab === t ? "var(--gold-grad)" : "transparent",
                color: tab === t ? "#1a1306" : "var(--ink-mute)",
                border: "none",
                cursor: "pointer",
                transition: "all .2s",
                letterSpacing: ".02em",
              }}
            >
              {t === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tab === "signup" && (
            <div>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginBottom: 7, fontWeight: 500 }}>Prénom</div>
              <input
                style={inputStyle}
                type="text"
                placeholder="Sophie"
                value={name}
                autoComplete="given-name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginBottom: 7, fontWeight: 500 }}>Email</div>
            <input
              ref={emailRef}
              style={inputStyle}
              type="email"
              placeholder="email@exemple.com"
              value={email}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginBottom: 7, fontWeight: 500 }}>Mot de passe</div>
            <input
              style={inputStyle}
              type="password"
              placeholder={tab === "signup" ? "Au moins 6 caractères" : "••••••••"}
              value={password}
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              padding: "11px 14px",
              borderRadius: "var(--r-sm)",
              background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.25)",
              color: "#f87171",
              fontSize: 13,
              lineHeight: 1.45,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "15px",
              borderRadius: "var(--r-pill)",
              background: loading ? "rgba(212,175,55,.4)" : "var(--gold-grad)",
              color: "#1a1306",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: loading ? "default" : "pointer",
              letterSpacing: ".03em",
              boxShadow: loading ? "none" : "var(--glow-gold)",
              transition: "all .2s",
            }}
          >
            {loading
              ? "Chargement…"
              : tab === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        {/* Guest option */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{ fontSize: 13, color: "var(--ink-mute)", fontWeight: 500, textDecoration: "underline", textDecorationColor: "rgba(255,255,255,.2)", cursor: "pointer", background: "none", border: "none" }}
          >
            Continuer en tant qu&apos;invité →
          </button>
        </div>
      </div>
    </div>
  );
}
