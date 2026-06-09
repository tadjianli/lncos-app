export type SocialProofEventType = "purchase" | "review" | "favorite" | "cart";

export type RotationInterval = 5 | 10 | 15 | 30;

export type StockLowThreshold = 5 | 10 | 15;

export interface SocialProofSettings {
  purchaseNotifications: boolean;
  reviewNotifications: boolean;
  favoriteNotifications: boolean;
  cartNotifications: boolean;
  liveViewersEnabled: boolean;
  stockAlertsEnabled: boolean;
  salesCounterEnabled: boolean;
  rotationIntervalSec: RotationInterval;
  notificationDurationMs: number;
  viewersMin: number;
  viewersMax: number;
  stockLowThreshold: StockLowThreshold;
  trustFastDelivery: boolean;
  trustSecurePayment: boolean;
  trustVerifiedPurchase: boolean;
  trustEasyReturns: boolean;
}

export interface SocialProofEvent {
  id: string;
  eventType: SocialProofEventType;
  productId: string | null;
  productName: string;
  customerName: string;
  rating: number | null;
  createdAt: string;
}

export interface SocialProofNotification {
  id: string;
  type: SocialProofEventType;
  customerName: string;
  productName: string;
  rating?: number;
  timeAgo: string;
}

export const DEFAULT_SOCIAL_PROOF_SETTINGS: SocialProofSettings = {
  purchaseNotifications: true,
  reviewNotifications: true,
  favoriteNotifications: true,
  cartNotifications: true,
  liveViewersEnabled: true,
  stockAlertsEnabled: true,
  salesCounterEnabled: true,
  rotationIntervalSec: 10,
  notificationDurationMs: 3000,
  viewersMin: 5,
  viewersMax: 50,
  stockLowThreshold: 10,
  trustFastDelivery: true,
  trustSecurePayment: true,
  trustVerifiedPurchase: true,
  trustEasyReturns: true,
};

const FIRST_NAMES = [
  "Sarah", "Sophie", "Emma", "Laura", "Margaux", "Diane", "Camille", "Léa",
  "Chloé", "Manon", "Julie", "Inès", "Claire", "Vanessa", "Aurélie",
];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Nombre de visiteurs crédible — jamais 0, 1 ou 2 */
export function computeLiveViewers(
  productId: string,
  min: number,
  max: number,
  tickMs = 30_000
): number {
  const floor = Math.max(5, min);
  const ceiling = Math.max(floor + 1, max);
  const span = ceiling - floor;
  const tick = Math.floor(Date.now() / tickMs);
  const n = floor + (hashString(`${productId}:${tick}`) % (span + 1));
  return Math.max(5, n);
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "À l'instant";
  if (mins === 1) return "Il y a 1 minute";
  if (mins < 60) return `Il y a ${mins} minutes`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "Il y a 1 heure";
  if (hours < 24) return `Il y a ${hours} heures`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Il y a 1 jour";
  return `Il y a ${days} jours`;
}

export function syntheticSalesCounts(productId: string): { today: number; week: number } {
  const h = hashString(productId);
  return {
    today: 3 + (h % 14),
    week: 12 + (h % 38),
  };
}

export function buildSyntheticNotifications(
  products: { id: string; name: string }[],
  settings: SocialProofSettings
): SocialProofNotification[] {
  if (products.length === 0) return [];
  const out: SocialProofNotification[] = [];
  const types: SocialProofEventType[] = [];
  if (settings.purchaseNotifications) types.push("purchase");
  if (settings.reviewNotifications) types.push("review");
  if (settings.favoriteNotifications) types.push("favorite");
  if (settings.cartNotifications) types.push("cart");

  types.forEach((type, i) => {
    const p = products[i % products.length];
    const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${String.fromCharCode(65 + (i % 26))}.`;
    const mins = [3, 5, 8, 12, 15, 22, 35][i % 7];
    const created = new Date(Date.now() - mins * 60_000).toISOString();
    out.push({
      id: `syn-${type}-${i}`,
      type,
      customerName: name,
      productName: p.name,
      rating: type === "review" ? 5 : undefined,
      timeAgo: formatTimeAgo(created),
    });
  });
  return out;
}

export function eventToNotification(e: SocialProofEvent): SocialProofNotification {
  return {
    id: e.id,
    type: e.eventType,
    customerName: e.customerName,
    productName: e.productName,
    rating: e.rating ?? undefined,
    timeAgo: formatTimeAgo(e.createdAt),
  };
}

export type DbSocialProofSettings = {
  id: string;
  purchase_notifications: boolean;
  review_notifications: boolean;
  favorite_notifications: boolean;
  cart_notifications: boolean;
  live_viewers_enabled: boolean;
  stock_alerts_enabled: boolean;
  sales_counter_enabled: boolean;
  rotation_interval_sec: number;
  notification_duration_ms: number;
  viewers_min: number;
  viewers_max: number;
  stock_low_threshold: number;
  trust_fast_delivery: boolean;
  trust_secure_payment: boolean;
  trust_verified_purchase: boolean;
  trust_easy_returns: boolean;
};

export function dbToSocialProofSettings(
  row: DbSocialProofSettings | null | undefined
): SocialProofSettings {
  if (!row) return { ...DEFAULT_SOCIAL_PROOF_SETTINGS };
  return {
    purchaseNotifications: row.purchase_notifications,
    reviewNotifications: row.review_notifications,
    favoriteNotifications: row.favorite_notifications,
    cartNotifications: row.cart_notifications,
    liveViewersEnabled: row.live_viewers_enabled,
    stockAlertsEnabled: row.stock_alerts_enabled,
    salesCounterEnabled: row.sales_counter_enabled,
    rotationIntervalSec: row.rotation_interval_sec as RotationInterval,
    notificationDurationMs: row.notification_duration_ms > 0 ? row.notification_duration_ms : 3000,
    viewersMin: row.viewers_min,
    viewersMax: row.viewers_max,
    stockLowThreshold: row.stock_low_threshold as StockLowThreshold,
    trustFastDelivery: row.trust_fast_delivery,
    trustSecurePayment: row.trust_secure_payment,
    trustVerifiedPurchase: row.trust_verified_purchase,
    trustEasyReturns: row.trust_easy_returns,
  };
}

export function socialProofSettingsToDb(s: SocialProofSettings) {
  return {
    purchase_notifications: s.purchaseNotifications,
    review_notifications: s.reviewNotifications,
    favorite_notifications: s.favoriteNotifications,
    cart_notifications: s.cartNotifications,
    live_viewers_enabled: s.liveViewersEnabled,
    stock_alerts_enabled: s.stockAlertsEnabled,
    sales_counter_enabled: s.salesCounterEnabled,
    rotation_interval_sec: s.rotationIntervalSec,
    notification_duration_ms: s.notificationDurationMs,
    viewers_min: Math.max(5, s.viewersMin),
    viewers_max: Math.max(s.viewersMin, s.viewersMax),
    stock_low_threshold: s.stockLowThreshold,
    trust_fast_delivery: s.trustFastDelivery,
    trust_secure_payment: s.trustSecurePayment,
    trust_verified_purchase: s.trustVerifiedPurchase,
    trust_easy_returns: s.trustEasyReturns,
  };
}
