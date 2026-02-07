import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Allow large file uploads
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
