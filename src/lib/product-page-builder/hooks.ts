"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { DEFAULT_PRODUCT_PAGE_BLOCKS } from "./defaults";
import {
  dbToProductPageBlock,
  normalizeProductPageBlocks,
  productPageBlockToDb,
  snapshotBlocks,
} from "./normalize";
import type { Json } from "@/lib/database.types";
import type {
  ProductPageBlock,
  ProductPageLayoutMeta,
  ProductPageLayoutVersion,
} from "./types";

export function useProductPageLayoutAdmin() {
  const [published, setPublished] = useState<ProductPageBlock[]>(DEFAULT_PRODUCT_PAGE_BLOCKS);
  const [draft, setDraft] = useState<ProductPageBlock[] | null>(null);
  const [meta, setMeta] = useState<ProductPageLayoutMeta>({
    publishedVersion: 1,
    updatedAt: new Date().toISOString(),
  });
  const [versions, setVersions] = useState<ProductPageLayoutVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setPublished(DEFAULT_PRODUCT_PAGE_BLOCKS.map((b) => ({ ...b })));
      setDraft(null);
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    const [{ data: rows }, { data: metaRow }, { data: versionRows }] = await Promise.all([
      supabase.from("product_page_blocks").select("*").order("zone").order("position"),
      supabase.from("product_page_layout_meta").select("*").eq("id", "default").maybeSingle(),
      supabase
        .from("product_page_layout_versions")
        .select("*")
        .order("version_number", { ascending: false })
        .limit(20),
    ]);

    const pub =
      rows && rows.length > 0
        ? rows.filter((r) => !r.is_draft).map((r) => dbToProductPageBlock(r))
        : DEFAULT_PRODUCT_PAGE_BLOCKS.map((b) => ({ ...b }));
    setPublished(pub.length > 0 ? pub : DEFAULT_PRODUCT_PAGE_BLOCKS.map((b) => ({ ...b })));

    const draftRows = rows?.filter((r) => r.is_draft) ?? [];
    setDraft(
      draftRows.length > 0 ? draftRows.map((r) => dbToProductPageBlock(r)) : null
    );

    if (metaRow) {
      setMeta({
        publishedVersion: metaRow.published_version,
        updatedAt: metaRow.updated_at,
      });
    }

    setVersions(
      (versionRows ?? []).map((v) => ({
        id: v.id,
        versionNumber: v.version_number,
        blocks: normalizeProductPageBlocks(v.blocks),
        changeNote: v.change_note,
        createdAt: v.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();
    if (!isSupabaseConfigured()) return;
    const channel = getSupabase()
      .channel("product-page-blocks-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_page_blocks" },
        () => { void load(); }
      )
      .subscribe();
    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [load]);

  const persistDraft = useCallback(async (blocks: ProductPageBlock[]) => {
    if (!isSupabaseConfigured()) {
      setDraft(blocks);
      return { error: null };
    }
    const supabase = getSupabase();
    const { error: delErr } = await supabase
      .from("product_page_blocks")
      .delete()
      .eq("is_draft", true);
    if (delErr) return { error: delErr.message };

    const main = blocks.filter((b) => b.zone === "main");
    const sticky = blocks.filter((b) => b.zone === "sticky");
    const ordered = [...main, ...sticky];
    const rows = ordered.map((b, i) => productPageBlockToDb(b, true, i));
    const { error: insErr } = await supabase.from("product_page_blocks").insert(rows);
    if (insErr) return { error: insErr.message };
    setDraft(blocks);
    return { error: null };
  }, []);

  const beginDraft = useCallback(
    async (blocks: ProductPageBlock[]) => {
      const next = snapshotBlocks(blocks);
      return persistDraft(next);
    },
    [persistDraft]
  );

  const saveDraft = useCallback(
    async (blocks: ProductPageBlock[]) => persistDraft(blocks),
    [persistDraft]
  );

  const publishDraft = useCallback(
    async (blocks: ProductPageBlock[], changeNote?: string) => {
      const scoped = snapshotBlocks(blocks);
      if (!isSupabaseConfigured()) {
        setPublished(scoped);
        setDraft(scoped);
        setMeta((m) => ({
          publishedVersion: m.publishedVersion + 1,
          updatedAt: new Date().toISOString(),
        }));
        return { error: null };
      }

      const supabase = getSupabase();
      const { error: delPubErr } = await supabase
        .from("product_page_blocks")
        .delete()
        .eq("is_draft", false);
      if (delPubErr) return { error: delPubErr.message };

      const main = scoped.filter((b) => b.zone === "main");
      const sticky = scoped.filter((b) => b.zone === "sticky");
      const ordered = [...main, ...sticky];
      const pubRows = ordered.map((b, i) => productPageBlockToDb(b, false, i));
      const { error: pubErr } = await supabase.from("product_page_blocks").insert(pubRows);
      if (pubErr) return { error: pubErr.message };

      const { data: metaRow } = await supabase
        .from("product_page_layout_meta")
        .select("published_version")
        .eq("id", "default")
        .maybeSingle();
      const nextVersion = (metaRow?.published_version ?? 0) + 1;

      await supabase.from("product_page_layout_versions").insert({
        version_number: nextVersion,
        blocks: scoped as unknown as Json,
        change_note: changeNote?.trim() || null,
      });

      await supabase
        .from("product_page_layout_meta")
        .upsert({
          id: "default",
          published_version: nextVersion,
          updated_at: new Date().toISOString(),
        });

      const { error: delDraftErr } = await supabase
        .from("product_page_blocks")
        .delete()
        .eq("is_draft", true);
      if (delDraftErr) return { error: delDraftErr.message };

      const draftRows = ordered.map((b, i) => productPageBlockToDb(b, true, i));
      await supabase.from("product_page_blocks").insert(draftRows);

      setPublished(scoped);
      setDraft(scoped);
      setMeta({ publishedVersion: nextVersion, updatedAt: new Date().toISOString() });
      void load();
      return { error: null };
    },
    [load]
  );

  const discardDraft = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setDraft(null);
      return { error: null };
    }
    const supabase = getSupabase();
    const { error: delErr } = await supabase
      .from("product_page_blocks")
      .delete()
      .eq("is_draft", true);
    if (delErr) return { error: delErr.message };

    const { data } = await supabase
      .from("product_page_blocks")
      .select("*")
      .eq("is_draft", false)
      .order("position");

    if (data && data.length > 0) {
      const restored = data.map((r) => dbToProductPageBlock(r));
      const rows = restored.map((b, i) => productPageBlockToDb(b, true, i));
      await supabase.from("product_page_blocks").insert(rows);
      setDraft(restored);
    } else {
      setDraft(null);
    }
    return { error: null };
  }, []);

  const restoreVersion = useCallback(
    async (version: ProductPageLayoutVersion) => {
      const blocks = snapshotBlocks(version.blocks);
      setDraft(blocks);
      return saveDraft(blocks);
    },
    [saveDraft]
  );

  return {
    published,
    draft,
    meta,
    versions,
    loading,
    beginDraft,
    saveDraft,
    publishDraft,
    discardDraft,
    restoreVersion,
    reload: load,
  };
}

