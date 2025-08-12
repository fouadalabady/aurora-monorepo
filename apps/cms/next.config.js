/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables for middleware
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Transpile workspace packages
  transpilePackages: [
    '@workspace/ui',
    '@workspace/core',
    '@workspace/database',
    '@workspace/auth',
    '@workspace/search',
    '@workspace/analytics',
    '@workspace/config',
  ],
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  // Webpack configuration for aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@cms': require('path').resolve(__dirname, 'src'),
    }
    return config
  },
}

module.exports = nextConfig