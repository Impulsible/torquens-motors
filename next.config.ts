/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Server external packages - critical for MongoDB
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

  // Webpack configuration to handle Node.js modules
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Don't resolve Node.js modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'fs/promises': false,
        'timers/promises': false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        path: false,
        os: false,
        util: false,
        assert: false,
        querystring: false,
        'mongodb-client-encryption': false,
        aws4: false,
        snappy: false,
        kerberos: false,
        '@mongodb-js/zstd': false,
      };
    }

    // Exclude MongoDB from client bundles
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        mongodb: 'mongodb',
        mongoose: 'mongoose',
        '@auth/mongodb-adapter': '@auth/mongodb-adapter',
        'mongodb-client-encryption': 'mongodb-client-encryption',
      });
    }

    return config;
  },
};

export default nextConfig;