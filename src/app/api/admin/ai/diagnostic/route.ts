import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { runAiDiagnostic } from "@/lib/ai-diagnostic";
import { getAiEncryptionErrorMessage, isAiEncryptionConfigured } from "@/lib/ai-env";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const status = await runAiDiagnostic();
    return NextResponse.json({
      ...status,
      encryptionConfigured: isAiEncryptionConfigured(),
      encryptionErrorMessage: isAiEncryptionConfigured() ? null : getAiEncryptionErrorMessage(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Diagnostic impossible" },
      { status: 500 }
    );
  }
}
