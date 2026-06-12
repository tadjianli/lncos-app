export type ResultDuration =
  | "1_day"
  | "1_week"
  | "2_weeks"
  | "1_month"
  | "2_months"
  | "custom";

export interface BeforeAfterResult {
  id: string;
  productId: string;
  reviewId: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  title: string | null;
  description: string;
  resultDuration: ResultDuration;
  resultDurationCustom: string | null;
  featured: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  rating?: number;
  verified?: boolean;
}

export interface PublicBeforeAfterResult {
  id: string;
  productId: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  title: string | null;
  description: string;
  durationLabel: string;
  featured: boolean;
  pinned: boolean;
  authorName?: string;
  rating?: number;
  verified?: boolean;
  productName?: string;
}

export const RESULT_DURATION_LABELS: Record<ResultDuration, string> = {
  "1_day": "1 jour",
  "1_week": "1 semaine",
  "2_weeks": "2 semaines",
  "1_month": "1 mois",
  "2_months": "2 mois",
  custom: "Personnalisé",
};

export function formatResultDuration(
  duration: ResultDuration,
  custom?: string | null
): string {
  if (duration === "custom" && custom?.trim()) return custom.trim();
  return RESULT_DURATION_LABELS[duration];
}

export function sortBeforeAfterResults<T extends { pinned?: boolean; featured?: boolean }>(
  items: T[],
  dateOf: (item: T) => string
): T[] {
  const priority = (r: T) => (r.pinned ? 3 : r.featured ? 2 : 1);
  return [...items].sort((a, b) => {
    const pd = priority(b) - priority(a);
    if (pd !== 0) return pd;
    return new Date(dateOf(b)).getTime() - new Date(dateOf(a)).getTime();
  });
}

export function toPublicBeforeAfter(
  r: BeforeAfterResult,
  productName?: string
): PublicBeforeAfterResult {
  return {
    id: r.id,
    productId: r.productId,
    beforeImageUrl: r.beforeImageUrl,
    afterImageUrl: r.afterImageUrl,
    title: r.title ?? null,
    description: r.description,
    durationLabel: formatResultDuration(r.resultDuration, r.resultDurationCustom),
    featured: r.featured,
    pinned: r.pinned,
    authorName: r.authorName,
    rating: r.rating,
    verified: r.verified,
    productName,
  };
}

export interface BeforeAfterFormValues {
  productId: string;
  reviewId: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  description: string;
  resultDuration: ResultDuration;
  resultDurationCustom: string;
  featured: boolean;
  pinned: boolean;
  showBeforeAfter: boolean;
}
