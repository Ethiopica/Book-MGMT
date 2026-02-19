'use client';

import Image from 'next/image';
import type { Loan, Book, Borrower } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

type LoanWithDetails = Loan & { books: Book | null; borrowers: Borrower | null };

interface LoanDetailModalProps {
  loan: LoanWithDetails;
  daysOut: number;
  onClose: () => void;
  onMarkReturned: () => void;
  isReturning: boolean;
}

export default function LoanDetailModal({
  loan,
  daysOut,
  onClose,
  onMarkReturned,
  isReturning,
}: LoanDetailModalProps) {
  const { t } = useLanguage();
  const book = loan.books;
  const borrower = loan.borrowers;
  const borrowedDate = new Date(loan.borrowed_date).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Full cover image - shows entire picture (portrait or wide) with no cropping */}
          <div className="flex-shrink-0 flex justify-center sm:justify-start bg-gray-100 rounded-lg overflow-hidden">
            {book?.cover_image_url ? (
              <div className="relative w-[240px] sm:w-[280px] h-[340px] sm:h-[400px]">
                <Image
                  src={book.cover_image_url}
                  alt={book.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 240px, 280px"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-[240px] sm:w-[280px] h-[340px] sm:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                <span className="text-white text-sm font-medium">{t('noCover')}</span>
              </div>
            )}
          </div>
          {/* Loan and book information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 pr-10 sm:pr-8 break-words">
                {book?.title ?? t('unknownBook')}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 touch-target w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xl -mt-1"
                aria-label={t('authClose')}
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">{t('by')} {book?.author ?? '—'}</p>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 mb-4">
              {daysOut} {daysOut === 1 ? t('day') : t('days')} out
            </span>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>
                <span className="font-medium text-gray-700">{t('borrowedBy')}</span>{' '}
                {borrower ? `${borrower.first_name} ${borrower.last_name}` : '—'}
              </p>
              <p>
                <span className="font-medium text-gray-700">{t('authEmail')}:</span> {borrower?.email ?? '—'}
              </p>
              <p>
                <span className="font-medium text-gray-700">{t('phoneNumber')}:</span> {borrower?.phone ?? '—'}
              </p>
              <p>
                <span className="font-medium text-gray-700">{t('borrowedOn')}:</span> {borrowedDate}
              </p>
              {borrower?.address && (
                <p>
                  <span className="font-medium text-gray-700">{t('address')}:</span> {borrower.address}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onMarkReturned}
              disabled={isReturning}
              className="w-full min-h-[48px] sm:w-auto px-6 py-2.5 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isReturning ? t('updating') : t('markAsReturned')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
