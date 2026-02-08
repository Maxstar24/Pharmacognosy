import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Allow large file uploads
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
