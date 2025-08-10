import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Locale detection strategy
  localeDetection: true,

  // Locale prefix strategy
  localePrefix: 'always',

  // Alternate links for SEO
  alternateLinks: true,

  // Pathname localization
  pathnames: {
    '/': '/',
    '/services': {
      en: '/services',
      ar: '/خدمات'
    },
    '/about': {
      en: '/about',
      ar: '/حول'
    },
    '/contact': {
      en: '/contact',
      ar: '/اتصل'
    },
    '/projects': {
      en: '/projects',
      ar: '/مشاريع'
    },
    '/testimonials': {
      en: '/testimonials',
      ar: '/شهادات'
    }
  }
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match root path
    '/',
    // Match localized paths
    '/(ar|en)/:path*',
    // Match all paths except Next.js internals and static assets
    '/((?!api|_next|_vercel|favicon.ico|sitemap.xml|robots.txt|.*\\.).*)',
  ]
};