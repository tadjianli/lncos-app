"use client";
/**
 * LN COS — Client-facing Supabase hooks
 * Maps DB column names → UI field names. Falls back to static data on error.
 */

import { useState, useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { dbToSection } from "./home-sections-db";
import {
  DEFAULT_HOME_SECTIONS,
  visibleSections,
  type HomeSection,
  type PageSlug,
} from "./home-sections";
import { DEFAULT_SECTIONS_BY_PAGE } from "./page-sections";
import { useHomeSectionsStore } from "./stores/home-sections-store";
import type { Product, Category } from "./data";
import type { ProductVariant } from "./product-catalog";
import { products as STATIC_PRODUCTS, categories as STATIC_CATEGORIES } from "./data";
import { normalizeExtraSections, normalizeSectionToggles } from "./product-sections";
import { normalizeHomeVisibility } from "./product-home-visibility";
import type { ProductReview } from "./reviews";
import {
  FALLBACK_REVIEWS,
  reviewToPublic,
  sortReviews,
  reviewDisplayDate,
  type PublicReview,
} from "./reviews";
import {
  dbToHeroSettings,
  dbToHeroSlide,
  DEFAULT_HERO_CAROUSEL_SETTINGS,
  type HeroCarouselSettings,
  type HeroCarouselSlide,
} from "./hero-carousel";
import type { BeforeAfterResult, PublicBeforeAfterResult, ResultDuration } from "./before-after";
import { sortBeforeAfterResults, toPublicBeforeAfter } from "./before-after";
import { PRODUCT_SELECT, PRODUCT_SELECT_LEGACY, isMissingColumnError } from "./product-select";

type DbVariantRow = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  image_url: string | null;
  position: number;
};

/* ── DB row → UI Product mapper ──────────────────────────────── */
function mapProduct(row: {
  id: string;
  name: string;
  cat: string;
  price: number;
  old_price: number | null;
  ml: string;
  rating: number;
  reviews: number;
  tag: string | null;
  stock: number;
  variants: string[];
  description: string;
  usage_tips?: string[] | null;
  benefits?: string[] | null;
  section_toggles?: unknown;
  extra_sections?: unknown;
  active: boolean;
  image_url?: string | null;
  main_image_url?: string | null;
  gallery_images?: string[] | null;
  thumbnail_images?: string[] | null;
  home_visibility?: unknown;
  video_url?: string | null;
  seo_keyword?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  seo_slug?: string | null;
  image_alt?: string | null;
  product_variants?: DbVariantRow[] | null;
}): Product {
  const richVariants: ProductVariant[] = (row.product_variants ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      productId: v.product_id,
      name: v.name,
      price: Number(v.price),
      stock: v.stock,
      sku: v.sku,
      imageUrl: v.image_url,
      position: v.position,
    }));

  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    price: row.price,
    old: row.old_price,
    ml: row.ml,
    rating: row.rating,
    reviews: row.reviews,
    tag: row.tag,
    stock: row.stock,
    variants: richVariants.length > 0 ? richVariants.map((v) => v.name) : (row.variants ?? []),
    desc: row.description,
    usageTips: row.usage_tips ?? [],
    benefits: row.benefits ?? [],
    sectionToggles: normalizeSectionToggles(row.section_toggles),
    extraSections: normalizeExtraSections(row.extra_sections),
    mainImageUrl: row.main_image_url ?? row.image_url ?? null,
    galleryImages: row.gallery_images?.length
      ? row.gallery_images
      : (row.thumbnail_images ?? []),
    videoUrl: row.video_url ?? null,
    imageUrl: row.image_url ?? null,
    productVariants: richVariants,
    homeVisibility: normalizeHomeVisibility(row.home_visibility, row.tag),
    active: row.active ?? true,
    seoKeyword: row.seo_keyword ?? null,
    seoTitle: row.seo_title ?? null,
    metaDescription: row.meta_description ?? null,
    seoSlug: row.seo_slug ?? null,
    imageAlt: row.image_alt ?? null,
  };
}

async function fetchActiveProductsFromDb(): Promise<Product[] | null> {
  for (const select of [PRODUCT_SELECT, PRODUCT_SELECT_LEGACY]) {
    const { data, error } = await getSupabase()
      .from("products")
      .select(select)
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      return (data as unknown as Parameters<typeof mapProduct>[0][]).map(mapProduct);
    }
    if (error && !isMissingColumnError(error.message, "benefits")) {
      console.error("[usePublicProducts] Erreur Supabase:", error.message);
      break;
    }
  }
  return null;
}

