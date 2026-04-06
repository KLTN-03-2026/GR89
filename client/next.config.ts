import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Bỏ qua Next.js image optimization
  },
};

export default nextConfig;