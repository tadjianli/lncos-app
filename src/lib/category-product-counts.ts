import type { Category, Product } from "./data";

/** Même règle que le listing public : produits actifs uniquement. */
export function isListedProduct(product: Product): boolean {
  return product.active !== false;
}

export function filterListedProducts(products: Product[]): Product[] {
  return products.filter(isListedProduct);
}

export function countProductsByCategoryId(products: Product[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const product of filterListedProducts(products)) {
    const catId = product.cat?.trim();
    if (!catId) continue;
    counts.set(catId, (counts.get(catId) ?? 0) + 1);
  }
  return counts;
}

/** Applique les compteurs calculés — ignore toute valeur stockée en base. */
export function applyCategoryProductCounts(
  categories: Category[],
  products: Product[],
): Category[] {
  const counts = countProductsByCategoryId(products);
  return categories.map((category) => ({
    ...category,
    count: counts.get(category.id) ?? 0,
  }));
}

export function productsInCategory(
  products: Product[],
  categoryId: string | null | undefined,
): Product[] {
  const listed = filterListedProducts(products);
  if (!categoryId) return listed;
  return listed.filter((product) => product.cat === categoryId);
}

export function countProductsInCategory(
  products: Product[],
  categoryId: string | null | undefined,
): number {
  return productsInCategory(products, categoryId).length;
}

export function formatCategoryProductCount(count: number): string {
  return count === 1 ? "1 produit" : `${count} produits`;
}

export type CategoryCatalogAudit = {
  orphanProductCategoryIds: string[];
  emptyCategoryIds: string[];
  storedCountMismatches: { categoryId: string; stored: number; actual: number }[];
};

/** Détecte catégories orphelines et écarts avec d'anciens compteurs stockés. */
export function auditCategoryCatalog(
  categories: Category[],
  products: Product[],
  options?: { storedCounts?: Map<string, number> },
): CategoryCatalogAudit {
  const categoryIds = new Set(categories.map((c) => c.id));
  const actual = countProductsByCategoryId(products);
  const orphanProductCategoryIds = [
    ...new Set(
      filterListedProducts(products)
        .map((p) => p.cat)
        .filter((catId) => catId && !categoryIds.has(catId)),
    ),
  ] as string[];

  const emptyCategoryIds = categories
    .filter((c) => (actual.get(c.id) ?? 0) === 0)
    .map((c) => c.id);

  const storedCountMismatches: CategoryCatalogAudit["storedCountMismatches"] = [];
  if (options?.storedCounts) {
    for (const category of categories) {
      const stored = options.storedCounts.get(category.id);
      if (stored === undefined) continue;
      const computed = actual.get(category.id) ?? 0;
      if (stored !== computed) {
        storedCountMismatches.push({
          categoryId: category.id,
          stored,
          actual: computed,
        });
      }
    }
  }

  return { orphanProductCategoryIds, emptyCategoryIds, storedCountMismatches };
}
