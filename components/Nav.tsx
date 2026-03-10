'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import AuthModal from '@/components/AuthModal';

const navLinkClass = (active: boolean) =>
  `block w-full py-3 px-4 text-left font-semibold rounded-lg transition-colors ${
    active
      ? 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  }`;

export default function Nav() {
  const pathname = usePathname();
  const { user, loading, signOut, isApproved, isAdmin } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const { resolved, setTheme } = useTheme();
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-20 border-b border-sky-200/60 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14 gap-2">
            <Link
              href="/"
              className={`font-semibold text-base sm:text-lg truncate min-w-0 ${
                pathname === '/' ? 'text-sky-700 dark:text-sky-300' : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {t('navHome')}
            </Link>

            {/* Desktop: theme + language + inline links + auth */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <button
                type="button"
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                className="touch-target p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {resolved === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50/80 dark:bg-slate-800/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${locale === 'en' ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('am')}
                  className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${locale === 'am' ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                  አማ
                </button>
              </div>
              {user && isApproved && (
                <>
                  <Link
                    href="/library"
                    className={`font-semibold text-sm lg:text-base whitespace-nowrap ${
                      pathname === '/library' ? 'text-sky-700 dark:text-sky-300' : 'text-gray-700 dark:text-gray-300 hover:text-sky-700 dark:hover:text-sky-300'
                    }`}
                  >
                    {t('navLibrary')}
                  </Link>
                  <Link
                    href="/loans"
                    className={`font-semibold text-sm lg:text-base whitespace-nowrap ${
                      pathname === '/loans' ? 'text-sky-700 dark:text-sky-300' : 'text-gray-700 dark:text-gray-300 hover:text-sky-700 dark:hover:text-sky-300'
                    }`}
                  >
                    {t('navLoanedBooks')}
                  </Link>
                </>
              )}
              {user && isAdmin && (
                <Link
                  href="/admin"
                  className={`font-semibold text-sm lg:text-base whitespace-nowrap ${
                    pathname === '/admin' ? 'text-sky-700 dark:text-sky-300' : 'text-gray-700 dark:text-gray-300 hover:text-sky-700 dark:hover:text-sky-300'
                  }`}
                >
                  {t('navAdmin')}
                </Link>
              )}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[100px] lg:max-w-[180px]"
                      title={user.email}
                    >
                      {user.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="touch-target min-w-0 py-2 px-3 rounded-lg text-sm font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30"
                    >
                      {t('navSignOut')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthModal('login')}
                      className="touch-target min-w-0 py-2 px-3 rounded-lg text-sm font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30"
                    >
                      {t('navLogIn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthModal('signup')}
                      className="touch-target min-w-0 py-2 px-4 rounded-lg text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
                    >
                      {t('navCreateAccount')}
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Mobile: hamburger */}
            <div className="flex md:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                className="touch-target p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
                aria-label={resolved === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {resolved === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {!loading && user && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px] mr-1" title={user.email}>
                  {user.email}
                </span>
              )}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="touch-target flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 aria-expanded:bg-gray-100 dark:aria-expanded:bg-gray-800"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? t('navCloseMenu') : t('navOpenMenu')}
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-amber-200/60 dark:border-slate-700 shadow-lg md:hidden max-h-[calc(100vh-3rem)] overflow-y-auto"
            role="dialog"
            aria-label="Menu"
          >
            <div className="container mx-auto px-3 py-4 space-y-1">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-slate-700 mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Language:</span>
                <button
                  type="button"
                  onClick={() => { setLocale('en'); closeMenu(); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${locale === 'en' ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => { setLocale('am'); closeMenu(); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${locale === 'am' ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  አማርኛ
                </button>
              </div>
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-slate-700 mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Theme:</span>
                <button
                  type="button"
                  onClick={() => { setTheme('light'); closeMenu(); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${resolved === 'light' ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => { setTheme('dark'); closeMenu(); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${resolved === 'dark' ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  Dark
                </button>
              </div>
              <Link href="/" className={navLinkClass(pathname === '/')} onClick={closeMenu}>
                {t('navHome')}
              </Link>
              {user && isApproved && (
                <>
                  <Link href="/library" className={navLinkClass(pathname === '/library')} onClick={closeMenu}>
                    {t('navLibrary')}
                  </Link>
                  <Link href="/loans" className={navLinkClass(pathname === '/loans')} onClick={closeMenu}>
                    {t('navLoanedBooks')}
                  </Link>
                </>
              )}
              {user && isAdmin && (
                <Link href="/admin" className={navLinkClass(pathname === '/admin')} onClick={closeMenu}>
                  {t('navAdmin')}
                </Link>
              )}
              {!loading && (
                user ? (
                  <button
                    type="button"
                    onClick={() => { closeMenu(); signOut(); }}
                    className={navLinkClass(false)}
                  >
                    {t('navSignOut')}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setAuthModal('login'); closeMenu(); }}
                      className={navLinkClass(false)}
                    >
                      {t('navLogIn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthModal('signup'); closeMenu(); }}
                      className="w-full py-3 px-4 text-left font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
                    >
                      {t('navCreateAccount')}
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </nav>
      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={() => setAuthModal(null)}
        />
      )}
    </>
  );
}
