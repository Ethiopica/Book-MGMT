'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import BookList from '@/components/BookList';

export default function LibraryPage() {
  const { user, loading, isApproved } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (!isApproved) {
      router.replace('/?pending=1');
      return;
    }
  }, [user, loading, isApproved, router]);

  if (loading || !user || !isApproved) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-gray-600 dark:text-slate-400">{t('libraryLoading')}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-1 sm:mb-2">{t('libraryTitle')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">{t('librarySubtitle')}</p>
        </header>
        <BookList />
      </div>
    </main>
  );
}
