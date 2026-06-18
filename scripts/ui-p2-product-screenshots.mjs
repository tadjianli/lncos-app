#!/usr/bin/env node
/**
 * Captures P2 — cartes produit, liste boutique, fiche produit (iPhone + Android)
 * Usage: UI_SCREENSHOT_BASE=http://127.0.0.1:3002 node scripts/ui-p2-product-screenshots.mjs --label before|after
 */
import { join } from "node:path";
import { chromium } from "playwright";
import { baseUrl, MOBILE_DEVICES, shot } from "./ui-screenshot-shared.mjs";

const label = process.argv.includes("--label")
  ? process.argv[process.argv.indexOf("--label") + 1]
  : "after";

async function openFirstProduct(page) {
  const card = page.locator(".prodbento .prod-card, .prod-card").first();
  if (await card.count()) {
    await card.click({ timeout: 10000 });
    await page.waitForSelector(".pd-overlay", { timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

async function captureDevice(deviceKey) {
  const device = MOBILE_DEVICES[deviceKey];
  const outDir = join(process.cwd(), "docs", "ui-screenshots", "p2", label, device.id);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    colorScheme: device.colorScheme,
  });
  const page = await context.newPage();

  console.log(`\nP2 [${label}] — ${device.label} → ${outDir}\n`);

  // Liste produits (boutique)
  await page.goto(`${baseUrl}/boutique`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".prodbento .prod-card, .prod-card", { timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(900);
  await shot(page, outDir, "02-liste-produits");

  // Carte produit (crop première carte)
  const card = page.locator(".prodbento .prod-card, .prod-card").first();
  if (await card.count()) {
    const box = await card.boundingBox();
    if (box) {
      await page.screenshot({
        path: join(outDir, "01-carte-produit.png"),
        clip: {
          x: Math.max(0, box.x - 8),
          y: Math.max(0, box.y - 8),
          width: Math.min(device.viewport.width, box.width + 16),
          height: box.height + 16,
        },
      });
      console.log(`  ✓ ${join(outDir, "01-carte-produit.png")}`);
    }
  }

  // Fiche produit
  const opened = await openFirstProduct(page);
  if (opened) {
    await shot(page, outDir, "03-fiche-produit");
  } else {
    console.log("  ⚠ fiche produit ignorée");
  }

  await browser.close();
}

async function main() {
  console.log(`Base URL: ${baseUrl}`);
  await captureDevice("iphone");
  await captureDevice("android");
  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
