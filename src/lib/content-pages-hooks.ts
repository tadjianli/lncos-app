/**
 * LN COS — Hooks admin & public pour pages contenu
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { BlogArticle } from "./contracts/blog";
import { emptyBlogArticle } from "./contracts/blog";
import {
  blogArticleToDb,
  blogCategoryToDb,
  blogPageSettingsToDb,
  dbToBlogArticle,
  dbToBlogCategory,
  dbToBlogPageSettings,
  dbToFlashSalesSettings,
  dbToSocialLink,
  dbToSocialPageSettings,
  flashSalesSettingsToDb,
  socialLinkToDb,
  socialPageSettingsToDb,
  staticBlogArticles,
  staticBlogCategories,
  staticSocialLinks,
  slugifyTitle,
  type AdminBlogCategory,
  type AdminSocialLink,
  type BlogPageSettings,
  type DbBlogArticle,
  type DbBlogCategory,
  type DbBlogPageSettings,
  type DbFlashSalesSettings,
  type DbSocialNetworkLink,
  type DbSocialPageSettings,
  type FlashSalesSettings,
  type SocialPageSettings,
  DEFAULT_BLOG_PAGE_SETTINGS,
  DEFAULT_FLASH_SALES_SETTINGS,
  DEFAULT_SOCIAL_PAGE_SETTINGS,
} from "./content-pages";

/* ── Admin: Flash sales settings ─────────────────────────────────────────── */

export function useAdminFlashSalesSettings() {
  const [settings, setSettings] = useState<FlashSalesSettings>(DEFAULT_FLASH_SALES_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("flash_sales_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    setSettings(dbToFlashSalesSettings(data as DbFlashSalesSettings | null));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (next: FlashSalesSettings) => {
    setSaving(true);
    const { error } = await getSupabase()
      .from("flash_sales_settings")
      .upsert({ id: "default", ...flashSalesSettingsToDb(next) });
    setSaving(false);
    if (!error) setSettings(next);
    return { error: error?.message ?? null };
  }, []);

  return { settings, loading, saving, save, setSettings };
}

/* ── Admin: Blog ─────────────────────────────────────────────────────────── */

