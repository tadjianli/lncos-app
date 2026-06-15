import { describe, expect, it } from "vitest";
import {
  dbToFlashSalesSettings,
  formatFlashBannerSubtitle,
  slugifyTitle,
  staticBlogCategories,
  staticSocialLinks,
} from "./content-pages";

describe("formatFlashBannerSubtitle", () => {
  it("remplace {{count}} et gère le pluriel (s)", () => {
    const tpl = "{{count}} promotion(s) en cours";
    expect(formatFlashBannerSubtitle(tpl, 1)).toBe("1 promotion en cours");
    expect(formatFlashBannerSubtitle(tpl, 3)).toBe("3 promotions en cours");
  });
});

describe("slugifyTitle", () => {
  it("génère un slug URL-safe", () => {
    expect(slugifyTitle("Le Rituel Éclat !")).toBe("le-rituel-eclat");
  });
});

describe("dbToFlashSalesSettings", () => {
  it("retourne les defaults si row null", () => {
    const s = dbToFlashSalesSettings(null);
    expect(s.bannerTitle).toContain("Ventes Flash");
  });
});

describe("fallbacks statiques", () => {
  it("expose des catégories blog", () => {
    expect(staticBlogCategories().length).toBeGreaterThan(0);
  });

  it("expose des liens sociaux", () => {
    expect(staticSocialLinks().some((l) => l.id === "instagram")).toBe(true);
  });
});
