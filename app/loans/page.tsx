'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Loan, Book, Borrower } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LoanCard from '@/components/LoanCard';
import LoanDetailModal from '@/components/LoanDetailModal';

type LoanWithDetails = Loan & { books: Book | null; borrowers: Borrower | null };

export default function LoansPage() {
  const { user, loading: authLoading, isApproved } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [detailLoan, setDetailLoan] = useState<LoanWithDetails | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingAllResult, setSendingAllResult] = useState<'ok' | 'some_failed' | null>(null);

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

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .select('*, books(*), borrower:borrowers(*)')
        .eq('status', 'borrowed')
        .order('borrowed_date', { ascending: false });

      if (error) throw error;
      // Normalize: API returns borrower (alias); we use borrowers in type for compatibility
      const normalized = (data || []).map((row: any) => ({
        ...row,
        borrowers: row.borrower ?? row.borrowers ?? null,
      }));
      setLoans(normalized as LoanWithDetails[]);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch after auth is ready to avoid lock timeout and RLS errors
  useEffect(() => {
    if (authLoading || !user || !isApproved) return;
    fetchLoans();
  }, [authLoading, user, isApproved]);

  const getDaysOut = (borrowedDate: string) => {
    const start = new Date(borrowedDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleMarkReturned = async (loanId: string) => {
    setReturningId(loanId);
    try {
      const { error } = await supabase
        .from('loans')
        .update({
          status: 'returned',
          return_date: new Date().toISOString(),
        })
        .eq('id', loanId);

      if (error) throw error;
      setDetailLoan(null);
      await fetchLoans();
    } catch (err) {
      console.error('Error marking as returned:', err);
    } finally {
      setReturningId(null);
    }
  };

  const handleSendRemindersToAll = async () => {
    if (!loans.length || sendingAll) return;
    setSendingAll(true);
    setSendingAllResult(null);

    // Collect unique borrower emails from current loans
    const emails = Array.from(
      new Set(
        loans
          .map((loan) => loan.borrowers?.email?.trim())
          .filter((e): e is string => !!e)
      )
    );

    if (!emails.length) {
      setSendingAll(false);
      return;
    }

    let anyFailed = false;

    for (const email of emails) {
      // Use the first loan that matches this email to get a book title and name
      const sampleLoan = loans.find((loan) => loan.borrowers?.email?.trim() === email);
      const bookTitle = sampleLoan?.books?.title ?? '';
      const borrowerName = sampleLoan
        ? [sampleLoan.borrowers?.first_name, sampleLoan.borrowers?.last_name].filter(Boolean).join(' ')
        : undefined;

      try {
        const res = await fetch('/api/notify-borrower', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            bookTitle: bookTitle || 'Library book',
            borrowerName,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!(res.ok && data.sent)) {
          anyFailed = true;
        }
      } catch {
        anyFailed = true;
      }
    }

    if (anyFailed) {
      setSendingAllResult('some_failed');
    } else {
      setSendingAllResult('ok');
    }

    setSendingAll(false);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-1 sm:mb-2">
                {t('loanedBooksTitle')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
                {t('loanedBooksSubtitle')}
              </p>
            </div>
            {loans.length > 0 && (
              <div className="flex flex-col items-stretch sm:items-end gap-2">
                {sendingAllResult === 'ok' && (
                  <p className="text-sm text-green-600">{t('remindersAllOk')}</p>
                )}
                {sendingAllResult === 'some_failed' && (
                  <p className="text-sm text-amber-700">{t('remindersAllSomeFailed')}</p>
                )}
                <button
                  type="button"
                  onClick={handleSendRemindersToAll}
                  disabled={sendingAll || !loans.length}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingAll ? t('sendingRemindersAll') : t('sendRemindersAll')}
                </button>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center min-h-[280px] sm:min-h-[300px] text-gray-600 dark:text-slate-400 text-base sm:text-lg">
            {t('loadingLoanedBooks')}
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 sm:p-8 text-center">
            <p className="text-gray-600 dark:text-slate-400 text-base sm:text-lg">{t('noLoans')}</p>
            <Link href="/library" className="mt-4 inline-block text-blue-600 dark:text-sky-400 hover:underline min-h-[44px] flex items-center justify-center">
              {t('browseLibrary')}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {loans.map((loan) => {
                const book = loan.books;
                const daysOut = getDaysOut(loan.borrowed_date);
                return (
                  <LoanCard
                    key={loan.id}
                    title={book?.title ?? t('unknownBook')}
                    coverImageUrl={book?.cover_image_url}
                    daysOut={daysOut}
                    onClick={() => setDetailLoan(loan)}
                  />
                );
              })}
            </div>

            {detailLoan && (
              <LoanDetailModal
                loan={detailLoan}
                daysOut={getDaysOut(detailLoan.borrowed_date)}
                onClose={() => setDetailLoan(null)}
                onMarkReturned={() => handleMarkReturned(detailLoan.id)}
                isReturning={returningId === detailLoan.id}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
