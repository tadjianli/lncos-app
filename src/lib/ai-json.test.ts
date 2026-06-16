import { describe, expect, it } from "vitest";
import { parseJsonFromLlm } from "./ai-json";

describe("parseJsonFromLlm", () => {
  it("parse du JSON brut", () => {
    expect(parseJsonFromLlm<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it("extrait le JSON d'un bloc markdown", () => {
    const raw = 'Voici le résultat:\n```json\n{"title":"Test"}\n```';
    expect(parseJsonFromLlm<{ title: string }>(raw)).toEqual({ title: "Test" });
  });

  it("extrait le premier objet JSON dans du texte", () => {
    const raw = 'Note: {"slug":"mon-produit","keywords":["a"]} fin';
    expect(parseJsonFromLlm<{ slug: string; keywords: string[] }>(raw)).toEqual({
      slug: "mon-produit",
      keywords: ["a"],
    });
  });

  it("échoue sur une réponse vide", () => {
    expect(() => parseJsonFromLlm("")).toThrow("Réponse IA vide");
  });
});
