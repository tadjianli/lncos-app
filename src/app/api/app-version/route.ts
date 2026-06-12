import { getAppVersion } from "@/lib/pwa/app-version";

export const dynamic = "force-dynamic";

export function GET() {
  const version = getAppVersion();
  return Response.json(
    { version },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}
