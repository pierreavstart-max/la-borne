import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['fluent-ffmpeg', '@ffmpeg-installer/ffmpeg', 'canvas'],
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export default nextConfig;