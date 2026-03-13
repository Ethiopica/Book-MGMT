'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, Book, Loan, Borrower } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';

type LoanWithBorrower = Loan & { borrower?: Borrower | null };

function escapeCsvCell(s: string): string {
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildSummaryCsv(
  books: Book[],
  loansWithBorrowers: LoanWithBorrower[],
  t: (key: string) => string
): string {
  const headers = [
    t('csvTitle'),
    t('csvAuthor'),
    t('csvIsbn'),
    t('csvStatus'),
    t('csvBorrowerName'),
    t('csvBorrowerEmail'),
    t('csvBorrowerPhone'),
    t('csvBorrowedDate'),
    t('csvDaysOut'),
  ];
  const rows = books.map((book) => {
    const loan = loansWithBorrowers.find((l) => l.book_id === book.id && l.status === 'borrowed');
    const borrower = loan?.borrower;
    const status = loan ? t('borrowed') : t('available');
    const borrowedDate = loan ? new Date(loan.borrowed_date).toLocaleDateString() : '';
    const daysOut = loan
      ? Math.floor(
          (Date.now() - new Date(loan.borrowed_date).getTime()) / (1000 * 60 * 60 * 24)
        )
      : '';
    const borrowerName = borrower
      ? [borrower.first_name, borrower.last_name].filter(Boolean).join(' ')
      : '';
    return [
      escapeCsvCell(book.title ?? ''),
      escapeCsvCell(book.author ?? ''),
      escapeCsvCell(book.isbn ?? ''),
      escapeCsvCell(status),
      escapeCsvCell(borrowerName),
      escapeCsvCell(borrower?.email ?? ''),
      escapeCsvCell(borrower?.phone ?? ''),
      escapeCsvCell(borrowedDate),
      String(daysOut),
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\r\n');
}

export default function SummaryPage() {
  const { user, loading: authLoading, isApproved } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (!isApproved) {
      router.replace('/?pending=1');
      return;
    }
  }, [user, authLoading, isApproved, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, loansRes] = await Promise.all([
        supabase.from('books').select('*').order('title'),
        supabase.from('loans').select('*').eq('status', 'borrowed'),
      ]);
      if (booksRes.error) throw booksRes.error;
      if (loansRes.error) throw loansRes.error;
      setBooks(booksRes.data || []);
      setLoans(loansRes.data || []);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setBooks([]);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || !isApproved) return;
    fetchData();
  }, [authLoading, user, isApproved]);

  const borrowedBookIds = new Set(loans.map((l) => l.book_id));
  const totalBooks = books.length;
  const loanedCount = borrowedBookIds.size;
  const availableCount = totalBooks - loanedCount;

  const handleExportSpreadsheet = async () => {
    if (!books.length) return;
    setExporting(true);
    try {
      const { data: loansData, error } = await supabase
        .from('loans')
        .select('*, borrower:borrowers(*)')
        .eq('status', 'borrowed');
      if (error) throw error;
      const loansWithBorrowers: LoanWithBorrower[] = (loansData || []).map((row: any) => ({
        ...row,
        borrower: row.borrower ?? row.borrowers ?? null,
      }));
      const csv = buildSummaryCsv(books, loansWithBorrowers, t);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `book-summary-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (authLoading || !user || !isApproved) {
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-1 sm:mb-2">
            {t('summaryTitle')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">{t('summarySubtitleOnly')}</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px] text-gray-600 dark:text-slate-400">
            {t('loadingBooks')}
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 sm:p-5 border border-gray-100 dark:border-slate-700">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{t('totalBooks')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">{totalBooks}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 sm:p-5 border border-gray-100 dark:border-slate-700">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{t('availableBooks')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{availableCount}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 sm:p-5 border border-gray-100 dark:border-slate-700">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{t('loanedBooksSummary')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">{loanedCount}</p>
              </div>
            </div>

            {/* Download CSV + link to Library */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleExportSpreadsheet}
                disabled={exporting || books.length === 0}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exporting ? t('exportingCsv') : t('downloadSpreadsheet')}
              </button>
              <Link
                href="/library"
                className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline min-h-[48px] flex items-center"
              >
                {t('navLibrary')}
              </Link>
            </div>

            {books.length === 0 && (
              <p className="mt-6 text-gray-500 dark:text-slate-400 text-sm">
                {t('noBooks')} <Link href="/library" className="text-sky-600 dark:text-sky-400 hover:underline">{t('navLibrary')}</Link>
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
