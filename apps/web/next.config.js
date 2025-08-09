/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'trae-api-sg.mchost.guru',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  transpilePackages: [
    '@workspace/ui',
    '@workspace/core',
    '@workspace/database',
    '@workspace/auth',
    '@workspace/search',
    '@workspace/analytics',
    '@workspace/config'
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);