import { AppShell } from "@/components/layout/AppShell";
import {
  ProductGridCard,
  PerfumeBottle,
  LipstickBottle,
  PaletteBox,
  OilBottle,
  PRODUCT_BG,
} from "@/components/shared/ProductGridCard";

const PRODUCTS = [
  {
    id: 1,
    name: "Parfum Élixir Noir",
    price: "49,90 €",
    originalPrice: "64,90",
    rating: 4.9,
    reviewCount: 213,
    tag: "ÉDITION LIMITÉE",
    tagVariant: "limited" as const,
    bg: PRODUCT_BG.mauve,         // dusty mauve — muted, not pink
    illustration: <PerfumeBottle />,
  },
  {
    id: 2,
    name: "Rouge à Lèvres Velours",
    price: "18,90 €",
    rating: 4.6,
    reviewCount: 156,
    tag: "BEST-SELLER",
    tagVariant: "bestseller" as const,
    bg: PRODUCT_BG.rose,          // pale rose — subtle contrast to mauve
    illustration: <LipstickBottle />,
  },
  {
    id: 3,
    name: "Palette Glow Doré",
    price: "34,90 €",
    originalPrice: "44,90",
    rating: 4.8,
    reviewCount: 98,
    tag: "FLASH",
    tagVariant: "flash" as const,
    bg: PRODUCT_BG.amber,         // warm amber — editorial warmth
    illustration: <PaletteBox />,
  },
  {
    id: 4,
    name: "Huile Démaquillante",
    price: "19,90 €",
    rating: 4.5,
    reviewCount: 67,
    bg: PRODUCT_BG.champagne,     // warm champagne nude
    illustration: <OilBottle />,
  },
];

export default function FavorisPage() {
  return (
    <AppShell topBar={false} cartCount={0}>
      {/* Page title */}
      <div className="px-5 pt-14 pb-5">
        <p className="text-[0.62rem] font-light tracking-[0.28em] uppercase text-[#C9A96E] mb-1">
          Sélection personnelle
        </p>
        <h1 className="text-[1.65rem] font-bold text-white tracking-[-0.02em] leading-tight">
          Mes Favoris
        </h1>
        <p className="text-[0.8rem] text-[#666058] mt-1.5">4 produits sauvegardés</p>
      </div>

      {/* Product grid */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {PRODUCTS.map((p) => (
            <ProductGridCard
              key={p.id}
              name={p.name}
              price={p.price}
              originalPrice={p.originalPrice}
              rating={p.rating}
              reviewCount={p.reviewCount}
              tag={p.tag}
              tagVariant={p.tagVariant}
              bgGradient={p.bg}
              isFavorited
            >
              {p.illustration}
            </ProductGridCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
