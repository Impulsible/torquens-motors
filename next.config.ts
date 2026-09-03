/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Server external packages - critical for MongoDB and NextAuth
  serverExternalPackages: [
    'mongoose', 
    'mongodb', 
    '@auth/mongodb-adapter',
    'next-auth',
    'bcryptjs'
  ],

  // Turbopack configuration
  turbopack: {},

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
    qualities: [75, 90, 100],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        'child_process': false,
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
        'aws4': false,
        'snappy': false,
        'kerberos': false,
        '@mongodb-js/zstd': false,
      };
      
      // Ignore these modules on the client
      config.plugins = config.plugins || [];
      config.plugins.push(
        new (require('webpack').IgnorePlugin)({
          resourceRegExp: /^(fs|net|tls|dns|child_process|fs\/promises|timers\/promises|crypto|stream|http|https|zlib|url|path|os|util|assert|querystring|mongodb-client-encryption|aws4|snappy|kerberos|@mongodb-js\/zstd)$/,
        })
      );
    }
    return config;
  },
};

export default nextConfig;