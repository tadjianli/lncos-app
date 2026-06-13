import type { Database } from "@/lib/database.types";

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: string;
  isActive: boolean;
  isFree: boolean;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number | null;
  minimumOrderEnabled: boolean;
  minimumOrderAmount: number | null;
  maximumOrderEnabled: boolean;
  maximumOrderAmount: number | null;
  sortOrder: number;
  createdAt: string;
}

type DbShipping = Database["public"]["Tables"]["shipping_methods"]["Row"];

export function dbToShipping(r: DbShipping): ShippingMethod {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    estimatedDays: r.estimated_days,
    icon: r.icon,
    isActive: r.is_active,
    isFree: r.is_free,
    freeShippingEnabled: r.free_shipping_enabled ?? false,
    freeShippingThreshold: r.free_shipping_threshold != null ? Number(r.free_shipping_threshold) : null,
    minimumOrderEnabled: r.minimum_order_enabled ?? false,
    minimumOrderAmount: r.minimum_order_amount != null ? Number(r.minimum_order_amount) : null,
    maximumOrderEnabled: r.maximum_order_enabled ?? false,
    maximumOrderAmount: r.maximum_order_amount != null ? Number(r.maximum_order_amount) : null,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}
