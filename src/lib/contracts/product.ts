/**
 * LN COS — Product & Cart contracts
 * Canonical typed interfaces. Field names follow future Supabase column conventions.
 * Adapter: `toProductContract()` bridges the existing data.ts `Product` shape.
 */

export interface ProductVariant {
  id: string;
  label: string;
  available: boolean;
  priceOffset?: number; // positive = surcharge, negative = discount
}

export interface ProductContract {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];            // e.g. ["Flash", "Best-seller", "Nouveau"]
  volume?: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description?: string;
  ingredients?: string;
  howToUse?: string;
  variants: ProductVariant[];
  inStock: boolean;
  stockCount?: number;       // undefined = unlimited
  isFeatured?: boolean;
  createdAt?: string;        // ISO
  updatedAt?: string;        // ISO
}

export interface CartItemContract {
  key: string;               // "{productId}|{variantId}"
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  qty: number;
  variant?: string;
}

/**
 * Adapter: bridges the existing `Product` shape from data.ts to `ProductContract`.
 * Use this in components that need the canonical contract while data.ts is still live.
 */
export function toProductContract(p: {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  tag?: string;
  volume?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  variants?: string[];
}): ProductContract {
  return {
    id: p.id,
    name: p.name,
    brand: "LN COS",
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category ?? "unknown",
    tags: p.tag ? [p.tag] : [],
    volume: p.volume,
    rating: p.rating ?? 0,
    reviewCount: p.reviews ?? 0,
    imageUrl: p.image ?? "",
    variants: (p.variants ?? []).map((v) => ({ id: v, label: v, available: true })),
    inStock: true,
  };
}
