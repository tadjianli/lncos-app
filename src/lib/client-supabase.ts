"use client";
/**
 * LN COS — Client-facing Supabase hooks
 * Maps DB column names → UI field names. Falls back to static data on error.
 */

import { useState, useEffect } from "react";
import { getSupabase } from "./supabase";
import type { Product, Category } from "./data";
import { products as STATIC_PRODUCTS, categories as STATIC_CATEGORIES } from "./data";

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
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase()
      .from("products")
      .select("id,name,cat,price,old_price,ml,rating,reviews,tag,stock,variants,description,ingredients,active")
      .eq("active", true)
      .order("name")
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
