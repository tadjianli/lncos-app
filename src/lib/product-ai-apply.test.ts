import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/data";
import { applyProductSeoAiResult } from "./product-ai-apply";

const baseProduct: Product = {
  id: "test-produit",
  name: "Ancien nom",
  cat: "visage",
  price: 29.9,
  old: null,
  ml: "30 ml",
  rating: 5,
  reviews: 0,
  tag: null,
  stock: 10,
  variants: [],
  desc: "Description marketing originale.",
  benefits: ["Bénéfice original"],
};

describe("applyProductSeoAiResult", () => {
  it("n'applique que les métadonnées SEO — contenu marketing intact", () => {
    const { patch } = applyProductSeoAiResult(baseProduct, {
      optimizedName: "Nom réécrit par IA",
      seoTitle: "Sérum Vitamine C | LN COS",
      metaDescription: "Sérum vitamine C LN COS pour un teint éclatant. Livraison rapide.",
      slug: "serum-vitamine-c-eclat",
      shortDescription: "Sérum éclat quotidien.",
      longDescription: "## Bénéfices\n\nTexte long réécrit.",
      imageAlt: "Sérum vitamine C LN COS 30 ml",
      keywords: ["sérum vitamine c", "soin éclat", "vitamine c visage", "ln cos", "anti-taches"],
      benefits: ["Éclat immédiat", "Anti-taches"],
      faq: [{ question: "Convient-il aux peaux sensibles ?", answer: "Oui." }],
    });

    expect(patch.name).toBeUndefined();
    expect(patch.desc).toBeUndefined();
    expect(patch.benefits).toBeUndefined();
    expect(patch.extraSections).toBeUndefined();
    expect(patch.seoTitle).toBe("Sérum Vitamine C | LN COS");
    expect(patch.seoSlug).toBe("serum-vitamine-c-eclat");
    expect(patch.seoKeyword).toBe("sérum vitamine c");
    expect(patch.seoSecondaryKeywords).toHaveLength(4);
    expect(patch.imageAlt).toBe("Sérum vitamine C LN COS 30 ml");
  });
});
