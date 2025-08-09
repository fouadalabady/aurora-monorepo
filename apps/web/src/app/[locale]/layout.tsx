import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { locales, type Locale } from '../../i18n';
import LanguageSwitcher from '../../components/language-switcher';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: Omit<Props, 'children'>) {
  const { locale } = await params;
  return {
    title: {
      template: '%s | Aurora Services',
      default: 'Aurora Services - Professional Service Solutions'
    },
    description: locale === 'ar' 
      ? 'حلول خدمية مهنية يمكنك الوثوق بها - خدمات أورورا'
      : 'Professional service solutions you can trust - Aurora Services',
    keywords: locale === 'ar'
      ? 'خدمات, صيانة, إصلاح, تكييف, سباكة, كهرباء'
      : 'services, maintenance, repair, HVAC, plumbing, electrical',
    authors: [{ name: 'Aurora Services' }],
    creator: 'Aurora Services',
    publisher: 'Aurora Services',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      title: locale === 'ar' 
        ? 'خدمات أورورا - حلول خدمية مهنية'
        : 'Aurora Services - Professional Service Solutions',
      description: locale === 'ar'
        ? 'حلول خدمية مهنية يمكنك الوثوق بها'
        : 'Professional service solutions you can trust',
      siteName: 'Aurora Services',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'ar'
        ? 'خدمات أورورا - حلول خدمية مهنية'
        : 'Aurora Services - Professional Service Solutions',
      description: locale === 'ar'
        ? 'حلول خدمية مهنية يمكنك الوثوق بها'
        : 'Professional service solutions you can trust',
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'ar': '/ar',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl' : 'ltr'}>
      <body className={`${inter.className} ${isRTL ? 'font-arabic' : ''}`}>
        <NextIntlClientProvider messages={messages}>
          <header className="fixed top-0 right-0 z-50 p-4">
            <LanguageSwitcher />
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}