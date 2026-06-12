#!/usr/bin/env node
/**
 * Injecte l'identifiant de déploiement Vercel dans public/sw.js à chaque build.
 * Même source que NEXT_PUBLIC_APP_VERSION (next.config.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const swPath = path.join(root, "public", "sw.js");

const buildId =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  "development";

let content = fs.readFileSync(swPath, "utf8");
const marker = /const CACHE_VERSION = "[^"]*";/;

if (!marker.test(content)) {
  console.error("[generate-sw] CACHE_VERSION marker introuvable dans public/sw.js");
  process.exit(1);
}

content = content.replace(marker, `const CACHE_VERSION = "lncos-${buildId}";`);
fs.writeFileSync(swPath, content);
console.log(`[generate-sw] CACHE_VERSION → lncos-${buildId}`);
