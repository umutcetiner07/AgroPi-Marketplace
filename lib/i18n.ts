export type Locale = 'tr' | 'en'
export const SUPPORTED_LOCALES: Locale[] = ['tr', 'en']
export const DEFAULT_LOCALE: Locale = 'tr'

export interface LocaleContent {
  [key: string]: {
    tr: string
    en: string
  }
}

export const translations: Record<Locale, Record<string, string>> = {
  tr: {
    'site.title': 'AgroPi Smart Farming',
    'site.description': 'Pi Network üzerinden yapay zeka destekli akıllı tarım yönetim platformu. Topraksız tarım çözümleri.',
    'nav.home': 'Ana Sayfa',
    'nav.products': 'Ürünler',
    'nav.categories': 'Kategoriler',
    'nav.blog': 'Blog',
    'nav.dashboard': 'Panel',
    'hero.title': 'Tarımın Geleceği Pi Network\'de',
    'hero.subtitle': 'Yapay zeka destekli topraksız tarım çözümleriyle tanışın',
    'hero.cta': 'Başlayın',
    'connect.wallet': 'Cüzdanı Bağla',
    'connect.loading': 'Bağlanıyor...',
    'connect.connected': 'Bağlı',
    'footer.rights': 'Tüm hakları saklıdır.',
  },
  en: {
    'site.title': 'AgroPi Smart Farming',
    'site.description': 'AI-powered smart farming management platform on Pi Network. Soilless farming solutions.',
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.blog': 'Blog',
    'nav.dashboard': 'Dashboard',
    'hero.title': 'The Future of Farming on Pi Network',
    'hero.subtitle': 'Discover AI-powered soilless farming solutions',
    'hero.cta': 'Get Started',
    'connect.wallet': 'Connect Wallet',
    'connect.loading': 'Connecting...',
    'connect.connected': 'Connected',
    'footer.rights': 'All rights reserved.',
  }
}

export function getTranslation(locale: Locale, key: string): string {
  return translations[locale]?.[key] || translations.tr[key] || key
}

export function getLocalizedUrl(path: string, locale: Locale): string {
  if (locale === 'tr') {
    return path
  }
  return `/${locale}${path}`
}

export function getAlternateUrls(path: string): Record<Locale, string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agropi-smart-farming.vercel.app'
  
  return {
    tr: `${baseUrl}${path}`,
    en: `${baseUrl}/en${path}`,
  }
}
