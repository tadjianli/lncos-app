#!/usr/bin/env node
/**
 * LN COS — Test complet module IA (local / CI)
 * Usage: node scripts/ai-smoke-test.mjs
 */

import { config } from "dotenv";
import { createHash, createDecipheriv, createCipheriv, randomBytes } from "crypto";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

config({ path: resolve(root, ".env.local") });

const report = {};

function readEnv(key) {
  return (process.env[key] ?? "").trim();
}

function check(name, ok, detail) {
  report[name] = ok ? "OK" : "ERREUR";
  console.log(`${ok ? "✓" : "✗"} ${name}: ${detail}`);
  return ok;
}

const serviceRole = readEnv("SUPABASE_SERVICE_ROLE_KEY");
const aiEnc = readEnv("AI_ENCRYPTION_KEY");
const anthropicKey = readEnv("ANTHROPIC_API_KEY");
const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");

check(
  "SUPABASE_SERVICE_ROLE_KEY",
  Boolean(serviceRole),
  serviceRole ? `présente (${serviceRole.length} car.)` : "manquante ou vide"
);
check(
  "AI_ENCRYPTION_KEY",
  Boolean(aiEnc),
  aiEnc ? `présente (${aiEnc.length} car.)` : "manquante — repli service role"
);
check(
  "ANTHROPIC_API_KEY",
  Boolean(anthropicKey),
  anthropicKey ? `présente (${anthropicKey.length} car.)` : "absente (clé admin ou env requise)"
);

let storedAnthropicKey = null;

if (supabaseUrl && serviceRole) {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/ai_settings?id=eq.00000000-0000-4000-a000-000000000001&select=api_key_encrypted,model,provider`,
      {
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
        },
      }
    );
    const rows = await res.json();
    const row = rows?.[0];
    if (!res.ok) {
      check("Connexion Supabase", false, JSON.stringify(rows));
    } else {
      check("Connexion Supabase", true, `ai_settings lu (${row?.provider ?? "?"})`);
      if (row?.api_key_encrypted && (aiEnc || serviceRole)) {
        try {
          const secret = aiEnc || serviceRole;
          const key = createHash("sha256").update(secret).digest();
          const [ivB64, tagB64, dataB64] = row.api_key_encrypted.split(".");
          const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
          decipher.setAuthTag(Buffer.from(tagB64, "base64"));
          storedAnthropicKey = Buffer.concat([
            decipher.update(Buffer.from(dataB64, "base64")),
            decipher.final(),
          ]).toString("utf8");
          if (storedAnthropicKey) {
            check("ANTHROPIC_API_KEY", true, "clé déchiffrée depuis ai_settings");
            report.ANTHROPIC_API_KEY = "OK";
          }
        } catch {
          /* chiffrement avec autre secret */
        }
      }
    }
  } catch (e) {
    check("Connexion Supabase", false, e instanceof Error ? e.message : String(e));
  }
} else {
  check("Connexion Supabase", false, "URL ou service role manquant");
}

const apiKey = anthropicKey || storedAnthropicKey;

async function fetchAnthropicSonnetModel(key) {
  const res = await fetch("https://api.anthropic.com/v1/models?limit=100", {
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message ?? `models HTTP ${res.status}`);
  }
  const models = body.data ?? [];
  const sonnet = models.find(
    (m) => /sonnet/i.test(m.id) || /sonnet/i.test(m.display_name ?? "")
  );
  return sonnet?.id ?? models[0]?.id ?? null;
}

if (apiKey) {
  try {
    const modelId = await fetchAnthropicSonnetModel(apiKey);
    if (!modelId) {
      check("Connexion Anthropic", false, "aucun modèle disponible");
      report["Génération SEO"] = "ERREUR";
      report["Génération Blog"] = "ERREUR";
    } else {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 16,
          system: "Réponds uniquement OK.",
          messages: [{ role: "user", content: "Test LN COS" }],
        }),
      });
      const data = await res.json();
      const text =
        data.content?.map((b) => b.text ?? "").join("").trim() ??
        data.error?.message ??
        "";
      check(
        "Connexion Anthropic",
        res.ok && text.length > 0,
        res.ok ? `${modelId} — « ${text.slice(0, 40)} »` : `${res.status} ${text}`
      );

      if (res.ok) {
        const seoRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: modelId,
            max_tokens: 512,
            system: "Réponds uniquement en JSON valide.",
            messages: [
              {
                role: "user",
                content:
                  'Génère {"seoTitle":"test","metaDescription":"test","slug":"test","shortDescription":"test","longDescription":"test","imageAlt":"test","keywords":["a"]} pour produit test',
              },
            ],
          }),
        });
        const seoData = await seoRes.json();
        const seoText = seoData.content?.map((b) => b.text ?? "").join("") ?? "";
        let seoOk = false;
        try {
          JSON.parse(seoText.trim().startsWith("{") ? seoText.trim() : seoText.match(/\{[\s\S]*\}/)?.[0] ?? "");
          seoOk = seoRes.ok;
        } catch {
          seoOk = false;
        }
        check("Génération SEO", seoOk, seoOk ? "JSON SEO valide" : `échec ${seoRes.status}`);

        const blogRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: modelId,
            max_tokens: 512,
            system: "Réponds uniquement en JSON valide.",
            messages: [
              {
                role: "user",
                content:
                  'Article blog test JSON: {"title":"t","slug":"t","excerpt":"e","contentMarkdown":"# Hi","faq":[],"schemaArticle":null,"imageSuggestions":[]}',
              },
            ],
          }),
        });
        const blogData = await blogRes.json();
        const blogText = blogData.content?.map((b) => b.text ?? "").join("") ?? "";
        let blogOk = false;
        try {
          JSON.parse(blogText.trim().startsWith("{") ? blogText.trim() : blogText.match(/\{[\s\S]*\}/)?.[0] ?? "");
          blogOk = blogRes.ok;
        } catch {
          blogOk = false;
        }
        check("Génération Blog", blogOk, blogOk ? "JSON blog valide" : `échec ${blogRes.status}`);
      } else {
        report["Génération SEO"] = "ERREUR";
        report["Génération Blog"] = "ERREUR";
      }
    }
  } catch (e) {
    check("Connexion Anthropic", false, e instanceof Error ? e.message : String(e));
    report["Génération SEO"] = "ERREUR";
    report["Génération Blog"] = "ERREUR";
  }
} else {
  check("Connexion Anthropic", false, "aucune clé API");
  report["Génération SEO"] = "ERREUR";
  report["Génération Blog"] = "ERREUR";
}

console.log("\n--- RAPPORT ---");
for (const key of [
  "SUPABASE_SERVICE_ROLE_KEY",
  "AI_ENCRYPTION_KEY",
  "ANTHROPIC_API_KEY",
  "Connexion Supabase",
  "Connexion Anthropic",
  "Génération SEO",
  "Génération Blog",
]) {
  console.log(`${key} : ${report[key] ?? "ERREUR"}`);
}

const allOk = Object.values(report).every((v) => v === "OK");
process.exit(allOk ? 0 : 1);
