import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet de compiler ailleurs que dans .next, pour ne pas écraser le dossier
  // d'un `next dev` en cours d'exécution.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typedRoutes: true,
  experimental: {
    serverActions: {
      // Photo compressée côté client (≤ 1200 px, JPEG) : on laisse de la marge.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
