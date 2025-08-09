/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

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
    domains: ['localhost', 'trae-api-sg.mchost.guru'],
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
      '@': require('path').resolve(__dirname, './src'),
    };
    return config;
  },
};

module.exports = withNextIntl(nextConfig);