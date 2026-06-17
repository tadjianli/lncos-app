"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { ProductCard } from "@/components/shared/ProductCard";
import { useStore } from "@/lib/store";
import { usePublicProducts } from "@/lib/client-supabase";

export default function RitualPage() {
  const favs = useStore((s) => s.favs);
  const toggleFav = useStore((s) => s.toggleFav);
  const addToCart = useStore((s) => s.addToCart);
  const openProduct = useStore((s) => s.openProduct);
  const { products } = usePublicProducts();

  const favProducts = products.filter((p) => favs.includes(p.id));

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18} padBottom={false}>
      <div style={{ padding: "58px 0 16px" }}>
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
          Rituel beauté
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
          Vos favoris
        </h1>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--ink-mute)", margin: 0 }}>
          {favProducts.length} produit{favProducts.length !== 1 ? "s" : ""} sauvegardé
          {favProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="prodbento prodbento--2 product-grid--clear-bottom" style={{ padding: "0 0 24px" }}>
        {favProducts.map((p) => (
          <div key={p.id} className="prodbento-cell">
            <ProductCard
              p={p}
              layout="grid-2"
              isFav={favs.includes(p.id)}
              onFav={toggleFav}
              onAdd={addToCart}
              onOpen={openProduct}
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
      </ScrollRegion>
    </AppShell>
  );
}
