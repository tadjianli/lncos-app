import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    // All product images are local — served from /public/assets/
    // Add remote patterns here if CDN is added later.
    localPatterns: [
      { pathname: "/assets/**" },
    ],
  },
  experimental: {
    turbo: {
      // Pin workspace root to this project to avoid confusion from
      // a stray package-lock.json in the parent directory.
      root: path.resolve(__dirname),
    },
  },
};

export default nextConfig;
