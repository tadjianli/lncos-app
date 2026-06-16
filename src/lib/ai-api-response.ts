/**
 * LN COS — Helpers réponses API admin IA
 */

import { NextResponse } from "next/server";
import { classifyAnthropicError } from "@/lib/ai-anthropic-client";

export function aiErrorResponse(error: unknown): NextResponse {
  const classified = classifyAnthropicError(error);
  return NextResponse.json(
    {
      ok: false,
      status: classified.status,
      error: classified.message,
      detail: classified.detail,
      code: classified.status,
    },
    { status: classified.httpStatus }
  );
}
