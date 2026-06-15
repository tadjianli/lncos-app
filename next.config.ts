import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const appVersion =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/videos",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/videos/:slug*",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/beaute/videos",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/beaute/videos/:slug*",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/admin/beauty-videos",
        destination: "/admin/content-pages",
        permanent: false,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_ENABLE_VIP_PROGRAM:
      process.env.NEXT_PUBLIC_ENABLE_VIP_PROGRAM ??
      process.env.ENABLE_VIP_PROGRAM ??
      "false",
    ENABLE_VIP_PROGRAM:
      process.env.ENABLE_VIP_PROGRAM ??
      process.env.NEXT_PUBLIC_ENABLE_VIP_PROGRAM ??
      "false",
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
