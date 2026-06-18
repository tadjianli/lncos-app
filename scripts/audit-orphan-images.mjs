#!/usr/bin/env node
/**
 * LN COS — Audit des images orphelines dans le bucket product-images
 *
 * Usage: npm run audit:orphan-images
 * Rapport: docs/reports/orphan-images.json
 *
 * Ne supprime aucun fichier.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createAdminClient, getSupabaseEnv, publicObjectUrl } from "./lib/supabase-admin.mjs";
import {
  PRODUCT_IMAGES_BUCKET,
  fetchUsedProductImagePaths,
  formatKb,
} from "./lib/product-image-paths.mjs";

const BUCKET = PRODUCT_IMAGES_BUCKET;
const OUT_PATH = resolve(process.cwd(), "docs/reports/orphan-images.json");

async function listAllFilesWithMeta(supabase, bucket, prefix = "") {
  const files = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(error.message);

    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id == null) {
        files.push(...(await listAllFilesWithMeta(supabase, bucket, path)));
      } else {
        files.push({
          path,
          bytes: item.metadata?.size ?? null,
          createdAt: item.created_at ?? item.updated_at ?? null,
        });
      }
    }

    if (!data || data.length < 1000) break;
    offset += 1000;
  }

  return files;
}

async function main() {
  const supabase = createAdminClient();
  const { url: supabaseUrl } = getSupabaseEnv();

  console.log("\n=== LN COS — Audit images orphelines ===\n");

  const bucketFiles = await listAllFilesWithMeta(supabase, BUCKET);
  console.log(`Fichiers bucket: ${bucketFiles.length}`);

  const usedPaths = await fetchUsedProductImagePaths(supabase, supabaseUrl);
  console.log(`Chemins référencés (avec variantes dérivées): ${usedPaths.size}`);

  const files = bucketFiles.map((file) => {
    const used = usedPaths.has(file.path);
    return {
      path: file.path,
      url: publicObjectUrl(supabaseUrl, BUCKET, file.path),
      bytes: file.bytes,
      createdAt: file.createdAt,
      used,
    };
  });

  const orphans = files.filter((f) => !f.used);
  const orphanBytes = orphans.reduce((sum, f) => sum + (f.bytes ?? 0), 0);
  const totalBytes = files.reduce((sum, f) => sum + (f.bytes ?? 0), 0);

  const report = {
    generatedAt: new Date().toISOString(),
    bucket: BUCKET,
    summary: {
      totalFiles: files.length,
      usedFiles: files.length - orphans.length,
      orphanFiles: orphans.length,
      totalBytes,
      orphanBytes,
      usedBytes: totalBytes - orphanBytes,
    },
    files,
    orphans,
  };

  mkdirSync(resolve(process.cwd(), "docs/reports"), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

  console.log(`Utilisées: ${report.summary.usedFiles}`);
  console.log(`Orphelines: ${report.summary.orphanFiles} (${formatKb(orphanBytes)})`);
  console.log(`Rapport: ${OUT_PATH}\n`);

  if (orphans.length > 0) {
    console.log("Top orphelines (par taille):");
    for (const row of [...orphans].sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0)).slice(0, 10)) {
      console.log(`  • ${row.path} — ${formatKb(row.bytes)}`);
    }
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
