/**
 * Production environment validation — server-side only.
 * Never log or return secret values.
 */

export type EnvVarSpec = {
  key: string;
  required: boolean;
  /** Exposed to browser bundles when prefixed NEXT_PUBLIC_ */
  clientSafe: boolean;
  /** Alias names accepted in Vercel */
  aliases?: string[];
};

export const PRODUCTION_ENV_SPECS: EnvVarSpec[] = [
  { key: "NEXT_PUBLIC_SITE_URL", required: true, clientSafe: true },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    clientSafe: true,
    aliases: ["SUPABASE_URL"],
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    clientSafe: true,
    aliases: ["SUPABASE_ANON_KEY"],
  },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: true, clientSafe: false },
  { key: "STRIPE_SECRET_KEY", required: true, clientSafe: false },
  { key: "STRIPE_WEBHOOK_SECRET", required: true, clientSafe: false },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: true, clientSafe: true },
  { key: "RESEND_API_KEY", required: true, clientSafe: false },
  { key: "RESEND_FROM", required: true, clientSafe: false },
  { key: "NEXT_PUBLIC_VAPID_PUBLIC_KEY", required: true, clientSafe: true, aliases: ["VAPID_PUBLIC_KEY"] },
  { key: "VAPID_PRIVATE_KEY", required: true, clientSafe: false },
];

function readEnv(key: string): string {
  return (process.env[key] ?? "").trim();
}

function resolveEnvValue(spec: EnvVarSpec): string {
  const direct = readEnv(spec.key);
  if (direct) return direct;
  for (const alias of spec.aliases ?? []) {
    const v = readEnv(alias);
    if (v) return v;
  }
  return "";
}

export type EnvCheckResult = {
  key: string;
  required: boolean;
  clientSafe: boolean;
  status: "ok" | "missing" | "empty";
};

export function checkProductionEnv(): EnvCheckResult[] {
  return PRODUCTION_ENV_SPECS.map((spec) => {
    const value = resolveEnvValue(spec);
    let status: EnvCheckResult["status"] = "ok";
    if (!value) {
      status = process.env[spec.key] !== undefined || (spec.aliases ?? []).some((a) => process.env[a] !== undefined)
        ? "empty"
        : "missing";
    }
    return {
      key: spec.key,
      required: spec.required,
      clientSafe: spec.clientSafe,
      status,
    };
  });
}

export function getEnvHealthSummary() {
  const checks = checkProductionEnv();
  const required = checks.filter((c) => c.required);
  const missingRequired = required.filter((c) => c.status !== "ok");
  const leakedServerKeys = [
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_RESEND_API_KEY",
    "NEXT_PUBLIC_VAPID_PRIVATE_KEY",
  ].filter((key) => readEnv(key));

  return {
    ok: missingRequired.length === 0 && leakedServerKeys.length === 0,
    checks,
    missingRequired: missingRequired.map((c) => c.key),
    emptyRequired: required.filter((c) => c.status === "empty").map((c) => c.key),
    leakedServerKeys,
  };
}
