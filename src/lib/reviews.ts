export type ReviewStatus = "pending" | "published" | "rejected" | "draft";

export interface ReviewImage {
  id: string;
  reviewId: string;
  imageUrl: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  userId: string | null;
  orderId: string | null;
  productId: string | null;
  productName: string;
  authorName: string;
  authorEmail: string | null;
  authorPhotoUrl: string | null;
  title: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  verified: boolean;
  featured: boolean;
  pinned: boolean;
  homepageFeatured: boolean;
  reviewDate: string | null;
  images: ReviewImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  title?: string;
  text: string;
  product?: string;
  verified?: boolean;
  featured?: boolean;
  pinned?: boolean;
  homepageFeatured?: boolean;
  authorPhotoUrl?: string;
  images?: string[];
}

export function reviewDisplayDate(review: Pick<ProductReview, "reviewDate" | "createdAt">): string {
  return review.reviewDate ?? review.createdAt;
}

export function formatReviewDate(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Aujourd'hui";
  if (days === 1) return "Il y a 1 jour";
  if (days < 7) return `Il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "Il y a 1 semaine";
  if (weeks < 5) return `Il y a ${weeks} semaines`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function sortReviews<T extends { pinned?: boolean; featured?: boolean }>(
  reviews: T[],
  dateOf: (r: T) => string
): T[] {
  const priority = (r: T) => (r.pinned ? 3 : r.featured ? 2 : 1);
  return [...reviews].sort((a, b) => {
    const pd = priority(b) - priority(a);
    if (pd !== 0) return pd;
    return new Date(dateOf(b)).getTime() - new Date(dateOf(a)).getTime();
  });
}

export function reviewToPublic(r: ProductReview): PublicReview {
  return {
    id: r.id,
    name: r.authorName,
    rating: r.rating,
    date: formatReviewDate(reviewDisplayDate(r)),
    title: r.title || undefined,
    text: r.body,
    product: r.productName || undefined,
    verified: r.verified,
    featured: r.featured,
    pinned: r.pinned,
    homepageFeatured: r.homepageFeatured,
    authorPhotoUrl: r.authorPhotoUrl ?? undefined,
    images: r.images.length > 0 ? r.images.map((i) => i.imageUrl) : undefined,
  };
}

export const REVIEW_STATUS_LABELS: Record<
  ReviewStatus,
  { label: string; bg: string; color: string }
> = {
  pending: { label: "En attente", bg: "rgba(199,122,51,.1)", color: "var(--tone-orange)" },
  published: { label: "Publié", bg: "rgba(47,158,104,.12)", color: "var(--tone-green)" },
  rejected: { label: "Rejeté", bg: "rgba(255,90,90,.1)", color: "#FF7070" },
  draft: { label: "Brouillon", bg: "rgba(120,120,140,.12)", color: "var(--adm-ink-mute)" },
};

export const FALLBACK_REVIEWS: PublicReview[] = [
  {
    id: "r1",
    name: "Margaux L.",
    rating: 5,
    date: "Il y a 2 jours",
    title: "Transformation visible",
    text: "Ce sérum a complètement transformé mon teint en trois semaines. La texture est incomparable — soyeuse, absorbée instantanément. Je ne peux plus m'en passer.",
    product: "Sérum Éclat",
    verified: true,
    pinned: true,
  },
  {
    id: "r2",
    name: "Diane K.",
    rating: 5,
    date: "Il y a 5 jours",
    title: "Luxe dans les détails",
    text: "LN COS comprend que le luxe est dans les détails. Du packaging à la fragrance, chaque élément est intentionnel. Un vrai soin haut de gamme.",
    product: "Parfum Noir",
    verified: true,
    featured: true,
  },
  {
    id: "r3",
    name: "Isabelle R.",
    rating: 5,
    date: "Il y a 1 semaine",
    title: "Mon rituel du soir",
    text: "La collection nocturne est devenue mon rituel du soir. Je me réveille avec un éclat qu'il me fallait autrefois toute une routine de maquillage pour obtenir.",
    product: "Crème Nuit",
    verified: true,
  },
];
