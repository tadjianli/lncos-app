/** Identifiant de déploiement — synchronisé avec public/sw.js (scripts/generate-sw.mjs). */
export function getAppVersion(): string {
  return (
    process.env.NEXT_PUBLIC_APP_VERSION ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    "development"
  );
}
