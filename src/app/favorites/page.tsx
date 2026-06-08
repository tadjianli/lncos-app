"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/shared/ProductCard";
import { useStore } from "@/lib/store";
import { products } from "@/lib/data";

export default function FavoritesPage() {
  const favs       = useStore((s) => s.favs);
  const toggleFav  = useStore((s) => s.toggleFav);
  const isFav      = useStore((s) => s.isFav);
  const addToCart  = useStore((s) => s.addToCart);
  const openProduct = useStore((s) => s.openProduct);

  const favProducts = products.filter((p) => favs.includes(p.id));

  return (
    <AppShell>
      {/* Scrollable container */}
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
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
      <div
        style={{
          padding: "0 16px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {favProducts.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            wide
            isFav={isFav(p.id)}
            onFav={toggleFav}
            onAdd={addToCart}
            onOpen={openProduct}
          />
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
          Aucun favori pour l'instant.
        </div>
      )}
      </div>{/* end scroll container */}
    </AppShell>
  );
}
