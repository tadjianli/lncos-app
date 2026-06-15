import { describe, expect, it } from "vitest";
import {
  filterProductsByHomeKey,
  normalizeHomeVisibility,
} from "./product-home-visibility";
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

describe("normalizeHomeVisibility", () => {
  it("fusionne le tag Flash même si un univers est coché", () => {
    expect(
      normalizeHomeVisibility({ skincare: true }, "Flash")
    ).toEqual({ skincare: true, flash: true });
  });

  it("lit home_visibility.flash depuis la DB", () => {
    expect(normalizeHomeVisibility({ flash: true }, null)).toEqual({ flash: true });
  });
});

describe("filterProductsByHomeKey", () => {
  it("inclut tag Flash + univers skincare", () => {
    const items = [
      product({
        id: "a",
        name: "A",
        tag: "Flash",
        homeVisibility: { skincare: true },
      }),
      product({ id: "b", name: "B", homeVisibility: { skincare: true } }),
    ];
    expect(filterProductsByHomeKey(items, "flash").map((p) => p.id)).toEqual(["a"]);
  });

  it("exclut les produits inactifs", () => {
    const items = [
      product({ id: "a", name: "A", tag: "Flash", active: false }),
    ];
    expect(filterProductsByHomeKey(items, "flash")).toHaveLength(0);
  });
});
