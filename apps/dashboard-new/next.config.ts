import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ==========================================================
  // PERFORMANCE OPTIMIZATIONS
  // ==========================================================

  // Standalone output für Docker (kleinere Images)
  output: "standalone",

  // Turbopack für schnelleres Development (bereits aktiv via --turbopack)
  experimental: {
    // Optimized Package Imports - lädt nur was gebraucht wird
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@tabler/icons-react",
      "date-fns",
      "recharts",
    ],
  },

  // Bilder optimieren
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.slingacademy.com",
        port: "",
      },
    ],
  },

  // Transpile Packages
  transpilePackages: ["geist"],

  // Kompression
  compress: true,

  // Powered-by Header entfernen (Security)
  poweredByHeader: false,

  // Strict Mode für bessere Fehlerbehandlung
  reactStrictMode: true,

  // ==========================================================
  // BUILD OPTIMIZATIONS
  // ==========================================================

  // ESLint im Build überspringen (Biome macht das)
  eslint: { ignoreDuringBuilds: true },

  // Webpack Optimierungen
  webpack: (config, { isServer }) => {
    // Keine Source Maps in Production
    if (!isServer && process.env.NODE_ENV === "production") {
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
