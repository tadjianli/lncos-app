/**
 * LN COS — Notification contracts
 */

export type NotificationType =
  | "promo"
  | "order"
  | "points"
  | "new_product"
  | "rdv_reminder"
  | "system";

/** Discriminated union on `type` for type-safe meta access */
export type NotificationMeta =
  | { type: "order";        orderId: string; status: string }
  | { type: "points";       pts: number }
  | { type: "promo";        badge: string; code?: string }
  | { type: "new_product";  productId: string }
  | { type: "rdv_reminder"; appointmentId: string; serviceId: string; apptTime: string }
  | { type: "system";       action?: string };

export interface NotificationContract {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  body: string;
  unread: boolean;
  createdAt: string;    // ISO
  expiresAt?: string;   // ISO — for promo/flash notifications
  meta?: NotificationMeta;
}

/** Group labels for the UI (maps to time buckets in NotificationsScreen) */
export type NotificationGroup = "today" | "yesterday" | "this_week" | "older";

export function getNotificationGroup(createdAt: string, now = new Date()): NotificationGroup {
  const d = new Date(createdAt);
  const msPerDay = 86_400_000;
  const diffDays = Math.floor((now.getTime() - d.getTime()) / msPerDay);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays <= 7)  return "this_week";
  return "older";
}
