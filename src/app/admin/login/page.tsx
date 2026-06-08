"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.get("error") === "unauthorized") {
      setError("Vous n'avez pas les droits administrateur.");
    }
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // Verify admin flag
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Erreur d'authentification."); setLoading(false); return; }

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

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="adm-login-page">
      <div className="adm-login-card">
        {/* Logo */}
        <div className="adm-login-logo">
          <span className="adm-login-logo-text">LN COS</span>
          <span className="adm-login-logo-sub">Administration</span>
        </div>

        <form onSubmit={handleSubmit} className="adm-login-form">
          <div className="adm-login-field">
            <label className="adm-login-label">Email</label>
            <input
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
            <label className="adm-login-label">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="adm-login-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="adm-login-error">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="adm-login-btn"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
