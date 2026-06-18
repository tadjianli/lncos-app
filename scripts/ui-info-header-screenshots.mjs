#!/usr/bin/env node
/**
 * Captures header pages Informations — Contact, FAQ, CGV
 * Usage: UI_SCREENSHOT_BASE=http://127.0.0.1:3002 node scripts/ui-info-header-screenshots.mjs --label before|after
 */
import { join } from "node:path";
import { chromium } from "playwright";
import { baseUrl, MOBILE_DEVICES, shot } from "./ui-screenshot-shared.mjs";

const label = process.argv.includes("--label")
  ? process.argv[process.argv.indexOf("--label") + 1]
  : "after";

const PAGES = [
  { name: "01-contact", path: "/contact" },
  { name: "02-faq", path: "/faq" },
  { name: "03-cgv", path: "/cgv" },
];

async function captureDevice(deviceKey) {
  const device = MOBILE_DEVICES[deviceKey];
  const outDir = join(process.cwd(), "docs", "ui-screenshots", "info-header", label, device.id);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    colorScheme: "dark",
  });
  const page = await context.newPage();

  console.log(`\nInfo header [${label}] — ${device.label} → ${outDir}\n`);

  for (const { name, path } of PAGES) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector(".page-layout__header", { timeout: 15000 });
    await page.waitForTimeout(600);
    await shot(page, outDir, name);
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
