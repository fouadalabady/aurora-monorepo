import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, locale: string = 'en') {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'ar') {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function formatCurrency(amount: number, locale: string = 'en', currency: string = 'SAR') {
  if (locale === 'ar') {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatPhoneNumber(phone: string) {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format for Saudi Arabia numbers
  if (cleaned.startsWith('966')) {
    const number = cleaned.slice(3);
    return `+966 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
  }
  
  // Format for local numbers
  if (cleaned.length === 9 && cleaned.startsWith('5')) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}

export function getDirection(locale: string) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function isRTL(locale: string) {
  return locale === 'ar';
}

export function getTextAlign(locale: string) {
  return locale === 'ar' ? 'text-right' : 'text-left';
}

export function getFlexDirection(locale: string) {
  return locale === 'ar' ? 'flex-row-reverse' : 'flex-row';
}