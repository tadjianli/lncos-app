"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { Icon } from "@/components/shared/Icon";
import { PinkBtn, SubHeader } from "@/components/shared/ActionButtons";
import { useStore } from "@/lib/store";
import { usePublicProducts } from "@/lib/client-supabase";

export default function FavoritesPage() {
  const favs = useStore((s) => s.favs);
  const { products } = usePublicProducts();

  const favProducts = products.filter((p) => favs.includes(p.id));

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18} padBottom={false}>
        <SubHeader title="Mes Favoris" backHref="/profile" />
        <div style={{ padding: "0 0 16px" }}>
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

        {favProducts.length > 0 && <ProductGrid products={favProducts} />}

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
      </ScrollRegion>
    </AppShell>
  );
}
