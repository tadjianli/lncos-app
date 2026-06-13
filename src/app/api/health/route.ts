import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/middleware";
import { getEnvHealthSummary } from "@/lib/env/production-config";

/**
 * GET /api/health
 * Public: minimal status. Admin: detailed env checklist (no secret values).
 */
export async function GET() {
  const summary = getEnvHealthSummary();

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  const admin = user ? await isAdminUser(authClient, user.id) : false;

  if (!admin) {
    return NextResponse.json({
      status: summary.ok ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    status: summary.ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    environment: summary.checks,
    missingRequired: summary.missingRequired,
    emptyRequired: summary.emptyRequired,
    leakedServerKeys: summary.leakedServerKeys,
  });
}
