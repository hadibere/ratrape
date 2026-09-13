import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet de compiler ailleurs que dans .next, pour ne pas écraser le dossier
  // d'un `next dev` en cours d'exécution.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typedRoutes: true,
  images: {
    /**
     * Les photos viennent du stockage Supabase, jamais d'une adresse fournie
     * par un visiteur. On restreint au projet courant quand son adresse est
     * connue au démarrage ; sinon on accepte tout projet Supabase, sur le seul
     * chemin des fichiers publics. Sans ce repli, un serveur lancé avant que la
     * variable existe refuse toutes les photos et fait planter la page.
     */
    remotePatterns: [
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/**`)
        : {
            protocol: "https" as const,
            hostname: "*.supabase.co",
            pathname: "/storage/v1/object/public/**",
          },
    ],
  },
  experimental: {
    serverActions: {
      // Photo compressée côté client (≤ 1200 px, JPEG) : on laisse de la marge.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
