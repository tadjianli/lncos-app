#!/usr/bin/env node
/**
 * LN COS — Migration idempotente des images produit legacy vers variantes WebP
 *
 * Usage:
 *   npm run migrate:legacy-images
 *   npm run migrate:legacy-images -- --dry-run
 *   npm run migrate:legacy-images -- --delete-legacy
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildProductImageVariants,
  isVariantObjectPath,
  basePathFromObject,
  variantPathsForBase,
} from "./lib/product-image-pipeline.mjs";
import { createAdminClient, getSupabaseEnv, publicObjectUrl } from "./lib/supabase-admin.mjs";

const BUCKET = "product-images";
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

async function listAllFiles(supabase, bucket, prefix = "") {
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
        files.push(...(await listAllFiles(supabase, bucket, path)));
      } else {
        files.push(path);
      }
    }

    if (!data || data.length < 1000) break;
    offset += 1000;
  }
  return files;
}

function variantsExist(pathSet, basePath) {
  return variantPathsForBase(basePath).every((p) => pathSet.has(p));
}

function replaceUrl(value, oldUrl, newUrl) {
  if (!value || typeof value !== "string") return value;
  return value.trim() === oldUrl.trim() ? newUrl : value;
}

function replaceInGallery(gallery, oldUrl, newUrl) {
  if (!Array.isArray(gallery)) return gallery;
  let changed = false;
  const next = gallery.map((u) => {
    if (typeof u === "string" && u.trim() === oldUrl.trim()) {
      changed = true;
      return newUrl;
    }
    return u;
  });
  return changed ? next : gallery;
}

async function downloadObject(supabase, path) {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) throw new Error(error.message);
  return Buffer.from(await data.arrayBuffer());
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const deleteLegacy = process.argv.includes("--delete-legacy");
  const supabase = createAdminClient();
  const { url: supabaseUrl } = getSupabaseEnv();

  console.log(`\n=== Migration images legacy (${dryRun ? "DRY RUN" : "LIVE"}) ===\n`);

  const allPaths = await listAllFiles(supabase, BUCKET);
  const pathSet = new Set(allPaths);

  const sources = allPaths.filter((p) => {
    if (isVariantObjectPath(p)) return false;
    if (!IMAGE_EXT.test(p)) return false;
    const base = basePathFromObject(p);
    return !variantsExist(pathSet, base);
  });

  console.log(`Objets bucket: ${allPaths.length}`);
  console.log(`Sources legacy à migrer: ${sources.length}\n`);

  const { data: products } = await supabase
    .from("products")
    .select("id, main_image_url, image_url, gallery_images");
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, product_id, image_url");

  const migrated = [];
  const skipped = [];
  const errors = [];

  for (const sourcePath of sources) {
    const basePath = basePathFromObject(sourcePath);
    const oldPublicUrl = publicObjectUrl(supabaseUrl, BUCKET, sourcePath);

    if (variantsExist(pathSet, basePath)) {
      skipped.push({ sourcePath, reason: "variants-exist" });
      continue;
    }

    try {
      console.log(`→ ${sourcePath}`);
      const input = dryRun ? null : await downloadObject(supabase, sourcePath);
      const variantFiles = dryRun
        ? variantPathsForBase(basePath).map((relativePath, i) => ({
            variant: ["main", "gallery", "thumb"][i],
            relativePath,
            bytes: 0,
          }))
        : await buildProductImageVariants(input, basePath);

      const mainPath = `${basePath}-main.webp`;
      const newMainUrl = publicObjectUrl(supabaseUrl, BUCKET, mainPath);

      if (!dryRun) {
        for (const file of variantFiles) {
          const { error } = await supabase.storage.from(BUCKET).upload(file.relativePath, file.buffer, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: false,
          });
          if (error && !error.message.includes("already exists")) {
            throw new Error(error.message);
          }
          pathSet.add(file.relativePath);
        }

        if (deleteLegacy && sourcePath !== mainPath) {
          await supabase.storage.from(BUCKET).remove([sourcePath]);
        }
      }

      let dbUpdates = 0;

      for (const product of products ?? []) {
        const patch = {};
        if (product.main_image_url?.trim() === oldPublicUrl) {
          patch.main_image_url = newMainUrl;
        }
        if (product.image_url?.trim() === oldPublicUrl) {
          patch.image_url = newMainUrl;
        }
        const gallery = replaceInGallery(product.gallery_images, oldPublicUrl, newMainUrl);
        if (gallery !== product.gallery_images) {
          patch.gallery_images = gallery;
        }
        if (Object.keys(patch).length > 0 && !dryRun) {
          const { error } = await supabase.from("products").update(patch).eq("id", product.id);
          if (error) throw new Error(error.message);
          dbUpdates += 1;
          Object.assign(product, patch);
        } else if (Object.keys(patch).length > 0) {
          dbUpdates += 1;
        }
      }

      for (const variant of variants ?? []) {
        if (variant.image_url?.trim() === oldPublicUrl) {
          if (!dryRun) {
            const { error } = await supabase
              .from("product_variants")
              .update({ image_url: newMainUrl })
              .eq("id", variant.id);
            if (error) throw new Error(error.message);
          }
          variant.image_url = newMainUrl;
          dbUpdates += 1;
        }
      }

      migrated.push({
        sourcePath,
        basePath,
        newMainUrl,
        variantPaths: variantFiles.map((f) => f.relativePath),
        dbUpdates,
        bytes: variantFiles.reduce((s, f) => s + (f.bytes ?? 0), 0),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${message}`);
      errors.push({ sourcePath, error: message });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun,
    deleteLegacy,
    bucketObjects: allPaths.length,
    legacySourcesFound: sources.length,
    migrated: migrated.length,
    skipped: skipped.length,
    errors: errors.length,
    migratedItems: migrated,
    skippedItems: skipped,
    errorItems: errors,
  };

  const outDir = resolve(process.cwd(), "docs/reports");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "product-images-migration.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`\nMigrés: ${migrated.length} | Ignorés: ${skipped.length} | Erreurs: ${errors.length}`);
  console.log(`Rapport: ${outPath}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
