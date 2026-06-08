"use client";
/**
 * LN COS — Admin shell wrapper
 * Sidebar + main content area. Responsive: sidebar collapses on mobile.
 */

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Icon } from "@/components/shared/Icon";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [mobileNav, setMobileNav] = useState(false);

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
          <div
            className="adm-sidebar-scrim"
            onClick={() => setMobileNav(false)}
          />
        )}
        <AdminSidebar onNav={() => setMobileNav(false)} />
      </div>

      {/* Main */}
      <main className="adm-main">{children}</main>
    </div>
  );
}
