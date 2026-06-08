"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/shared/ProductCard";
import { Icon } from "@/components/shared/Icon";
import { PinkBtn } from "@/components/shared/ActionButtons";
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
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 40px 60px",
            textAlign: "center",
            animation: "fadeUp .5s ease both",
          }}
        >
          {/* Icon ring */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(247,198,215,.15), rgba(247,198,215,.06))",
              border: "1.5px solid rgba(247,198,215,.22)",
              display: "grid",
              placeItems: "center",
              marginBottom: 24,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(247,198,215,.08), transparent 70%)",
              }}
            />
            <Icon name="heart" size={36} color="var(--pink)" stroke={1.4} />
          </div>

          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 10,
            }}
          >
            Sélection vide
          </p>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--ink)",
              margin: "0 0 10px",
              letterSpacing: "-.01em",
            }}
          >
            Aucun favori pour l&apos;instant
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-mute)",
              lineHeight: 1.6,
              maxWidth: 260,
              margin: "0 0 28px",
            }}
          >
            Parcourez la boutique et cœurez les produits qui vous inspirent.
          </p>
          <Link href="/">
            <PinkBtn style={{ width: "auto", padding: "14px 32px" }}>
              Découvrir la boutique
            </PinkBtn>
          </Link>
        </div>
      )}
      </div>{/* end scroll container */}
    </AppShell>
  );
}
