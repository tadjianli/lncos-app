import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCT_IMAGE_TARGETS,
  variantFromUrl,
} from "./lib/product-image-pipeline.mjs";
import { createAdminClient } from "./lib/supabase-admin.mjs";

const BUCKET = "product-images";
const MOBILE_4G_KBPS = 1500; // ~1,5 Mbit/s conservateur (4G réel variable)

function formatKb(bytes) {
  if (bytes == null) return "—";
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function headBytes(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) return { bytes: null, error: `HTTP ${res.status}` };
    const len = res.headers.get("content-length");
    return { bytes: len ? Number(len) : null, error: len ? null : "no content-length" };
  } catch (err) {
    return { bytes: null, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

function collectProductUrls(product, variants) {
  const urls = new Set();
  const add = (u) => {
    if (u && typeof u === "string" && u.startsWith("http")) urls.add(u.trim());
  };
  add(product.main_image_url);
  add(product.image_url);
  for (const g of product.gallery_images ?? []) add(g);
  for (const v of variants) add(v.image_url);
  return [...urls];
}

function targetForVariant(variant) {
  if (variant === "main") return PRODUCT_IMAGE_TARGETS.main.targetBytes;
  if (variant === "gallery") return PRODUCT_IMAGE_TARGETS.gallery.targetBytes;
  if (variant === "thumb") return PRODUCT_IMAGE_TARGETS.thumb.targetBytes;
  return PRODUCT_IMAGE_TARGETS.main.targetBytes;
}

function galleryUrlFromDbUrl(url) {
  if (/-main\.webp$/i.test(url)) return url.replace(/-main\.webp$/i, "-gallery.webp");
  if (variantFromUrl(url) === "legacy") return url;
  if (/-gallery\.webp$/i.test(url)) return url;
  return url;
}

function estimateStorefrontLoadBytes(images, bytesByUrl) {
  const dbUrl = images[0]?.url;
  if (!dbUrl) return 0;
  const galleryUrl = galleryUrlFromDbUrl(dbUrl);
  const row = bytesByUrl.get(galleryUrl) ?? bytesByUrl.get(dbUrl);
  if (row?.bytes != null) return row.bytes;
  return PRODUCT_IMAGE_TARGETS.gallery.targetBytes;
}

async function main() {
  const supabase = createAdminClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, seo_slug, main_image_url, image_url, gallery_images")
    .order("name");

  if (error) {
    console.error("Erreur Supabase:", error.message);
    process.exit(1);
  }

  const { data: allVariants } = await supabase
    .from("product_variants")
    .select("product_id, image_url");

  const variantsByProduct = new Map();
  for (const v of allVariants ?? []) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  }

  const allImageRows = [];
  const productReports = [];
  const bytesByUrl = new Map();
  let totalBytes = 0;
  let totalOptimizedBytes = 0;
  let legacyCount = 0;
  let heavyCount = 0;

  for (const product of products ?? []) {
    const variants = variantsByProduct.get(product.id) ?? [];
    const urls = collectProductUrls(product, variants);
    let productBytes = 0;
    let productOptimized = 0;
    const images = [];

    for (const url of urls) {
      const variant = variantFromUrl(url);
      if (variant === "legacy") legacyCount += 1;
      const target = targetForVariant(variant);
      const { bytes, error: fetchError } = await headBytes(url);
      bytesByUrl.set(url, { bytes, error: fetchError });
      const galleryUrl = galleryUrlFromDbUrl(url);
      if (galleryUrl !== url && !bytesByUrl.has(galleryUrl)) {
        const g = await headBytes(galleryUrl);
        bytesByUrl.set(galleryUrl, g);
      }
      const overTarget = bytes != null && bytes > target;
      const optimizedBytes =
        variant === "legacy"
          ? PRODUCT_IMAGE_TARGETS.main.targetBytes +
            PRODUCT_IMAGE_TARGETS.gallery.targetBytes +
            PRODUCT_IMAGE_TARGETS.thumb.targetBytes
          : Math.min(bytes ?? target, target);

      if (bytes != null) {
        productBytes += bytes;
        totalBytes += bytes;
        if (overTarget) heavyCount += 1;
      }

      productOptimized += optimizedBytes;
      totalOptimizedBytes += optimizedBytes;

      const row = {
        productId: product.id,
        product: product.name,
        url,
        variant,
        isLegacy: variant === "legacy",
        bytes,
        targetBytes: target,
        overTarget,
        error: fetchError,
        savingsBytes: bytes != null ? Math.max(0, bytes - optimizedBytes) : null,
      };
      images.push(row);
      allImageRows.push(row);
    }

    const storefrontLoad = estimateStorefrontLoadBytes(images, bytesByUrl);
    const optimizedStorefrontLoad = PRODUCT_IMAGE_TARGETS.gallery.targetBytes;

    productReports.push({
      id: product.id,
      name: product.name,
      slug: product.seo_slug,
      imageCount: urls.length,
      legacyImageCount: images.filter((i) => i.isLegacy).length,
      totalBytes: productBytes || null,
      estimatedOptimizedBytes: urls.length ? productOptimized : null,
      estimatedGainBytes: productBytes > 0 ? Math.max(0, productBytes - productOptimized) : null,
      storefrontFirstPaintBytes: storefrontLoad || null,
      optimizedFirstPaintBytes: optimizedStorefrontLoad,
      images,
      priority:
        (productBytes > 500 * 1024 ? 3 : 0) +
        (images.some((i) => i.isLegacy) ? 2 : 0) +
        (images.some((i) => i.overTarget) ? 1 : 0),
    });
  }

  const productsWithImages = productReports.filter((p) => p.imageCount > 0);
  const avgBefore =
    productsWithImages.length > 0
      ? totalBytes / productsWithImages.length
      : 0;
  const avgAfter =
    productsWithImages.length > 0
      ? totalOptimizedBytes / productsWithImages.length
      : 0;
  const avgFirstPaintBefore =
    productsWithImages.reduce((s, p) => s + (p.storefrontFirstPaintBytes ?? 0), 0) /
      Math.max(1, productsWithImages.length);
  const avgFirstPaintAfter =
    productsWithImages.reduce((s, p) => s + p.optimizedFirstPaintBytes, 0) /
      Math.max(1, productsWithImages.length);

  const mobileLoadMsBefore = (avgFirstPaintBefore / 1024 / (MOBILE_4G_KBPS / 8)) * 1000;
  const mobileLoadMsAfter = (avgFirstPaintAfter / 1024 / (MOBILE_4G_KBPS / 8)) * 1000;

  const topHeavy = [...allImageRows]
    .filter((i) => i.bytes != null)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20);

  const topProducts = [...productReports]
    .filter((p) => p.totalBytes)
    .sort((a, b) => b.totalBytes - a.totalBytes)
    .slice(0, 20);

  const priorityProducts = [...productReports]
    .filter((p) => p.priority > 0)
    .sort((a, b) => b.priority - a.priority || (b.totalBytes ?? 0) - (a.totalBytes ?? 0))
    .slice(0, 20);

  const report = {
    generatedAt: new Date().toISOString(),
    productCount: products?.length ?? 0,
    uniqueImagesAudited: allImageRows.length,
    legacyImageCount: legacyCount,
    heavyImages: heavyCount,
    totalBytes,
    estimatedOptimizedTotalBytes: totalOptimizedBytes,
    estimatedTotalGainBytes: Math.max(0, totalBytes - totalOptimizedBytes),
    averages: {
      bytesPerProductBefore: Math.round(avgBefore),
      bytesPerProductAfter: Math.round(avgAfter),
      firstPaintBytesBefore: Math.round(avgFirstPaintBefore),
      firstPaintBytesAfter: Math.round(avgFirstPaintAfter),
    },
    performanceEstimates: {
      mobile4gKbps: MOBILE_4G_KBPS,
      firstPaintMsBefore: Math.round(mobileLoadMsBefore),
      firstPaintMsAfter: Math.round(mobileLoadMsAfter),
      lighthousePerformanceBefore: mobileLoadMsBefore > 2500 ? 72 : mobileLoadMsBefore > 1500 ? 85 : 92,
      lighthousePerformanceAfter: mobileLoadMsAfter < 800 ? 96 : mobileLoadMsAfter < 1200 ? 94 : 90,
      lcpEstimateMsBefore: Math.round(mobileLoadMsBefore * 1.15),
      lcpEstimateMsAfter: Math.round(mobileLoadMsAfter * 1.05),
    },
    topHeavyImages: topHeavy,
    topHeavyProducts: topProducts,
    priorityProducts,
    products: productReports,
  };

  const outDir = resolve(process.cwd(), "docs/reports");
  mkdirSync(outDir, { recursive: true });
  const outJson = resolve(outDir, "product-images-audit.json");
  writeFileSync(outJson, JSON.stringify(report, null, 2));

  const md = `# Audit images produit LN COS

Généré le ${report.generatedAt}

## Synthèse

| Métrique | Valeur |
|----------|--------|
| Produits | ${report.productCount} |
| Images auditées | ${report.uniqueImagesAudited} |
| Images legacy | ${report.legacyImageCount} |
| Images trop lourdes | ${report.heavyImages} |
| Poids total actuel | ${formatKb(report.totalBytes)} |
| Poids cible estimé | ${formatKb(report.estimatedOptimizedTotalBytes)} |
| Gain estimé | ${formatKb(report.estimatedTotalGainBytes)} |
| Poids moyen / fiche (avant) | ${formatKb(report.averages.bytesPerProductBefore)} |
| Poids moyen / fiche (après) | ${formatKb(report.averages.bytesPerProductAfter)} |
| 1er paint mobile 4G (avant) | ~${report.performanceEstimates.firstPaintMsBefore} ms |
| 1er paint mobile 4G (après) | ~${report.performanceEstimates.firstPaintMsAfter} ms |
| Lighthouse Performance (est.) | ${report.performanceEstimates.lighthousePerformanceBefore} → ${report.performanceEstimates.lighthousePerformanceAfter} |

## Top 20 images les plus lourdes

${topHeavy.map((r, i) => `${i + 1}. **${r.product}** [${r.variant}] — ${formatKb(r.bytes)} (cible ${formatKb(r.targetBytes)})`).join("\n") || "_Aucune_"}

## Top 20 fiches les plus lourdes

${topProducts.map((p, i) => `${i + 1}. **${p.name}** — ${formatKb(p.totalBytes)} → ~${formatKb(p.estimatedOptimizedBytes)} (gain ~${formatKb(p.estimatedGainBytes)}, ${p.legacyImageCount} legacy)`).join("\n") || "_Aucune_"}

## Produits prioritaires

${priorityProducts.map((p, i) => `${i + 1}. **${p.name}** (score ${p.priority}) — legacy: ${p.legacyImageCount}, total ${formatKb(p.totalBytes)}`).join("\n") || "_Aucun_"}

`;

  writeFileSync(resolve(outDir, "product-images-audit.md"), md);

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("\n=== LN COS — Audit images produit ===\n");
  console.log(`Produits: ${report.productCount}`);
  console.log(`Images auditées: ${report.uniqueImagesAudited}`);
  console.log(`Images legacy: ${report.legacyImageCount}`);
  console.log(`Images trop lourdes: ${report.heavyImages}`);
  console.log(`Poids total: ${formatKb(report.totalBytes)} → ${formatKb(report.estimatedOptimizedTotalBytes)}`);
  console.log(`Gain estimé: ${formatKb(report.estimatedTotalGainBytes)}`);
  console.log(`1er paint 4G: ~${report.performanceEstimates.firstPaintMsBefore}ms → ~${report.performanceEstimates.firstPaintMsAfter}ms`);
  console.log(`\nRapports: ${outJson}`);
  console.log(`           ${resolve(outDir, "product-images-audit.md")}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
