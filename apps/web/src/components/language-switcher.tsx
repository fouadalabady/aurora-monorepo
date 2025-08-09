'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@workspace/ui';
import { Globe } from 'lucide-react';
import { type Locale } from '../i18n';


interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: Locale) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const getLanguageLabel = (locale: Locale) => {
    return locale === 'ar' ? 'العربية' : 'English';
  };

  const otherLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLanguage(otherLocale)}
      className={`flex items-center gap-2 ${className}`}
      aria-label={`Switch to ${getLanguageLabel(otherLocale)}`}
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {getLanguageLabel(otherLocale)}
      </span>
    </Button>
  );
}

export default LanguageSwitcher;