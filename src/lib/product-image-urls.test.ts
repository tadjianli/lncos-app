import { describe, expect, it } from "vitest";
import { productImageSizes, productImageUrlForSize } from "./product-image-urls";

const BASE =
  "https://example.supabase.co/storage/v1/object/public/product-images/abc/image-1-main.webp";

describe("productImageUrlForSize", () => {
  it("dérive gallery et thumb depuis l'URL main", () => {
    expect(productImageUrlForSize(BASE, "gallery")).toBe(
      "https://example.supabase.co/storage/v1/object/public/product-images/abc/image-1-gallery.webp"
    );
    expect(productImageUrlForSize(BASE, "thumb")).toBe(
      "https://example.supabase.co/storage/v1/object/public/product-images/abc/image-1-thumb.webp"
    );
    expect(productImageUrlForSize(BASE, "main")).toBe(BASE);
  });

  it("convertit entre variantes existantes", () => {
    const gallery = BASE.replace("-main.webp", "-gallery.webp");
    expect(productImageUrlForSize(gallery, "main")).toBe(BASE);
    expect(productImageUrlForSize(gallery, "thumb")).toBe(
      BASE.replace("-main.webp", "-thumb.webp")
    );
  });

  it("retourne null pour URL vide", () => {
    expect(productImageUrlForSize(null, "main")).toBeNull();
    expect(productImageUrlForSize(undefined, "thumb")).toBeNull();
  });

  it("conserve les URLs legacy sans suffixe variante", () => {
    const legacy = "https://example.supabase.co/storage/v1/object/public/product-images/abc/old.jpg";
    expect(productImageUrlForSize(legacy, "gallery")).toBe(legacy);
    expect(productImageUrlForSize(legacy, "thumb")).toBe(legacy);
  });
});

describe("productImageSizes", () => {
  it("expose des sizes mobile-first pour la galerie et le panier", () => {
    expect(productImageSizes("gallery-hero")).toContain("480px");
    expect(productImageSizes("card")).toContain("46vw");
    expect(productImageSizes("bag")).toContain("72px");
  });
});
