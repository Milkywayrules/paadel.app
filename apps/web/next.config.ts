import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@paadel/ui", "@paadel/env", "@paadel/auth"],
};

export default nextConfig;
