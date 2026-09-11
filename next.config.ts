import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    serverActions: {
      // Photo compressée côté client (≤ 1200 px, JPEG) : on laisse de la marge.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
