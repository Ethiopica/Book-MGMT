'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Locale, getT } from '@/lib/i18n';

const STORAGE_KEY = 'churchbook-locale';

type TFunc = ReturnType<typeof getT>;

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunc;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'am' || stored === 'en') return stored;
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setMounted(true);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
  };

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale === 'am' ? 'am' : 'en';
    document.documentElement.dir = locale === 'am' ? 'ltr' : 'ltr';
  }, [locale, mounted]);

  const t = getT(locale);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
