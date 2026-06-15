import { describe, expect, it } from "vitest";
import { decryptApiKey, encryptApiKey } from "./ai-crypto";
import {
  defaultModelForProvider,
  maskApiKey,
  dbToAiSettings,
} from "./ai-settings";

describe("maskApiKey", () => {
  it("masque une clé longue", () => {
    expect(maskApiKey("sk-ant-api03-abcdefghijklmnop")).toMatch(/^sk-••••/);
  });

  it("masque une clé courte", () => {
    expect(maskApiKey("abc")).toBe("••••••••");
  });
});

describe("dbToAiSettings", () => {
  it("retourne les defaults si row null", () => {
    expect(dbToAiSettings(null).provider).toBe("anthropic");
  });

  it("mappe une ligne DB", () => {
    const s = dbToAiSettings(
      {
        id: "default",
        provider: "openai",
        api_key_encrypted: "enc",
        model: "gpt-4.1",
        language: "fr",
        tone: "luxe",
        description_length: "medium",
        seo_enabled: true,
        seo_auto_title: true,
        seo_auto_meta: true,
        seo_auto_slug: true,
        seo_auto_alt: true,
        seo_auto_keywords: true,
        blog_enabled: false,
        blog_word_count: 1000,
        blog_include_faq: true,
        blog_include_schema: true,
        blog_image_suggestions: true,
        last_test_ok: true,
        last_test_at: "2026-01-01T00:00:00Z",
        created_at: "",
        updated_at: "",
      },
      "sk-test-key-12345678"
    );
    expect(s.provider).toBe("openai");
    expect(s.hasApiKey).toBe(true);
    expect(s.apiKeyMasked).toContain("••••");
  });
});

describe("defaultModelForProvider", () => {
  it("retourne le premier modèle du fournisseur", () => {
    expect(defaultModelForProvider("mistral")).toContain("mistral");
  });

  it("retourne le premier modèle anthropic", () => {
    expect(defaultModelForProvider("anthropic")).toBe("claude-opus-4-20250514");
  });
});

describe("encryptApiKey / decryptApiKey", () => {
  it("round-trip avec SUPABASE_SERVICE_ROLE_KEY ou AI_ENCRYPTION_KEY", () => {
    if (!process.env.AI_ENCRYPTION_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return;
    }
    const plain = "sk-test-secret-key-12345";
    const enc = encryptApiKey(plain);
    expect(decryptApiKey(enc)).toBe(plain);
  });
});
