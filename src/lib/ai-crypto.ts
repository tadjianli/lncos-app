/**
 * LN COS — Chiffrement AES-256-GCM pour clés API IA (serveur uniquement)
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function deriveKey(): Buffer {
  const secret = process.env.AI_ENCRYPTION_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("AI_ENCRYPTION_KEY ou SUPABASE_SERVICE_ROLE_KEY requis pour chiffrer les clés API");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptApiKey(plain: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

export function decryptApiKey(payload: string): string {
  const parts = payload.split(".");
  if (parts.length !== 3) throw new Error("Clé chiffrée invalide");
  const [ivB64, tagB64, dataB64] = parts;
  const key = deriveKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.AI_ENCRYPTION_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY);
}
