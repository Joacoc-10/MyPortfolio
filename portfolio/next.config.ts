import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de optimización de imágenes de Next.js
  images: {
    // remotePatterns es la forma moderna de permitir dominios externos
    remotePatterns: [
      // Tu configuración existente para ImageKit
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
