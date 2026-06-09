"use client";

import { useState, useCallback, useEffect } from "react";
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
    router.push("/login");
    router.refresh();
  }, [router]);

  const closeNav = useCallback(() => setMobileNav(false), []);

  useEffect(() => {
    document.body.style.overflow = mobileNav ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNav]);

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
        <AdminSidebar
          onNav={closeNav}
          onClose={closeNav}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
      </div>

      {/* Main */}
      <main className="adm-main">
        {children}
      </main>
    </div>
  );
}
