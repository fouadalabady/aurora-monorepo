import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

// Ensure this file is treated as a module
export {};

// Export the getRequestConfig function as a named export as well
export const getI18nConfig = getRequestConfig(async ({ requestLocale }) => {
  // This is the new API - await the requestLocale
  const locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'UTC',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        }
      },
      number: {
        precise: {
          maximumFractionDigits: 5
        }
      },
      list: {
        enumeration: {
          style: 'long',
          type: 'conjunction'
        }
      }
    }
  };
});

// Keep the default export for Next.js config
export default getI18nConfig;