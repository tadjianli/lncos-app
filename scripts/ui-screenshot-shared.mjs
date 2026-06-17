/**
 * Utilitaires partagés — captures UI Playwright LN COS
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export const baseUrl = process.env.UI_SCREENSHOT_BASE ?? "http://127.0.0.1:3000";

/** iPhone 14 · Android Pixel 7 — conventions mobile LN COS */
export const MOBILE_DEVICES = {
  iphone: {
    id: "iphone",
    label: "iPhone",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
  },
  android: {
    id: "android",
    label: "Android",
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
  },
};

export const DEMO_CART_ITEM = {
  key: "screenshot-seed-1",
  id: "1",
  name: "Sérum Éclat LN COS",
  cat: "visage",
  price: 49.9,
  old: 59.9,
  ml: "50 ml",
  rating: 4.8,
  reviews: 124,
  tag: "Best-seller",
  stock: 50,
  variants: ["30 ml", "50 ml"],
  desc: "Sérum visage éclat premium.",
  qty: 1,
  variant: "50 ml",
};

export async function shot(page, outDir, name) {
  await mkdir(outDir, { recursive: true });
  const path = join(outDir, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`  ✓ ${path}`);
  return path;
}

export async function seedDemoCart(context) {
  await context.addInitScript((item) => {
    localStorage.setItem(
      "lncos-app-store",
      JSON.stringify({
        state: { cart: [item], cartCount: 1, favs: [] },
        version: 0,
      })
    );
  }, DEMO_CART_ITEM);
}

export async function waitForCheckoutTunnel(page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.lncosCheckoutTunnel === "true"
  );
  await page.waitForSelector(".bottom-nav", { state: "detached", timeout: 8000 }).catch(() => null);
}
