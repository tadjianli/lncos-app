export type ReviewStatus = "pending" | "published" | "rejected";

export interface ProductReview {
  id: string;
  userId: string | null;
  orderId: string | null;
  productId: string | null;
  productName: string;
  authorName: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  verified: boolean;
  featured: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  product?: string;
  verified?: boolean;
  featured?: boolean;
  pinned?: boolean;
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

export function reviewToPublic(r: ProductReview): PublicReview {
  return {
    id: r.id,
    name: r.authorName,
    rating: r.rating,
    date: formatReviewDate(r.createdAt),
    text: r.body,
    product: r.productName || undefined,
    verified: r.verified,
    featured: r.featured,
    pinned: r.pinned,
  };
}

export const FALLBACK_REVIEWS: PublicReview[] = [
  {
    id: "r1",
    name: "Margaux L.",
    rating: 5,
    date: "Il y a 2 jours",
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
    text: "La collection nocturne est devenue mon rituel du soir. Je me réveille avec un éclat qu'il me fallait autrefois toute une routine de maquillage pour obtenir.",
    product: "Crème Nuit",
    verified: true,
  },
];
