#!/usr/bin/env node
/**
 * LN COS — Suppression des images orphelines (bucket product-images)
 *
 * Usage:
 *   npm run cleanup:orphan-images              # aperçu (sans suppression)
 *   npm run cleanup:orphan-images -- --confirm # suppression effective
 *
 * Prérequis: npm run audit:orphan-images
 * Rapport: docs/reports/orphan-images-cleanup.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createAdminClient, getSupabaseEnv } from "./lib/supabase-admin.mjs";
import {
  PRODUCT_IMAGES_BUCKET,
  fetchUsedProductImagePaths,
  formatKb,
  listAllBucketFilePaths,
} from "./lib/product-image-paths.mjs";

const AUDIT_PATH = resolve(process.cwd(), "docs/reports/orphan-images.json");
const OUT_PATH = resolve(process.cwd(), "docs/reports/orphan-images-cleanup.json");
const DELETE_BATCH_SIZE = 50;

function readAuditReport() {
  if (!existsSync(AUDIT_PATH)) {
    console.error(
      `Rapport introuvable: ${AUDIT_PATH}\nExécutez d'abord: npm run audit:orphan-images`
    );
    process.exit(1);
  }

  const raw = readFileSync(AUDIT_PATH, "utf8");
  const report = JSON.parse(raw);

  if (!Array.isArray(report.files)) {
    console.error("Format invalide: le rapport doit contenir un tableau `files`.");
    process.exit(1);
  }

  return report;
}

function chunk(array, size) {
  const batches = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

async function main() {
  const confirm = process.argv.includes("--confirm");
  const supabase = createAdminClient();
  const { url: supabaseUrl } = getSupabaseEnv();

  console.log("\n=== LN COS — Nettoyage images orphelines ===\n");

  const auditReport = readAuditReport();
  const candidates = auditReport.files.filter((file) => file.used === false);

  console.log(`Rapport source: ${AUDIT_PATH}`);
  console.log(`Généré le: ${auditReport.generatedAt ?? "—"}`);
  console.log(`Candidats (used=false): ${candidates.length}`);

  const usedPaths = await fetchUsedProductImagePaths(supabase, supabaseUrl);

  const ignored = [];
  const verifiedOrphans = [];

  for (const file of candidates) {
    if (usedPaths.has(file.path)) {
      ignored.push({
        path: file.path,
        bytes: file.bytes ?? null,
        reason: "referenced_in_db",
      });
      continue;
    }
    verifiedOrphans.push(file);
  }

  const totalBytes = verifiedOrphans.reduce((sum, file) => sum + (file.bytes ?? 0), 0);

  console.log(`Ignorés (référencés en base): ${ignored.length}`);
  console.log(`À supprimer (vérifiés): ${verifiedOrphans.length} (${formatKb(totalBytes)})`);

  if (verifiedOrphans.length === 0) {
    console.log("\nRien à supprimer.\n");
    writeCleanupReport({
      confirm,
      auditReport,
      summary: {
        candidatesFromReport: candidates.length,
        verifiedOrphans: 0,
        ignoredCount: ignored.length,
        deletedCount: 0,
        deletedBytes: 0,
        errorCount: 0,
      },
      deleted: [],
      ignored,
      errors: [],
    });
    return;
  }

  if (!confirm) {
    console.log("\nMode aperçu — aucune suppression.");
    console.log("Pour supprimer: npm run cleanup:orphan-images -- --confirm\n");
    writeCleanupReport({
      confirm: false,
      auditReport,
      summary: {
        candidatesFromReport: candidates.length,
        verifiedOrphans: verifiedOrphans.length,
        ignoredCount: ignored.length,
        deletedCount: 0,
        deletedBytes: 0,
        errorCount: 0,
        pendingBytes: totalBytes,
      },
      deleted: [],
      ignored,
      errors: [],
      pending: verifiedOrphans.map((file) => ({
        path: file.path,
        bytes: file.bytes ?? null,
      })),
    });
    return;
  }

  const bucketPaths = new Set(
    await listAllBucketFilePaths(supabase, PRODUCT_IMAGES_BUCKET)
  );

  const toDelete = [];
  for (const file of verifiedOrphans) {
    if (!bucketPaths.has(file.path)) {
      ignored.push({
        path: file.path,
        bytes: file.bytes ?? null,
        reason: "already_missing",
      });
      continue;
    }
    toDelete.push(file);
  }

  const deleted = [];
  const errors = [];

  for (const batch of chunk(toDelete, DELETE_BATCH_SIZE)) {
    const paths = batch.map((file) => file.path);
    const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);

    if (error) {
      for (const file of batch) {
        const { error: singleError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .remove([file.path]);

        if (singleError) {
          if (/not found|does not exist|404/i.test(singleError.message)) {
            ignored.push({
              path: file.path,
              bytes: file.bytes ?? null,
              reason: "already_missing",
            });
          } else {
            errors.push({ path: file.path, message: singleError.message });
          }
        } else {
          deleted.push({
            path: file.path,
            bytes: file.bytes ?? null,
          });
        }
      }
      continue;
    }

    for (const file of batch) {
      deleted.push({
        path: file.path,
        bytes: file.bytes ?? null,
      });
    }
  }

  const deletedBytes = deleted.reduce((sum, file) => sum + (file.bytes ?? 0), 0);

  console.log(`\nSupprimés: ${deleted.length} (${formatKb(deletedBytes)})`);
  console.log(`Ignorés: ${ignored.length}`);
  console.log(`Erreurs: ${errors.length}`);
  console.log(`Rapport: ${OUT_PATH}\n`);

  writeCleanupReport({
    confirm: true,
    auditReport,
    summary: {
      candidatesFromReport: candidates.length,
      verifiedOrphans: verifiedOrphans.length,
      ignoredCount: ignored.length,
      deletedCount: deleted.length,
      deletedBytes,
      errorCount: errors.length,
    },
    deleted,
    ignored,
    errors,
  });
}

function writeCleanupReport(payload) {
  const report = {
    generatedAt: new Date().toISOString(),
    confirmed: payload.confirm,
    sourceReport: {
      path: AUDIT_PATH,
      generatedAt: payload.auditReport.generatedAt ?? null,
      bucket: payload.auditReport.bucket ?? PRODUCT_IMAGES_BUCKET,
    },
    summary: payload.summary,
    deleted: payload.deleted,
    ignored: payload.ignored,
    errors: payload.errors,
    ...(payload.pending ? { pending: payload.pending } : {}),
  };

  mkdirSync(resolve(process.cwd(), "docs/reports"), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
