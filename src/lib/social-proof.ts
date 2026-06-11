export type SocialProofEventType =
  | "purchase"
  | "review"
  | "favorite"
  | "cart"
  | "viewing"
  | "popular"
  | "shipped";

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
  productName: string;
  rating?: number;
  viewerCount?: number;
  timeAgo: string;
}

export const SOCIAL_PROOF_DISPLAY_MS = 4000;

export const DEFAULT_SOCIAL_PROOF_SETTINGS: SocialProofSettings = {
  purchaseNotifications: true,
  reviewNotifications: true,
  favoriteNotifications: true,
  cartNotifications: true,
  liveViewersEnabled: true,
  stockAlertsEnabled: true,
  salesCounterEnabled: true,
  rotationIntervalSec: 10,
  notificationDurationMs: SOCIAL_PROOF_DISPLAY_MS,
  viewersMin: 5,
  viewersMax: 50,
  stockLowThreshold: 10,
  trustFastDelivery: true,
  trustSecurePayment: true,
  trustVerifiedPurchase: true,
  trustEasyReturns: true,
};

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

export function formatSocialProofCopy(
  notification: SocialProofNotification
): { line1: string; line2?: string } {
  const { type, productName, rating, viewerCount } = notification;

  switch (type) {
    case "review":
      return {
        line1: `⭐ Avis ${rating ?? 5} étoiles reçu récemment`,
        line2: productName,
      };
    case "cart":
      return {
        line1: "🛒 Un article a été ajouté au panier",
        line2: productName,
      };
    case "purchase":
      return {
        line1: "📦 Une commande vient d'être passée",
        line2: productName,
      };
    case "viewing":
      return {
        line1: `👀 ${viewerCount ?? 7} personnes consultent ce produit`,
        line2: productName,
      };
    case "popular":
      return {
        line1: "🔥 Produit populaire aujourd'hui",
        line2: productName,
      };
    case "favorite":
      return {
        line1: "💖 Ajouté aux favoris récemment",
        line2: productName,
      };
    case "shipped":
      return {
        line1: "🚚 Commande expédiée récemment",
        line2: productName,
      };
    default:
      return { line1: productName };
  }
}

const SYNTHETIC_ROTATION_TYPES: SocialProofEventType[] = [
  "review",
  "cart",
  "purchase",
  "viewing",
  "popular",
  "favorite",
  "shipped",
];

function isDbEventTypeEnabled(type: SocialProofEventType, settings: SocialProofSettings): boolean {
  switch (type) {
    case "purchase":
      return settings.purchaseNotifications;
    case "review":
      return settings.reviewNotifications;
    case "favorite":
      return settings.favoriteNotifications;
    case "cart":
      return settings.cartNotifications;
    case "viewing":
    case "popular":
    case "shipped":
      return true;
    default:
      return false;
  }
}

export function buildSyntheticNotifications(
  products: { id: string; name: string }[],
  settings: SocialProofSettings
): SocialProofNotification[] {
  if (products.length === 0) return [];

  const enabledTypes = SYNTHETIC_ROTATION_TYPES.filter((type) =>
    isDbEventTypeEnabled(type, settings)
  );
  if (enabledTypes.length === 0) return [];

  const minsOffsets = [2, 4, 6, 9, 14, 18, 27];

  return enabledTypes.map((type, i) => {
    const product = products[i % products.length];
    const created = new Date(
      Date.now() - minsOffsets[i % minsOffsets.length] * 60_000
    ).toISOString();

    const base: SocialProofNotification = {
      id: `syn-${type}-${product.id}-${i}`,
      type,
      productName: product.name,
      timeAgo: formatTimeAgo(created),
    };

    if (type === "review") {
      return { ...base, rating: 5 };
    }
    if (type === "viewing") {
      return {
        ...base,
        viewerCount: computeLiveViewers(
          product.id,
          settings.viewersMin,
          settings.viewersMax
        ),
      };
    }
    return base;
  });
}

export function enrichNotificationPool(
  base: SocialProofNotification[],
  products: { id: string; name: string }[],
  settings: SocialProofSettings
): SocialProofNotification[] {
  const synthetic = buildSyntheticNotifications(products, settings);
  const seen = new Set<string>();
  const merged: SocialProofNotification[] = [];

  for (const item of [...base, ...synthetic]) {
    const key = `${item.type}:${item.productName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.length > 0 ? merged : synthetic;
}

export function eventToNotification(e: SocialProofEvent): SocialProofNotification {
  const type = e.eventType;
  const base: SocialProofNotification = {
    id: e.id,
    type,
    productName: e.productName,
    timeAgo: formatTimeAgo(e.createdAt),
  };

  if (type === "review") {
    return { ...base, rating: e.rating ?? 5 };
  }
  if (type === "viewing" && e.productId) {
    return {
      ...base,
      viewerCount: computeLiveViewers(e.productId, 5, 50),
    };
  }
  return base;
}

export function shuffleNotifications(
  items: SocialProofNotification[]
): SocialProofNotification[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickNextNotificationIndex(
  queue: SocialProofNotification[],
  lastType: SocialProofEventType | null,
  lastIndex: number
): number {
  if (queue.length === 0) return 0;
  if (queue.length === 1) return 0;

  const candidates = queue
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => item.type !== lastType || index !== lastIndex);

  const pool =
    candidates.length > 0
      ? candidates
      : queue.map((item, index) => ({ item, index }));

  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.index;
}

export function randomPauseMs(minMs = 3500, maxMs = 8500): number {
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
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
    notificationDurationMs:
      row.notification_duration_ms > 0
        ? row.notification_duration_ms
        : SOCIAL_PROOF_DISPLAY_MS,
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
