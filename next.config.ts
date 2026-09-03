import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Server external packages - ONLY server-only backend libraries
  serverExternalPackages: [
    'mongoose',
    'mongodb',
    '@auth/mongodb-adapter',
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
  turbopack: {},
};

export default nextConfig;