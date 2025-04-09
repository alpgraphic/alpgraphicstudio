import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Build sırasında ESLint kontrolünü devre dışı bırak
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;