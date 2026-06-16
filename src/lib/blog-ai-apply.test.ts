import { describe, expect, it } from "vitest";
import { buildBlogArticleFromAi } from "./blog-ai-apply";

describe("buildBlogArticleFromAi", () => {
  it("crée un brouillon avec contenu structuré", () => {
    const article = buildBlogArticleFromAi(
      {
        title: "Guide cils magnétiques",
        slug: "guide-cils-magnetiques",
        excerpt: "Tout savoir sur les cils magnétiques.",
        metaDescription: "Guide complet cils magnétiques LN COS pour débutantes.",
        seoTitle: "Guide cils magnétiques | LN COS",
        seoKeyword: "cils magnétiques",
        tags: ["cils magnétiques", "tutoriel", "LN COS"],
        body: [
          { type: "h1", text: "Guide cils magnétiques" },
          { type: "h2", text: "Pourquoi les choisir" },
          { type: "h3", text: "Avantages" },
          { type: "p", text: "Contenu détaillé." },
        ],
        faq: [{ question: "Réutilisables ?", answer: "Oui, jusqu'à 30 fois." }],
        schemaArticle: { "@type": "Article", headline: "Guide" },
        imageSuggestions: [],
      },
      "tutoriels"
    );

    expect(article.published).toBe(false);
    expect(article.categoryId).toBe("tutoriels");
    expect(article.body.some((b) => b.type === "h2")).toBe(true);
    expect(article.faq).toHaveLength(1);
    expect(article.tags).toHaveLength(3);
    expect(article.schemaArticle).toBeTruthy();
  });
});
