"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/shared/ProductCard";
import { Icon } from "@/components/shared/Icon";
import { PinkBtn, SubHeader } from "@/components/shared/ActionButtons";
import { useStore } from "@/lib/store";
import { usePublicProducts } from "@/lib/client-supabase";

export default function FavoritesPage() {
  const favs       = useStore((s) => s.favs);
  const toggleFav  = useStore((s) => s.toggleFav);
  const addToCart  = useStore((s) => s.addToCart);
  const openProduct = useStore((s) => s.openProduct);
  const { products } = usePublicProducts();

  const favProducts = products.filter((p) => favs.includes(p.id));

  return (
    <AppShell>
      {/* Scrollable container */}
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
      <SubHeader title="Mes Favoris" backHref="/profile" />
      <div style={{ padding: "0 18px 16px" }}>
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
          <Link href="/boutique">
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
