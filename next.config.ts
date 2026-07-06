import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'zany-opossum-910.eu-west-1.convex.cloud' },
      { protocol: 'https', hostname: 'zany-opossum-910.eu-west-1.convex.site' },
      { protocol: 'https', hostname: 't2.gstatic.com' },
    ],
    unoptimized: false,
  },
};

export default nextConfig;

