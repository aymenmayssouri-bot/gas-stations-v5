import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Add production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Optimize images if you add any
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;