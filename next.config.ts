import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All product images are local — served from /public/assets/
    // Add remote patterns here if CDN is added later.
    localPatterns: [
      { pathname: "/assets/**" },
    ],
  },
};

export default nextConfig;
