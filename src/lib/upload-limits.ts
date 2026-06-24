/**
 * LN COS — Limites upload (alignées Vercel serverless ~4,5 Mo corps HTTP)
 */

/** Marge de sécurité sous la limite plateforme Vercel. */
export const PRODUCT_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

export const PRODUCT_UPLOAD_MAX_LABEL = "4 Mo";
