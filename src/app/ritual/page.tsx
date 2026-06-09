"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/shared/ProductCard";
import { products } from "@/lib/data";
import type { Product } from "@/lib/data";

export default function FavoritesPage() {
  const [favs, setFavs] = useState<string[]>([
    "parfum-noir",
    "rouge-mat",
    "palette-glow",
    "huile-demaq",
  ]);

  const favProducts = products.filter((p) => favs.includes(p.id));

  function toggleFav(id: string) {
    setFavs((f) =>
      f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div style={{ padding: "58px 18px 16px" }}>
        <p
          style={{
            fontSize: "var(--fs-nano)",
            fontWeight: 700,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 6,
          }}
        >
          Sélection personnelle
        </p>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: "var(--fs-h2)",
            fontWeight: 700,
            color: "var(--ink)",
            letterSpacing: "-.01em",
          }}
        >
          Mes Favoris
        </h1>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--ink-mute)", margin: 0 }}>
          {favProducts.length} produit{favProducts.length !== 1 ? "s" : ""} sauvegardé
          {favProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      <div className="prodbento" style={{ padding: "0 16px 24px" }}>
        {favProducts.map((p) => (
          <div key={p.id} className="prodbento-cell">
            <ProductCard
              p={p}
              wide
              isFav={favs.includes(p.id)}
              onFav={toggleFav}
              onAdd={() => {}}
              onOpen={() => {}}
            />
          </div>
        ))}
      </div>

      {favProducts.length === 0 && (
        <div
          style={{
            padding: "60px 32px",
            textAlign: "center",
            color: "var(--ink-mute)",
            fontSize: "var(--fs-sm)",
          }}
        >
          Aucun favori pour l&apos;instant.
        </div>
      )}
    </AppShell>
  );
}