export function useProductPageLayoutPublic() {
  const [blocks, setBlocks] = useState<ProductPageBlock[]>(DEFAULT_PRODUCT_PAGE_BLOCKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured()) {
        setBlocks(DEFAULT_PRODUCT_PAGE_BLOCKS.map((b) => ({ ...b })));
        setLoading(false);
        return;
      }
      try {
        const preview =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("preview") === "1";
        const { data, error } = await getSupabase()
          .from("product_page_blocks")
          .select("*")
          .eq("is_draft", preview)
          .order("position");

        if (!error && data && data.length > 0) {
          setBlocks(data.map((r) => dbToProductPageBlock(r)));
        } else if (!preview) {
          const { data: pub } = await getSupabase()
            .from("product_page_blocks")
            .select("*")
            .eq("is_draft", false)
            .order("position");
          if (pub && pub.length > 0) {
            setBlocks(pub.map((r) => dbToProductPageBlock(r)));
          } else {
            setBlocks(DEFAULT_PRODUCT_PAGE_BLOCKS.map((b) => ({ ...b })));
          }
        } else {
          setBlocks(DEFAULT_PRODUCT_PAGE_BLOCKS.map((b) => ({ ...b })));
        }
      } catch {
        setBlocks(DEFAULT_PRODUCT_PAGE_BLOCKS.map((b) => ({ ...b })));
      } finally {
        setLoading(false);
      }
    };

    void load();

    if (!isSupabaseConfigured()) return;
    const channel = getSupabase()
      .channel("product-page-blocks-public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_page_blocks" },
        () => { void load(); }
      )
      .subscribe();
    return () => {
      getSupabase().removeChannel(channel);
    };
  }, []);

  return { blocks, loading };
}
