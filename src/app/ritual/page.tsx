import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
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
    bg: PRODUCT_BG.pink,
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
    bg: PRODUCT_BG.pinkWarm,
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
    bg: PRODUCT_BG.gold,
    illustration: <PaletteBox />,
  },
  {
    id: 4,
    name: "Huile Démaquillante",
    price: "19,90 €",
    rating: 4.5,
    reviewCount: 67,
    bg: PRODUCT_BG.cream,
    illustration: <OilBottle />,
  },
];

export default function RitualPage() {
  return (
    <AppShell topBar={false} cartCount={0}>
      {/* Page title — large left-aligned per design */}
      <div className="px-5 pt-14 pb-5">
        <h1 className="text-[1.75rem] font-bold text-white tracking-[-0.01em] leading-tight">
          Recommandé pour vous
        </h1>
      </div>

      {/* 2-column product grid */}
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
            >
              {p.illustration}
            </ProductGridCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
