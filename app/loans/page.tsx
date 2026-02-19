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
        .select('*, books(*), borrowers(*)')
        .eq('status', 'borrowed')
        .order('borrowed_date', { ascending: false });

      if (error) throw error;
      setLoans((data as LoanWithDetails[]) || []);
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

  if (authLoading || !user || !isApproved) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">{t('libraryLoading')}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{t('loanedBooksTitle')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('loanedBooksSubtitle')}</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center min-h-[280px] sm:min-h-[300px] text-gray-600 text-base sm:text-lg">
            {t('loadingLoanedBooks')}
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 sm:p-8 text-center">
            <p className="text-gray-600 text-base sm:text-lg">{t('noLoans')}</p>
            <Link href="/library" className="mt-4 inline-block text-blue-600 hover:underline min-h-[44px] flex items-center justify-center">
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
