import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Treat these as external — don't bundle through webpack on the server
  serverExternalPackages: ["pdfjs-dist", "pdf-parse"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
