import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['fluent-ffmpeg', '@ffmpeg-installer/ffmpeg', 'canvas'],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;