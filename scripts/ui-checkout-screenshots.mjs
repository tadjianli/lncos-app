#!/usr/bin/env node
/**
 * Captures mobile du tunnel checkout LN COS (4 étapes).
 * Usage: node scripts/ui-checkout-screenshots.mjs [--device iphone|android|all]
 *
 * Prérequis: npm run dev (UI_SCREENSHOT_BASE=http://127.0.0.1:3002 si besoin)
 */
import { join } from "node:path";
import { chromium } from "playwright";
import {
  MOBILE_DEVICES,
  baseUrl,
  seedDemoCart,
  shot,
  waitForCheckoutTunnel,
} from "./ui-screenshot-shared.mjs";

const rootOut = join(process.cwd(), "docs", "ui-screenshots", "checkout");

const deviceArg = process.argv.includes("--device")
  ? process.argv[process.argv.indexOf("--device") + 1]
  : "all";

const DEMO_ADDRESS = {
  email: "demo@lncos.fr",
  firstName: "Lina",
  lastName: "Martin",
  address: "12 avenue des Champs-Élysées",
  zip: "75008",
  city: "Paris",
  phone: "06 12 34 56 78",
};

/** Écran confirmation — markup aligné ConfirmedScreen / StepConfirm (injection visuelle) */
const CONFIRMATION_SHELL_HTML = `
<div class="checkout-screenshot-confirmed" style="display:flex;flex-direction:column;flex:1 1 auto;min-height:0;height:100%;">
  <div style="padding-top:4px;flex:0 0 auto">
    <div class="mobile-screen-header" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 16px 12px;">
      <button type="button" aria-label="Retour" style="background:none;border:none;padding:4px;display:grid;place-items:center;color:var(--ink);min-width:44px;min-height:44px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h2 style="font-size:17px;font-weight:600;color:var(--ink);margin:0;text-align:center;flex:1;">Commande</h2>
      <div style="width:44px" aria-hidden="true"></div>
    </div>
  </div>
  <div class="noscroll app-scroll-page scroll-region--x18 scroll-region--y4" style="flex:1 1 auto;min-height:0;overflow-y:auto;padding:4px 18px 16px;">
    <div style="text-align:center;padding:40px 0;animation:fadeUp .4s ease both;">
      <div style="width:80px;height:80px;border-radius:50%;background:var(--gold-grad);display:grid;place-items:center;margin:0 auto 22px;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a1306" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h3 style="font-size:22px;font-weight:700;color:var(--ink);margin:0 0 10px;">Commande confirmée !</h3>
      <p style="font-size:13px;color:var(--ink-mute);line-height:1.6;margin:0 0 8px;">
        Votre commande <strong style="color:var(--gold);">#LN-240618</strong> a bien été enregistrée.
      </p>
      <p style="font-size:12px;color:var(--ink-mute);line-height:1.5;">Vous recevrez une confirmation par email.</p>
    </div>
  </div>
  <div class="bottom-action-bar bottom-action-bar--in-shell">
    <button type="button" class="lncos-cta lncos-cta--gold" style="width:100%;min-height:52px;border:none;border-radius:999px;font-weight:700;font-size:14px;">
      Retour à l'accueil
    </button>
  </div>
</div>`;

async function fillDemoAddress(page) {
  await page.getByRole("textbox", { name: "Email*" }).fill(DEMO_ADDRESS.email);
  await page.getByRole("textbox", { name: "Prénom*" }).fill(DEMO_ADDRESS.firstName);
  await page.getByRole("textbox", { name: "Nom*", exact: true }).fill(DEMO_ADDRESS.lastName);
  await page.getByRole("textbox", { name: "Adresse*" }).fill(DEMO_ADDRESS.address);
  await page.getByRole("textbox", { name: "Code postal*" }).fill(DEMO_ADDRESS.zip);
  await page.getByRole("textbox", { name: "Ville*" }).fill(DEMO_ADDRESS.city);
  await page.getByRole("textbox", { name: "Téléphone*" }).fill(DEMO_ADDRESS.phone);
}

async function clickCheckoutCta(page) {
  const btn = page.locator(".bottom-action-bar .lncos-cta:not(.lncos-cta--disabled)").first();
  await btn.waitFor({ state: "visible", timeout: 15000 });
  await btn.click();
}

async function enterCheckoutFromCart(page) {
  await page.goto(`${baseUrl}/bag`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /Passer la commande/i }).click({ timeout: 15000 });
  await page.waitForSelector('h3:has-text("Adresse de livraison")', { timeout: 15000 });
  await waitForCheckoutTunnel(page);
}

async function injectConfirmationScreen(page) {
  await page.evaluate((html) => {
    const main = document.querySelector(".app-shell-main");
    if (!main) return;
    main.innerHTML = html;
    document.documentElement.dataset.lncosCheckoutTunnel = "true";
  }, CONFIRMATION_SHELL_HTML);
  await page.waitForTimeout(400);
}

async function captureCheckoutSteps(page, outDir) {
  console.log(`\n  → ${outDir}\n`);

  await enterCheckoutFromCart(page);
  await page.waitForTimeout(500);
  await shot(page, outDir, "01-adresse");

  await fillDemoAddress(page);
  await clickCheckoutCta(page);
  await page.waitForSelector('h3:has-text("Mode de livraison")', { timeout: 20000 });
  await page.waitForTimeout(600);
  await shot(page, outDir, "02-livraison");

  await clickCheckoutCta(page);
  await page.waitForSelector('h3:has-text("Paiement")', { timeout: 15000 });
  await page.waitForTimeout(500);
  await shot(page, outDir, "03-paiement");

  await injectConfirmationScreen(page);
  await shot(page, outDir, "04-confirmation");
}

async function runDevice(browser, device) {
  const outDir = join(rootOut, device.id);
  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    colorScheme: device.colorScheme,
  });
  await seedDemoCart(context);
  const page = await context.newPage();

  console.log(`\nCheckout tunnel · ${device.label} (${device.viewport.width}×${device.viewport.height})`);
  await captureCheckoutSteps(page, outDir);

  await context.close();
}

async function main() {
  const devices =
    deviceArg === "all"
      ? Object.values(MOBILE_DEVICES)
      : [MOBILE_DEVICES[deviceArg]].filter(Boolean);

  if (devices.length === 0) {
    console.error(`Device inconnu: ${deviceArg}. Utiliser iphone, android ou all.`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  console.log(`\nUI checkout screenshots → ${rootOut}`);
  console.log(`Base URL: ${baseUrl}\n`);

  for (const device of devices) {
    await runDevice(browser, device);
  }

  await browser.close();
  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
