/**
 * LN COS — Order contracts
 * Supports the 4-step delivery timeline already implemented in OrdersScreen.
 */

export type OrderStatus =
  | "preparing"    // step 0 — Préparation
  | "shipped"      // step 1 — Expédiée
  | "in_transit"   // step 2 — En livraison
  | "delivered"    // step 3 — Livrée
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";

/** Human-readable delivery step labels (matches OrdersScreen DeliveryProgress) */
export const DELIVERY_STEPS: { status: Exclude<OrderStatus, "cancelled">; label: string }[] = [
  { status: "preparing",  label: "Préparation"   },
  { status: "shipped",    label: "Expédiée"      },
  { status: "in_transit", label: "En livraison"  },
  { status: "delivered",  label: "Livrée"        },
];

export const DELIVERY_STEP_INDEX: Partial<Record<OrderStatus, number>> = {
  preparing:  0,
  shipped:    1,
  in_transit: 2,
  delivered:  3,
};

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  variant?: string;
  imageUrl?: string;
}

export interface ShippingAddress {
  recipientName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderContract {
  id: string;                // "LN-2480"
  userId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string; // human-readable, e.g. "Livraison prévue demain"
  deliveredAt?: string;       // ISO date
  shippingAddress?: ShippingAddress;
  createdAt: string;          // ISO date
  updatedAt?: string;         // ISO date
}
