import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/data";
import { applySeoOptimizationPatch, assertSeoOnlyPatch } from "./apply";

const baseProduct: Product = {
  id: "produit-test",
  name: "Crème hydratante",
  cat: "visage",
  price: 24.9,
  old: null,
  ml: "50 ml",
  rating: 4.8,
  reviews: 12,
  tag: "best-seller",
  stock: 5,
  variants: [],
  desc: "Description longue rédigée par le marchand.",
  benefits: ["Hydratation 24h"],
};

describe("applySeoOptimizationPatch", () => {
  it("ne modifie que les champs SEO autorisés", () => {
    const { patch, predictedScore } = applySeoOptimizationPatch(baseProduct, {
      seoTitle: "Crème Hydratante Visage | LN COS",
      metaDescription: "Crème hydratante LN COS pour une peau douce et éclatante toute la journée.",
      focusKeyword: "crème hydratante visage",
      secondaryKeywords: ["soin visage", "hydratation peau", "ln cos"],
      slug: "creme-hydratante-visage",
      imageAlt: "Crème hydratante visage LN COS 50 ml",
      predictedScore: 82,
    });

    expect(patch).toEqual({
      seoTitle: "Crème Hydratante Visage | LN COS",
      metaDescription: "Crème hydratante LN COS pour une peau douce et éclatante toute la journée.",
      seoKeyword: "crème hydratante visage",
      seoSecondaryKeywords: ["soin visage", "hydratation peau", "ln cos"],
      seoSlug: "creme-hydratante-visage",
      imageAlt: "Crème hydratante visage LN COS 50 ml",
    });
    expect(predictedScore).toBe(82);
  });

  it("rejette un patch contenant des champs protégés", () => {
    expect(() =>
      assertSeoOnlyPatch({ desc: "texte réécrit" }),
    ).toThrow(/protégé/);
  });
});
