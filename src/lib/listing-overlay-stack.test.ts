import { describe, expect, it } from "vitest";
import {
  getStackedListingCategory,
  isProductOpenedOverListing,
} from "./listing-overlay-stack";

describe("listing-overlay-stack", () => {
  it("garde le listing monté sous une fiche produit", () => {
    const overlay = {
      type: "product" as const,
      product: { id: "a", name: "A", cat: "visage", price: 1, old: null, ml: "", rating: 5, reviews: 0, tag: null, stock: 1, variants: [], desc: "" },
      productReturn: {
        pathname: "/discover",
        search: "?cat=visage",
        source: "categories" as const,
        previousOverlay: {
          type: "listing" as const,
          category: { id: "visage", name: "Visage", count: 2 },
        },
      },
    };
    expect(getStackedListingCategory(overlay)).toEqual({
      id: "visage",
      name: "Visage",
      count: 2,
    });
    expect(isProductOpenedOverListing(overlay)).toBe(true);
  });

  it("ne monte pas le listing si ouverture produit sans listing précédent", () => {
    const overlay = {
      type: "product" as const,
      product: { id: "a", name: "A", cat: "visage", price: 1, old: null, ml: "", rating: 5, reviews: 0, tag: null, stock: 1, variants: [], desc: "" },
      productReturn: {
        pathname: "/boutique",
        search: "",
        source: "boutique" as const,
        previousOverlay: null,
      },
    };
    expect(getStackedListingCategory(overlay)).toBeUndefined();
  });
});