export function useAdminBlogContent() {
  const [pageSettings, setPageSettings] = useState<BlogPageSettings>(DEFAULT_BLOG_PAGE_SETTINGS);
  const [categories, setCategories] = useState<AdminBlogCategory[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    const [pageRes, catRes, artRes] = await Promise.all([
      supabase.from("blog_page_settings").select("*").eq("id", "default").maybeSingle(),
      supabase.from("blog_categories").select("*").order("position"),
      supabase.from("blog_articles").select("*").order("position"),
    ]);
    setPageSettings(dbToBlogPageSettings(pageRes.data as DbBlogPageSettings | null));
    setCategories(
      catRes.data?.length
        ? (catRes.data as DbBlogCategory[]).map(dbToBlogCategory)
        : staticBlogCategories()
    );
    setArticles(
      artRes.data?.length
        ? (artRes.data as DbBlogArticle[]).map(dbToBlogArticle)
        : staticBlogArticles()
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const channel = getSupabase()
      .channel("blog-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_categories" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_articles" }, load)
      .subscribe();
    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [load]);

  const savePageSettings = useCallback(async (next: BlogPageSettings) => {
    setSaving(true);
    const { error } = await getSupabase()
      .from("blog_page_settings")
      .upsert({ id: "default", ...blogPageSettingsToDb(next) });
    setSaving(false);
    if (!error) setPageSettings(next);
    return { error: error?.message ?? null };
  }, []);

  const upsertCategory = useCallback(async (cat: AdminBlogCategory) => {
    const { error } = await getSupabase()
      .from("blog_categories")
      .upsert(blogCategoryToDb(cat));
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [load]);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await getSupabase().from("blog_categories").delete().eq("id", id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [load]);

  const upsertArticle = useCallback(async (article: BlogArticle) => {
    const { error } = await getSupabase()
      .from("blog_articles")
      .upsert(blogArticleToDb(article));
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [load]);

  const insertArticle = useCallback(
    async (partial: Omit<BlogArticle, "id" | "slug"> & { slug?: string }) => {
      const id = `blog-${Date.now()}`;
      const slug = partial.slug ?? slugifyTitle(partial.title);
      const article: BlogArticle = emptyBlogArticle({ ...partial, id, slug });
      return upsertArticle(article);
    },
    [upsertArticle]
  );

  const deleteArticle = useCallback(async (id: string) => {
    const { error } = await getSupabase().from("blog_articles").delete().eq("id", id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [load]);

  return {
    pageSettings,
    categories,
    articles,
    loading,
    saving,
    setPageSettings,
    savePageSettings,
    upsertCategory,
    deleteCategory,
    upsertArticle,
    insertArticle,
    deleteArticle,
    reload: load,
  };
}

/* ── Admin: Social ─────────────────────────────────────────────────────────── */

export function useAdminSocialContent() {
  const [pageSettings, setPageSettings] = useState<SocialPageSettings>(DEFAULT_SOCIAL_PAGE_SETTINGS);
  const [links, setLinks] = useState<AdminSocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    const [pageRes, linksRes] = await Promise.all([
      supabase.from("social_page_settings").select("*").eq("id", "default").maybeSingle(),
      supabase.from("social_network_links").select("*").order("position"),
    ]);
    setPageSettings(dbToSocialPageSettings(pageRes.data as DbSocialPageSettings | null));
    setLinks(
      linksRes.data?.length
        ? (linksRes.data as DbSocialNetworkLink[]).map(dbToSocialLink)
        : staticSocialLinks()
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const channel = getSupabase()
      .channel("social-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_network_links" }, load)
      .subscribe();
    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [load]);

  const savePageSettings = useCallback(async (next: SocialPageSettings) => {
    setSaving(true);
    const { error } = await getSupabase()
      .from("social_page_settings")
      .upsert({ id: "default", ...socialPageSettingsToDb(next) });
    setSaving(false);
    if (!error) setPageSettings(next);
    return { error: error?.message ?? null };
  }, []);

  const upsertLink = useCallback(async (link: AdminSocialLink) => {
    const { error } = await getSupabase()
      .from("social_network_links")
      .upsert(socialLinkToDb(link));
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [load]);

  const deleteLink = useCallback(async (id: string) => {
    const { error } = await getSupabase().from("social_network_links").delete().eq("id", id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [load]);

  return {
    pageSettings,
    links,
    loading,
    saving,
    setPageSettings,
    savePageSettings,
    upsertLink,
    deleteLink,
    reload: load,
  };
}

/* ── Public hooks ──────────────────────────────────────────────────────────── */

export function usePublicFlashSalesSettings() {
  const [settings, setSettings] = useState<FlashSalesSettings>(DEFAULT_FLASH_SALES_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data } = await getSupabase()
        .from("flash_sales_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();
      setSettings(dbToFlashSalesSettings(data as DbFlashSalesSettings | null));
      setLoading(false);
    };
    void load();
  }, []);

  return { settings, loading };
}

export function usePublicBlogContent() {
  const [pageSettings, setPageSettings] = useState<BlogPageSettings>(DEFAULT_BLOG_PAGE_SETTINGS);
  const [categories, setCategories] = useState<AdminBlogCategory[]>(staticBlogCategories());
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const supabase = getSupabase();
      const [pageRes, catRes, artRes] = await Promise.all([
        supabase.from("blog_page_settings").select("*").eq("id", "default").maybeSingle(),
        supabase.from("blog_categories").select("*").eq("enabled", true).order("position"),
        supabase.from("blog_articles").select("*").eq("published", true).order("published_at", { ascending: false }),
      ]);
      if (pageRes.data) setPageSettings(dbToBlogPageSettings(pageRes.data as DbBlogPageSettings));
      if (catRes.data?.length) {
        setCategories((catRes.data as DbBlogCategory[]).map(dbToBlogCategory));
      }
      if (artRes.data?.length) {
        setArticles((artRes.data as DbBlogArticle[]).map(dbToBlogArticle));
      }
      setLoading(false);
    };
    void load();
  }, []);

  return { pageSettings, categories, articles, loading };
}

export function usePublicSocialContent() {
  const [pageSettings, setPageSettings] = useState<SocialPageSettings>(DEFAULT_SOCIAL_PAGE_SETTINGS);
  const [links, setLinks] = useState<AdminSocialLink[]>(
    staticSocialLinks().filter((l) => l.enabled)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const supabase = getSupabase();
      const [pageRes, linksRes] = await Promise.all([
        supabase.from("social_page_settings").select("*").eq("id", "default").maybeSingle(),
        supabase.from("social_network_links").select("*").eq("enabled", true).order("position"),
      ]);
      if (pageRes.data) setPageSettings(dbToSocialPageSettings(pageRes.data as DbSocialPageSettings));
      if (linksRes.data?.length) {
        setLinks((linksRes.data as DbSocialNetworkLink[]).map(dbToSocialLink));
      }
      setLoading(false);
    };
    void load();
  }, []);

  return { pageSettings, links, loading };
}
