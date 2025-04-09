import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Build sırasında ESLint kontrolünü devre dışı bırak
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Build sırasında TypeScript hatalarını görmezden gel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;