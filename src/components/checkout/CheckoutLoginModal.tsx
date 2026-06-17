"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { translateAuthError } from "@/lib/auth-errors";

interface CheckoutLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutLoginModal({ open, onClose, onSuccess }: CheckoutLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setResetSent(false);
    const t = window.setTimeout(() => emailRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setError("Connexion indisponible pour le moment.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: signInErr } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) throw signInErr;
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(translateAuthError((err as { message?: string }).message ?? "Connexion impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const addr = email.trim();
    if (!addr) {
      setError("Saisissez votre email pour réinitialiser le mot de passe.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: resetErr } = await getSupabase().auth.resetPasswordForEmail(addr, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (resetErr) throw resetErr;
      setResetSent(true);
    } catch (err: unknown) {
      setError(translateAuthError((err as { message?: string }).message ?? "Envoi impossible."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="checkout-login-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-login-title"
      onClick={onClose}
    >
      <div className="checkout-login-modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-login-modal__head">
          <h2 id="checkout-login-title" className="checkout-login-modal__title">
            Connexion
          </h2>
          <button type="button" className="checkout-login-modal__close" onClick={onClose} aria-label="Fermer">
            <Icon name="x" size={18} />
          </button>
        </div>

        {resetSent ? (
          <div className="checkout-login-modal__reset-sent">
            <Icon name="check" size={22} color="var(--gold)" stroke={2.5} />
            <p>Un lien de réinitialisation a été envoyé à <strong>{email.trim()}</strong>.</p>
            <button type="button" className="checkout-login-modal__link-btn" onClick={onClose}>
              Retour à la commande
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="checkout-login-modal__form">
            <label className="checkout-field">
              <span className="checkout-field__label">Email</span>
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lncos-form-control lncos-form-control--field"
                placeholder="email@exemple.com"
              />
            </label>

            <label className="checkout-field">
              <span className="checkout-field__label">Mot de passe</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="lncos-form-control lncos-form-control--field"
                placeholder="••••••••"
              />
            </label>

            <button
              type="button"
              className="checkout-login-modal__forgot"
              onClick={() => void handleForgotPassword()}
              disabled={loading}
            >
              Mot de passe oublié ?
            </button>

            {error ? <div className="checkout-login-modal__error">{error}</div> : null}

            <button type="submit" className="checkout-login-modal__submit" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
