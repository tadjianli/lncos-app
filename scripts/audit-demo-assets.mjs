#!/usr/bin/env node
/**
 * LN COS — Audit des assets image locaux (public/ + src/)
 * Rapport: docs/reports/demo-assets.json
 */

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const SCAN_DIRS = ["public", "src"];
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".avif"]);
const OUT_PATH = join(ROOT, "docs/reports/demo-assets.json");

const SKIP_REF_DIRS = ["node_modules", ".next", "docs/ui-screenshots", "docs/reports"];

function walkImages(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkImages(full, base));
      continue;
    }
    const ext = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const st = statSync(full);
    out.push({
      path: relative(ROOT, full).split(sep).join("/"),
      bytes: st.size,
      createdAt: st.birthtime.toISOString(),
      modifiedAt: st.mtime.toISOString(),
    });
  }
  return out;
}

function classify(file) {
  const p = file.path;
  const name = p.split("/").pop() ?? p;

  if (p.startsWith("src/app/icon.png") || p.startsWith("src/app/apple-icon.png") || p.startsWith("src/app/favicon.ico")) {
    return { category: "nextjs_app_icon", label: "Icône Next.js App Router (metadata automatique)" };
  }
  if (/^public\/(vercel|next|file|window|globe)\.svg$/i.test(p)) {
    return { category: "nextjs_starter", label: "SVG template Next.js (non utilisé)" };
  }
  if (p === "public/assets/logo lncos.jpg") {
    return { category: "duplicate", label: "Doublon de logo-lncos.jpg (espace dans le nom)" };
  }
  if (p === "public/assets/payment-methods.png" || p === "public/assets/Moyens de paiement.png") {
    return { category: "demo_payment", label: "Badge moyens de paiement — jamais câblé en UI" };
  }
  if (p === "public/assets/hero.png") {
    return { category: "demo_editorial", label: "Visuel hero éditorial — non référencé" };
  }
  if (p.includes("/assets/products/cils-magnetique/")) {
    return { category: "demo_product_gallery", label: "Galerie démo cils magnétiques (upload admin prévu)" };
  }
  if (/^public\/assets\/products\/[^/]+\.(png|jpg|jpeg|webp)$/i.test(p)) {
    return { category: "demo_product_ai", label: "Mock produit IA / seed démarrage (data.js sans imageUrl)" };
  }
  if (
    p === "public/assets/logo-lncos.jpg" ||
    p === "public/favicon.png" ||
    p === "public/favicon.ico" ||
    p === "public/assets/favicon-32.png" ||
    p === "public/assets/icon-192.png" ||
    p === "public/assets/icon-512.png" ||
    p === "public/assets/apple-touch-icon.png"
  ) {
    return { category: "brand", label: "Logo / favicon / PWA — branding actif" };
  }
  return { category: "other", label: "Asset local" };
}

function findReferences(file) {
  const refs = new Set();
  const rel = file.path;
  const publicUrl = rel.startsWith("public/") ? `/${rel.slice("public".length)}` : null;
  const basename = rel.split("/").pop() ?? rel;

  const patterns = [rel, publicUrl, basename].filter(Boolean);
  for (const pattern of patterns) {
    if (!pattern) continue;
    try {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const cmd = `rg -l --glob '!node_modules/**' --glob '!.next/**' --glob '!docs/ui-screenshots/**' --glob '!docs/reports/**' '${escaped}' '${ROOT}' 2>/dev/null || true`;
      const out = execSync(cmd, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }).trim();
      for (const hit of out.split("\n").filter(Boolean)) {
        const relHit = relative(ROOT, hit).split(sep).join("/");
        if (relHit !== rel) refs.add(relHit);
      }
    } catch {
      /* ignore */
    }
  }

  return [...refs].sort();
}

function canDeleteSafely(file, refs, category) {
  if (refs.length > 0) return { safe: false, reason: `Référencé par ${refs.length} fichier(s)` };

  const deletableCategories = new Set([
    "nextjs_starter",
    "duplicate",
    "demo_payment",
    "demo_editorial",
    "demo_product_gallery",
    "demo_product_ai",
  ]);

  if (deletableCategories.has(category)) {
    return { safe: true, reason: "Aucune référence code — asset démo ou doublon" };
  }

  if (category === "brand" && file.path === "public/favicon.ico") {
    return { safe: true, reason: "Doublon binaire de favicon.png (branding utilise .png)" };
  }

  if (category === "nextjs_app_icon") {
    return { safe: false, reason: "Requis par Next.js App Router (src/app/)" };
  }

  return { safe: false, reason: "Non référencé mais catégorie à valider manuellement" };
}

function main() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    const abs = join(ROOT, dir);
    try {
      files.push(...walkImages(abs));
    } catch {
      /* missing dir */
    }
  }

  const enriched = files.map((file) => {
    const { category, label } = classify(file);
    const references = findReferences(file);
    const deletion = canDeleteSafely(file, references, category);
    return {
      path: file.path,
      bytes: file.bytes,
      createdAt: file.createdAt,
      modifiedAt: file.modifiedAt,
      category,
      categoryLabel: label,
      used: references.length > 0 || category === "nextjs_app_icon" || category === "brand",
      references,
      canDeleteSafely: deletion.safe,
      deleteReason: deletion.reason,
    };
  });

  const safeToDelete = enriched.filter((f) => f.canDeleteSafely);
  const usedFiles = enriched.filter((f) => f.used);
  const unusedFiles = enriched.filter((f) => !f.used);

  const report = {
    generatedAt: new Date().toISOString(),
    scannedDirectories: SCAN_DIRS,
    summary: {
      totalFiles: enriched.length,
      totalBytes: enriched.reduce((s, f) => s + f.bytes, 0),
      usedFiles: usedFiles.length,
      unusedFiles: unusedFiles.length,
      safeToDeleteCount: safeToDelete.length,
      safeToDeleteBytes: safeToDelete.reduce((s, f) => s + f.bytes, 0),
      byCategory: Object.fromEntries(
        [...new Set(enriched.map((f) => f.category))].map((cat) => [
          cat,
          {
            count: enriched.filter((f) => f.category === cat).length,
            bytes: enriched.filter((f) => f.category === cat).reduce((s, f) => s + f.bytes, 0),
          },
        ])
      ),
    },
    safeToDelete: safeToDelete.map(({ path, bytes, category, categoryLabel, deleteReason }) => ({
      path,
      bytes,
      category,
      categoryLabel,
      reason: deleteReason,
    })),
    files: enriched,
  };

  mkdirSync(join(ROOT, "docs/reports"), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

  console.log("\n=== LN COS — Audit assets démo (public + src) ===\n");
  console.log(`Fichiers: ${report.summary.totalFiles}`);
  console.log(`Utilisés: ${report.summary.usedFiles} | Non utilisés: ${report.summary.unusedFiles}`);
  console.log(
    `Supprimables sans impact: ${report.summary.safeToDeleteCount} (${(report.summary.safeToDeleteBytes / 1024 / 1024).toFixed(2)} Mo)`
  );
  console.log(`Rapport: ${OUT_PATH}\n`);
}

main();
