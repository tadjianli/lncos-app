import { describe, expect, it } from "vitest";
import { shouldOpenDiscoverListingFromUrl } from "./use-discover-listing-sync";

describe("shouldOpenDiscoverListingFromUrl", () => {
  it("n'ouvre pas le listing si une fiche produit est ouverte", () => {
    expect(
      shouldOpenDiscoverListingFromUrl({
        pathname: "/discover",
        catId: "maquillage",
        overlayType: "product",
        listingCategoryId: null,
      }),
    ).toBe(false);
  });

  it("ouvre le listing si ?cat= et aucun overlay empilé", () => {
    expect(
      shouldOpenDiscoverListingFromUrl({
        pathname: "/discover",
        catId: "maquillage",
        overlayType: null,
        listingCategoryId: null,
      }),
    ).toBe(true);
  });

  it("ne rouvre pas si le listing affiche déjà la bonne catégorie", () => {
    expect(
      shouldOpenDiscoverListingFromUrl({
        pathname: "/discover",
        catId: "maquillage",
        overlayType: "listing",
        listingCategoryId: "maquillage",
      }),
    ).toBe(false);
  });
});
