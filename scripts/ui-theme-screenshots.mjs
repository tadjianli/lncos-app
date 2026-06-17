#!/usr/bin/env node
/**
 * Captures mobile UI screenshots for beige theme comparison.
 * Usage: node scripts/ui-theme-screenshots.mjs --label before|after
 *
 * Tunnel checkout (4 étapes) : node scripts/ui-checkout-screenshots.mjs
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { baseUrl, shot as takeShot } from "./ui-screenshot-shared.mjs";

const label = process.argv.includes("--label")
  ? process.argv[process.argv.indexOf("--label") + 1]
  : "capture";

const outDir = join(process.cwd(), "docs", "ui-screenshots", label);

const VIEWPORT = { width: 390, height: 844 };

async function shot(page, name) {
  await takeShot(page, outDir, name);
}

const POPUP_HTML = `
<div class="popup-promo-overlay popup-promo-overlay--screenshot" style="pointer-events:auto;z-index:9999">
  <div class="popup-promo-scrim" aria-hidden="true" style="pointer-events:none"></div>
  <div class="popup-promo-card" role="dialog" aria-modal="true">
    <button type="button" class="popup-promo-close" aria-label="Fermer"><span>×</span></button>
    <div class="popup-promo-body">
      <p class="popup-promo-eyebrow">Offre exclusive</p>
      <h2 class="popup-promo-title">−10 % sur votre première commande</h2>
      <p class="popup-promo-subtitle">Profitez de l'offre de bienvenue LN COS.</p>
      <code class="popup-promo-code">BIENVENUE10</code>
      <p class="popup-promo-countdown">Expire dans 02:14:33</p>
      <button type="button" class="popup-promo-cta">J'en profite</button>
    </div>
  </div>
</div>`;

const SIDE_MENU_HTML = `
<div class="side-menu-root side-menu-root--screenshot" style="position:fixed;inset:0;z-index:9998;max-width:480px;margin:0 auto;">
  <div class="side-menu-scrim" aria-hidden="true"></div>
  <aside class="side-menu-drawer" aria-label="Menu">
    <div class="side-menu-drawer__header">
      <span style="font-weight:600;font-size:15px;color:var(--ink)">Menu</span>
      <button type="button" aria-label="Fermer" style="background:none;border:none;color:var(--ink);font-size:22px;line-height:1">×</button>
    </div>
    <div class="side-menu-drawer__scroll">
      <section class="side-menu-section">
        <p class="side-menu-section__label">Boutique</p>
        <a class="side-menu-link" href="#"><div class="side-menu-row side-menu-row--active"><span style="color:var(--gold);display:flex"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg></span><span class="side-menu-row__label">Accueil</span></div></a>
        <a class="side-menu-link" href="#"><div class="side-menu-row"><span style="color:var(--gold);display:flex"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></svg></span><span class="side-menu-row__label">Nouveautés</span></div></a>
        <a class="side-menu-link" href="#"><div class="side-menu-row"><span style="color:var(--gold);display:flex"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></span><span class="side-menu-row__label">Ventes Flash</span></div></a>
      </section>
      <section class="side-menu-section">
        <p class="side-menu-section__label">Mon compte</p>
        <a class="side-menu-link" href="#"><div class="side-menu-row"><span style="color:var(--gold);display:flex"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/></svg></span><span class="side-menu-row__label">Mes commandes</span></div></a>
        <a class="side-menu-link" href="#"><div class="side-menu-row"><span style="color:var(--gold);display:flex"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><span class="side-menu-row__label">Mon profil</span></div></a>
      </section>
    </div>
  </aside>
</div>`;

async function shot(page, name) {
  const path = join(outDir, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`  ✓ ${path}`);
}

async function injectPopup(page) {
  await page.evaluate((html) => {
    document.querySelector(".popup-promo-overlay--screenshot")?.remove();
    document.body.insertAdjacentHTML("beforeend", html);
  }, POPUP_HTML);
}

async function injectSideMenu(page) {
  await page.evaluate((html) => {
    document.querySelector(".side-menu-root--screenshot")?.remove();
    document.body.insertAdjacentHTML("beforeend", html);
  }, SIDE_MENU_HTML);
}

async function openFirstProduct(page) {
  const card = page.locator(".prod-card, .prodbento, [data-product-card]").first();
  if (await card.count()) {
    await card.click({ timeout: 8000 });
    await page.waitForSelector(".pd-overlay", { timeout: 8000 }).catch(() => null);
    await page.waitForTimeout(600);
    return true;
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
  });
  const page = await context.newPage();

  console.log(`\nUI screenshots [${label}] → ${outDir}\n`);

  // 1. Accueil
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  await shot(page, "01-accueil");

  // 2. Popup promo
  await injectPopup(page);
  await page.waitForTimeout(400);
  await shot(page, "02-popup-promo");
  await page.evaluate(() => document.querySelector(".popup-promo-overlay--screenshot")?.remove());

  // 3. Fiche produit
  let productOpened = await openFirstProduct(page);
  if (!productOpened) {
    await page.goto(`${baseUrl}/boutique`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);
    productOpened = await openFirstProduct(page);
  }
  if (productOpened) {
    await shot(page, "03-fiche-produit");
    await page.evaluate(() => document.querySelector(".pd-overlay")?.remove());
  } else {
    await writeFile(join(outDir, "03-fiche-produit-SKIPPED.txt"), "Aucune carte produit cliquable.");
    console.log("  ⚠ fiche produit ignorée");
  }

  // 4. Panier
  await page.goto(`${baseUrl}/bag`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  await shot(page, "04-panier");

  // 5. Menu latéral
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  await injectSideMenu(page);
  await page.waitForTimeout(400);
  await shot(page, "05-menu-lateral");
  await page.evaluate(() => document.querySelector(".side-menu-root--screenshot")?.remove());

  await browser.close();
  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
