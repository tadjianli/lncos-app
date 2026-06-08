"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/shared/Icon";

export default function BagPage() {
  return (
    <AppShell>
      {/* Sub-header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "58px 16px 12px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "var(--fs-h2)",
            color: "var(--ink)",
          }}
        >
          Mon panier
        </h2>
      </div>

      {/* Empty state */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          textAlign: "center",
          minHeight: "55dvh",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "var(--charcoal)",
            border: "1px solid rgba(255,255,255,.06)",
            display: "grid",
            placeItems: "center",
            marginBottom: 28,
          }}
        >
          <Icon name="bag" size={40} color="var(--ink-mute)" stroke={1.4} />
        </div>

        <p
          style={{
            fontSize: "var(--fs-h3)",
            fontWeight: 700,
            color: "var(--ink)",
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}
        >
          Votre panier est vide
        </p>
        <p
          style={{
            fontSize: "var(--fs-sm)",
            color: "var(--ink-mute)",
            lineHeight: 1.6,
            margin: "0 0 32px",
            maxWidth: "26ch",
          }}
        >
          Découvrez nos best-sellers et offrez-vous un moment de beauté.
        </p>

        <Link
          href="/"
          style={{
            display: "block",
            width: "100%",
            padding: "16px",
            borderRadius: "var(--r-pill)",
            background: "var(--pink-grad)",
            color: "#3a1020",
            fontWeight: 700,
            fontSize: "var(--fs-lg)",
            textAlign: "center",
            textDecoration: "none",
            boxShadow: "0 12px 30px -12px rgba(239,169,192,.7)",
          }}
        >
          Découvrir la boutique
        </Link>
      </div>
    </AppShell>
  );
}
