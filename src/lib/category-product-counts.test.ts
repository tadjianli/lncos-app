import { describe, expect, it } from "vitest";
import type { Category, Product } from "./data";
import {
  applyCategoryProductCounts,
  auditCategoryCatalog,
  countProductsInCategory,
  formatCategoryProductCount,
  productsInCategory,
} from "./category-product-counts";

const baseProduct = (overrides: Partial<Product> & Pick<Product, "id" | "cat">): Product =>
  ({
    name: "Test",
    price: 10,
    old: null,
    ml: "30ml",
    rating: 4,
    reviews: 0,
    tag: null,
    stock: 1,
    variants: [],
    desc: "",
    active: true,
    ...overrides,
  }) as Product;

const categories: Category[] = [
  { id: "visage", name: "Visage", count: 99 },
  { id: "maquillage", name: "Maquillage", count: 72 },
];

describe("category-product-counts", () => {
  it("compte uniquement les produits actifs par catégorie", () => {
    const products = [
      baseProduct({ id: "a", cat: "visage" }),
      baseProduct({ id: "b", cat: "visage", active: false }),
      baseProduct({ id: "c", cat: "maquillage" }),
    ];

    expect(countProductsInCategory(products, "visage")).toBe(1);
    expect(countProductsInCategory(products, "maquillage")).toBe(1);
    expect(applyCategoryProductCounts(categories, products)).toEqual([
      { id: "visage", name: "Visage", count: 1 },
      { id: "maquillage", name: "Maquillage", count: 1 },
    ]);
  });

  it("aligne listing et compteur affiché", () => {
    const products = [
      baseProduct({ id: "1", cat: "visage" }),
      baseProduct({ id: "2", cat: "visage" }),
    ];
    const withCounts = applyCategoryProductCounts(categories, products);
    expect(withCounts[0].count).toBe(productsInCategory(products, "visage").length);
  });

  it("formate le libellé singulier/pluriel", () => {
    expect(formatCategoryProductCount(1)).toBe("1 produit");
    expect(formatCategoryProductCount(12)).toBe("12 produits");
    expect(formatCategoryProductCount(0)).toBe("0 produits");
  });

  it("signale les catégories orphelines et écarts stockés", () => {
    const products = [baseProduct({ id: "x", cat: "inconnue" })];
    const audit = auditCategoryCatalog(categories, products, {
      storedCounts: new Map([
        ["visage", 48],
        ["maquillage", 72],
      ]),
    });
    expect(audit.orphanProductCategoryIds).toEqual(["inconnue"]);
    expect(audit.emptyCategoryIds).toEqual(["visage", "maquillage"]);
    expect(audit.storedCountMismatches).toHaveLength(2);
  });
});
