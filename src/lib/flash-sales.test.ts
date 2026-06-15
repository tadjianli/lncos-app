import { describe, expect, it } from "vitest";
import { deriveIsFlashSale, filterFlashSaleProducts } from "./flash-sales";
import type { Product } from "./data";

function product(partial: Partial<Product> & Pick<Product, "id" | "name">): Product {
  return {
    cat: "skincare",
    price: 10,
    old: null,
    ml: "50ml",
    rating: 5,
    reviews: 0,
    tag: null,
    stock: 1,
    variants: ["Default"],
    desc: "",
    ...partial,
  };
}

describe("filterFlashSaleProducts", () => {
  it("inclut les produits avec home_visibility.flash", () => {
    const items = [
      product({ id: "a", name: "A", homeVisibility: { flash: true } }),
      product({ id: "b", name: "B" }),
    ];
    expect(filterFlashSaleProducts(items).map((p) => p.id)).toEqual(["a"]);
  });

  it("inclut les produits avec tag Flash (legacy)", () => {
    const items = [product({ id: "a", name: "A", tag: "Flash" })];
    expect(filterFlashSaleProducts(items)).toHaveLength(1);
  });

  it("inclut tag Flash même avec un univers coché", () => {
    const items = [
      product({
        id: "a",
        name: "A",
        tag: "Flash",
        homeVisibility: { parfums: true },
      }),
    ];
    expect(filterFlashSaleProducts(items)).toHaveLength(1);
  });

  it("exclut les produits inactifs", () => {
    const items = [
      product({ id: "a", name: "A", tag: "Flash", active: false }),
    ];
    expect(filterFlashSaleProducts(items)).toHaveLength(0);
  });

  it("respecte isFlashSale explicite", () => {
    expect(
      deriveIsFlashSale({
        isFlashSale: false,
        homeVisibility: { flash: true },
        tag: "Flash",
      })
    ).toBe(false);
  });
});
