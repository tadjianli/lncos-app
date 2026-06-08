"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const err = params.get("error");
    if (err === "unauthorized") {
      setError("Vous n'avez pas les droits administrateur.");
    } else if (err === "config") {
      setError("Authentification indisponible — configuration Supabase manquante.");
    }
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Authentification indisponible — configuration Supabase manquante.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Erreur d'authentification.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single<{ is_admin: boolean }>();

    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      setError("Accès refusé — compte non administrateur.");
      setLoading(false);
      return;
    }

    const next = params.get("next");
    router.push(next?.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <div className="adm-login-page">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <span className="adm-login-logo-text">LN COS</span>
          <span className="adm-login-logo-sub">Administration</span>
        </div>

        <form onSubmit={handleSubmit} className="adm-login-form">
          <div className="adm-login-field">
            <label className="adm-login-label" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="adm-login-input"
              placeholder="admin@lncos.fr"
              required
              autoComplete="email"
            />
          </div>

          <div className="adm-login-field">
            <label className="adm-login-label" htmlFor="admin-password">
              Mot de passe
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="adm-login-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="adm-login-error">{error}</div>}

          <button type="submit" disabled={loading} className="adm-login-btn">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
