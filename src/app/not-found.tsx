import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <article
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          padding: "48px 18px 32px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--ink)", margin: "0 0 12px" }}>
          Page introuvable
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 20px" }}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: "var(--r-md)",
            background: "var(--gold)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Retour à l&apos;accueil
        </Link>
      </article>
    </AppShell>
  );
}
