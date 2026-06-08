"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { Icon } from "@/components/shared/Icon";
import { getSupabase } from "@/lib/supabase";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [mobileNav, setMobileNav] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await getSupabase().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }, [router]);

  return (
    <div className="adm-shell">
      {/* Mobile hamburger */}
      <button
        className="adm-mobile-toggle"
        onClick={() => setMobileNav(true)}
        aria-label="Ouvrir le menu"
      >
        <Icon name="menu" size={22} color="#fff" />
      </button>

      {/* Sidebar wrapper */}
      <div className={`adm-sidebar-wrap${mobileNav ? " open" : ""}`}>
        {mobileNav && (
          <div className="adm-sidebar-scrim" onClick={() => setMobileNav(false)} />
        )}
        <AdminSidebar onNav={() => setMobileNav(false)} />
      </div>

      {/* Main */}
      <main className="adm-main">
        {/* Logout button — top-right corner */}
        <button
          className="adm-logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Se déconnecter"
        >
          {loggingOut ? (
            <span style={{ fontSize: 12, opacity: 0.7 }}>…</span>
          ) : (
            <Icon name="x" size={15} />
          )}
          {!loggingOut && <span>Déconnexion</span>}
        </button>
        {children}
      </main>
    </div>
  );
}
