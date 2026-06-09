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
import { products as STATIC_PRODUCTS, categories as STATIC_CATEGORIES } from "./data";
import type { ProductReview } from "./reviews";
import { FALLBACK_REVIEWS, reviewToPublic, type PublicReview } from "./reviews";

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
  ingredients: string[];
  active: boolean;
}): Product {
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
    variants: row.variants ?? [],
    desc: row.description,
    ingredients: row.ingredients ?? [],
  };
}

/* ── usePublicProducts ───────────────────────────────────────── */
export function usePublicProducts() {
  const [products, setProducts] = useState<Product[]>([...STATIC_PRODUCTS].reverse());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    getSupabase()
      .from("products")
      .select("id,name,cat,price,old_price,ml,rating,reviews,tag,stock,variants,description,ingredients,active,created_at")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setProducts(data.map(mapProduct));
        }
        // On error or empty table, keep static fallback already set as initial state
        setLoading(false);
      });
  }, []);

  const byId = (id: string) => products.find((p) => p.id === id) ?? null;

  return { products, loading, byId };
}

/* ── usePublicCategories ─────────────────────────────────────── */
export function usePublicCategories() {
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    getSupabase()
      .from("categories")
      .select("id,name,count")
      .order("position")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setCategories(data as Category[]);
        }
      });
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
      setLoading(false);
    };

    load();

    const channel = getSupabase()
      .channel(`home-sections-public-${pageSlug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "home_sections" },
        load
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
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

/* ── Product reviews ─────────────────────────────────────────── */

type DbReview = {
  id: string;
  user_id: string | null;
  order_id: string | null;
  product_id: string | null;
  product_name: string;
  author_name: string;
  rating: number;
  body: string;
  status: string;
  verified: boolean;
  featured: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

function dbToReview(r: DbReview): ProductReview {
  return {
    id: r.id,
    userId: r.user_id,
    orderId: r.order_id,
    productId: r.product_id,
    productName: r.product_name,
    authorName: r.author_name,
    rating: r.rating,
    body: r.body,
    status: r.status as ProductReview["status"],
    verified: r.verified,
    featured: r.featured,
    pinned: r.pinned,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function usePublicReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>(FALLBACK_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(FALLBACK_REVIEWS.length);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data, error } = await getSupabase()
        .from("product_reviews")
        .select("*")
        .eq("status", "published")
        .order("pinned", { ascending: false })
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((r) => reviewToPublic(dbToReview(r as DbReview)));
        setReviews(mapped);
        setTotal(data.length);
      }
      setLoading(false);
    };

    load();
    const channel = getSupabase()
      .channel("reviews-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_reviews" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, []);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 5;

  return { reviews, loading, total, avg };
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

