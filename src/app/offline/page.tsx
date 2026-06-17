"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getAppName } from "@/lib/branding";

export default function OfflinePage() {
  useEffect(() => {
    if (!navigator.onLine) return;
    const timer = window.setTimeout(() => {
      window.location.reload();
    }, 1500);
    const onOnline = () => window.location.reload();
    window.addEventListener("online", onOnline);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        background: "#0A0A0A",
        color: "#f5f5f5",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#d4af37",
        }}
      >
        {getAppName()}
      </p>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Connexion instable</h1>
      <p style={{ margin: 0, maxWidth: 280, lineHeight: 1.5, color: "#a3a3a3" }}>
        Impossible de charger la page pour le moment. Nouvelle tentative automatique si la connexion
        revient…
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "12px 24px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #efb0c8, #f7c6d7)",
          color: "#3a1020",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Réessayer
      </Link>
    </div>
  );
}
