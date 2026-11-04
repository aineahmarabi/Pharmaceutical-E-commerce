import type { NextConfig } from 'next';

// Baseline browser protections for every response. (A strict Content-Security-Policy
// is a worthwhile follow-up, but it needs testing against Convex and the image hosts.)
const securityHeaders = [
  // Stop the site being embedded in other pages (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop browsers guessing file types (blocks some upload-based attacks).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Do not leak full URLs (order numbers, search terms) to other sites.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Camera is only needed by the POS barcode scanner on our own pages.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=()' },
  // Always use HTTPS once a browser has seen the site over HTTPS.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
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
