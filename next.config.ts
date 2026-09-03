import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Server external packages - critical for MongoDB
  // This tells Next.js to not bundle these packages and treat them as external
  serverExternalPackages: [
    'mongoose',
    'mongodb',
    '@auth/mongodb-adapter',
    'next-auth',
    'bcryptjs',
  ],

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  poweredByHeader: false,

  // Empty turbopack config to silence warnings
  turbopack: {},
};

export default nextConfig;