/** Charge un produit par identifiant (preview = inclut les produits inactifs). */
export async function fetchPublicProductById(
  id: string,
  options?: { preview?: boolean }
): Promise<Product | null> {
  const fallback = STATIC_PRODUCTS.find((p) => p.id === id) ?? null;
  if (!isSupabaseConfigured()) {
    return fallback ? { ...fallback, active: true } : null;
  }

  try {
    for (const select of [PRODUCT_SELECT, PRODUCT_SELECT_LEGACY]) {
      let query = getSupabase().from("products").select(select).eq("id", id);
      if (!options?.preview) query = query.eq("active", true);
      const { data, error } = await query.maybeSingle();
      if (error) {
        if (isMissingColumnError(error.message, "benefits") && select === PRODUCT_SELECT) continue;
        break;
      }
      if (data) return mapProduct(data as unknown as Parameters<typeof mapProduct>[0]);
    }
    return options?.preview ? null : fallback ? { ...fallback, active: true } : null;
  } catch {
    return fallback ? { ...fallback, active: true } : null;
  }
}

/* ── usePublicProducts ───────────────────────────────────────── */
export function usePublicProducts() {
  const [products, setProducts] = useState<Product[]>(
    [...STATIC_PRODUCTS].reverse().map((p) => ({
      ...p,
      homeVisibility: normalizeHomeVisibility(p.homeVisibility, p.tag),
    }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const loaded = await fetchActiveProductsFromDb();
        if (loaded) setProducts(loaded);
      } catch {
        // Conserver le catalogue statique de secours
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byId = (id: string) => products.find((p) => p.id === id) ?? null;

  return { products, loading, byId };
}

/* ── usePublicCategories ─────────────────────────────────────── */
export function usePublicCategories() {
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    void (async () => {
      try {
        const { data, error } = await getSupabase()
          .from("categories")
          .select("id,name,count")
          .order("position");
        if (!error && data && data.length > 0) {
          setCategories(data as Category[]);
        }
      } catch {
        // Conserver les catégories statiques
      }
    })();
  }, []);

  return { categories };
}

/* ── usePublicPageSections ───────────────────────────────────── */
function pageFallback(slug: PageSlug): HomeSection[] {
  return slug === "home" ? DEFAULT_HOME_SECTIONS : (DEFAULT_SECTIONS_BY_PAGE[slug] ?? []);
}

export function usePublicPageSections(pageSlug: PageSlug = "home") {
  const [isPreview, setIsPreview] = useState(false);
  const [sections, setSections] = useState<HomeSection[]>(() => pageFallback(pageSlug));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsPreview(new URLSearchParams(window.location.search).get("preview") === "1");
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSections(pageFallback(pageSlug));
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const preview =
          new URLSearchParams(window.location.search).get("preview") === "1";
        const { data, error } = await getSupabase()
          .from("home_sections")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("is_draft", preview)
          .order("position");

        if (!error && data && data.length > 0) {
          const mapped = data.map(dbToSection);
          setSections(mapped);
          if (!preview && pageSlug === "home") {
            useHomeSectionsStore.getState().hydratePublished(mapped);
          }
        } else {
          setSections(pageFallback(pageSlug));
        }
      } catch {
        setSections(pageFallback(pageSlug));
      } finally {
        setLoading(false);
      }
    };

    void load();

    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;
    try {
      channel = getSupabase()
        .channel(`home-sections-public-${pageSlug}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "home_sections" },
          () => { void load(); }
        )
        .subscribe();
    } catch {
      // Realtime indisponible — données statiques conservées
    }

    return () => {
      if (channel) {
        try {
          getSupabase().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [pageSlug]);

  const getVisible = (opts?: {
    isMobile?: boolean;
    isVip?: boolean;
    isLoggedIn?: boolean;
  }) => visibleSections(sections, opts);

  return { sections, loading, getVisible, isPreview };
}

/** @deprecated use usePublicPageSections("home") */
export function usePublicHomeSections() {
  return usePublicPageSections("home");
}

/* ── Hero carousel (accueil) ─────────────────────────────────── */

export function usePublicHeroCarousel() {
  const [settings, setSettings] = useState<HeroCarouselSettings>(DEFAULT_HERO_CAROUSEL_SETTINGS);
  const [slides, setSlides] = useState<HeroCarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const supabase = getSupabase();
        const [settingsRes, slidesRes] = await Promise.all([
          supabase.from("hero_carousel_settings").select("*").eq("id", "home").maybeSingle(),
          supabase.from("hero_carousel_slides").select("*").order("position"),
        ]);

        if (settingsRes.data) {
          setSettings(dbToHeroSettings(settingsRes.data));
        }
        if (slidesRes.data?.length) {
          setSlides(slidesRes.data.map(dbToHeroSlide));
        }
      } catch {
        // fallback defaults
      } finally {
        setLoading(false);
      }
    };

    void load();

    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;
    try {
      channel = getSupabase()
        .channel("hero-carousel-public")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "hero_carousel_settings" },
          () => { void load(); }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "hero_carousel_slides" },
          () => { void load(); }
        )
        .subscribe();
    } catch {
      // Realtime indisponible
    }

    return () => {
      if (channel) {
        try {
          getSupabase().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return { settings, slides, loading };
}

/* ── Product reviews ─────────────────────────────────────────── */

type DbReview = {
  id: string;
  user_id: string | null;
  order_id: string | null;
  product_id: string | null;
  product_name: string;
  author_name: string;
  author_email: string | null;
  author_photo_url: string | null;
  title: string;
  rating: number;
  body: string;
  status: string;
  verified: boolean;
  featured: boolean;
  pinned: boolean;
  homepage_featured: boolean;
  review_date: string | null;
  created_at: string;
  updated_at: string;
};

type DbReviewImage = {
  id: string;
  review_id: string;
  image_url: string;
  created_at: string;
};

function dbToReview(r: DbReview, images: ProductReview["images"] = []): ProductReview {
  return {
    id: r.id,
    userId: r.user_id,
    orderId: r.order_id,
    productId: r.product_id,
    productName: r.product_name,
    authorName: r.author_name,
    authorEmail: r.author_email ?? null,
    authorPhotoUrl: r.author_photo_url ?? null,
    title: r.title ?? "",
    rating: r.rating,
    body: r.body,
    status: r.status as ProductReview["status"],
    verified: r.verified,
    featured: r.featured,
    pinned: r.pinned,
    homepageFeatured: r.homepage_featured ?? false,
    reviewDate: r.review_date ?? null,
    images,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function loadPublicReviewImages(reviewIds: string[]) {
  const map = new Map<string, ProductReview["images"]>();
  if (reviewIds.length === 0 || !isSupabaseConfigured()) return map;
  const { data } = await getSupabase()
    .from("review_images")
    .select("*")
    .in("review_id", reviewIds)
    .order("created_at", { ascending: true });
  for (const row of data ?? []) {
    const r = row as DbReviewImage;
    const list = map.get(r.review_id) ?? [];
    list.push({
      id: r.id,
      reviewId: r.review_id,
      imageUrl: r.image_url,
      createdAt: r.created_at,
    });
    map.set(r.review_id, list);
  }
  return map;
}

export function usePublicReviews(options?: { homepageOnly?: boolean }) {
  const [reviews, setReviews] = useState<PublicReview[]>(FALLBACK_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(FALLBACK_REVIEWS.length);
  const homepageOnly = options?.homepageOnly ?? false;

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        let query = getSupabase()
          .from("product_reviews")
          .select("*")
          .eq("status", "published");

        if (homepageOnly) {
          query = query.or("homepage_featured.eq.true,featured.eq.true");
        }

        const { data, error } = await query
          .order("pinned", { ascending: false })
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const rows = data as DbReview[];
          const imgMap = await loadPublicReviewImages(rows.map((r) => r.id));
          const mapped = rows.map((r) =>
            reviewToPublic(dbToReview(r, imgMap.get(r.id) ?? []))
          );
          setReviews(mapped);
          setTotal(data.length);
        }
      } catch {
        // Conserver les avis de démonstration
      } finally {
        setLoading(false);
      }
    };

    void load();

    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;
    try {
      channel = getSupabase()
        .channel("reviews-public")
        .on("postgres_changes", { event: "*", schema: "public", table: "product_reviews" }, () => {
          void load();
        })
        .subscribe();
    } catch {
      // Realtime indisponible
    }

    return () => {
      if (channel) {
        try {
          getSupabase().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [homepageOnly]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 5;

  return { reviews, loading, total, avg };
}

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    if (!productId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await getSupabase()
          .from("product_reviews")
          .select("*")
          .eq("product_id", productId)
          .eq("status", "published")
          .order("pinned", { ascending: false })
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (!error && data) {
          const rows = data as DbReview[];
          const imgMap = await loadPublicReviewImages(rows.map((r) => r.id));
          const sorted = sortReviews(
            rows.map((r) => dbToReview(r, imgMap.get(r.id) ?? [])),
            reviewDisplayDate
          );
          const mapped = sorted.map((r) => reviewToPublic(r));
          setReviews(mapped);
          setCount(rows.length);
          setAvg(
            rows.length > 0
              ? rows.reduce((s, r) => s + r.rating, 0) / rows.length
              : 0
          );
        }
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [productId]);

  return { reviews, loading, count, avg };
}

/* ── Before / After results ───────────────────────────────────────────── */

type DbBeforeAfter = {
  id: string;
  product_id: string;
  review_id: string | null;
  before_image_url: string;
  after_image_url: string;
  title: string | null;
  description: string;
  result_duration: string;
  result_duration_custom: string | null;
  featured: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

async function enrichPublicBeforeAfter(rows: DbBeforeAfter[]): Promise<BeforeAfterResult[]> {
  const reviewIds = rows.map((r) => r.review_id).filter(Boolean) as string[];
  const reviewMap = new Map<string, { author_name: string; rating: number; verified: boolean }>();
  if (reviewIds.length > 0 && isSupabaseConfigured()) {
    const { data } = await getSupabase()
      .from("product_reviews")
      .select("id, author_name, rating, verified, status")
      .in("id", reviewIds)
      .eq("status", "published");
    for (const rev of data ?? []) {
      reviewMap.set(rev.id as string, rev as { author_name: string; rating: number; verified: boolean });
    }
  }
  return rows
    .filter((r) => !r.review_id || reviewMap.has(r.review_id))
    .map((r) => ({
      id: r.id,
      productId: r.product_id,
      reviewId: r.review_id,
      beforeImageUrl: r.before_image_url,
      afterImageUrl: r.after_image_url,
      title: r.title ?? null,
      description: r.description,
      resultDuration: r.result_duration as ResultDuration,
      resultDurationCustom: r.result_duration_custom,
      featured: r.featured,
      pinned: r.pinned,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      authorName: r.review_id ? reviewMap.get(r.review_id)?.author_name : undefined,
      rating: r.review_id ? reviewMap.get(r.review_id)?.rating : undefined,
      verified: r.review_id ? reviewMap.get(r.review_id)?.verified : undefined,
    }));
}

export function useProductBeforeAfter(productId: string) {
  const [results, setResults] = useState<PublicBeforeAfterResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await getSupabase()
          .from("before_after_results")
          .select("*")
          .eq("product_id", productId)
          .order("pinned", { ascending: false })
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (!error && data) {
          const enriched = await enrichPublicBeforeAfter(data as DbBeforeAfter[]);
          const sorted = sortBeforeAfterResults(enriched, (r) => r.createdAt);
          setResults(sorted.map((r) => toPublicBeforeAfter(r)));
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [productId]);

  return { results, loading };
}

export function useFeaturedBeforeAfter() {
  const [results, setResults] = useState<PublicBeforeAfterResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await getSupabase()
          .from("before_after_results")
          .select("*")
          .eq("featured", true)
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12);

        if (!error && data && data.length > 0) {
          const enriched = await enrichPublicBeforeAfter(data as DbBeforeAfter[]);
          const sorted = sortBeforeAfterResults(enriched, (r) => r.createdAt);
          setResults(sorted.map((r) => toPublicBeforeAfter(r)));
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return { results, loading };
}

export async function submitProductReview(input: {
  userId: string;
  orderId: string;
  productId: string;
  productName: string;
  authorName: string;
  rating: number;
  body: string;
}) {
  const { error } = await getSupabase().from("product_reviews").insert({
    user_id: input.userId,
    order_id: input.orderId,
    product_id: input.productId,
    product_name: input.productName,
    author_name: input.authorName,
    rating: input.rating,
    body: input.body.trim(),
    status: "pending",
    verified: true,
  });
  return { error: error?.message ?? null };
}

export async function fetchUserReviewKeys(userId: string) {
  const { data } = await getSupabase()
    .from("product_reviews")
    .select("order_id, product_id, status")
    .eq("user_id", userId);
  const keys = new Set<string>();
  for (const r of data ?? []) {
    if (r.order_id && r.product_id) keys.add(`${r.order_id}:${r.product_id}`);
  }
  return keys;
}

