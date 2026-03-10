'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'churchbook-theme';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function getStored(): Theme {
  if (typeof window === 'undefined') return 'system';
  const s = localStorage.getItem(STORAGE_KEY);
  if (s === 'light' || s === 'dark' || s === 'system') return s;
  return 'system';
}

function getResolved(theme: Theme): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getStored());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const r = getResolved(theme);
    setResolved(r);
    document.documentElement.classList.toggle('dark', r === 'dark');
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted || theme !== 'system') return;
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = m.matches ? 'dark' : 'light';
      setResolved(r);
      document.documentElement.classList.toggle('dark', r === 'dark');
    };
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, [mounted, theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
