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
  desc: "",
};

describe("applyProductSeoAiResult", () => {
  it("mappe la réponse IA vers les champs produit", () => {
    const { patch, predictedScore } = applyProductSeoAiResult(baseProduct, {
      optimizedName: "Sérum Vitamine C Éclat",
      seoTitle: "Sérum Vitamine C | LN COS",
      metaDescription: "Sérum vitamine C LN COS pour un teint éclatant. Livraison rapide.",
      slug: "serum-vitamine-c-eclat",
      shortDescription: "Sérum éclat quotidien.",
      longDescription: "## Bénéfices\n\nTexte long.",
      imageAlt: "Sérum vitamine C LN COS 30 ml",
      keywords: ["sérum vitamine c", "soin éclat", "vitamine c visage", "ln cos", "anti-taches"],
      benefits: ["Éclat immédiat", "Anti-taches", "Texture légère", "Convient peaux sensibles"],
      faq: [
        { question: "Convient-il aux peaux sensibles ?", answer: "Oui, testé dermatologiquement." },
      ],
    });

    expect(patch.name).toBe("Sérum Vitamine C Éclat");
    expect(patch.seoSlug).toBe("serum-vitamine-c-eclat");
    expect(patch.seoKeyword).toBe("sérum vitamine c");
    expect(patch.seoSecondaryKeywords).toHaveLength(4);
    expect(patch.benefits).toEqual([
      "Éclat immédiat",
      "Anti-taches",
      "Texture légère",
      "Convient peaux sensibles",
    ]);
    expect(patch.extraSections?.some((s) => s.id.startsWith("seo-faq-"))).toBe(true);
    expect(predictedScore).toBeGreaterThan(0);
  });
});
