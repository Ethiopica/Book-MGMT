'use client';

import { Book } from '@/lib/supabase';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageProvider';

interface RequestLoanBookModalProps {
  book: Book;
  onClose: () => void;
  onContinue: () => void;
}

export default function RequestLoanBookModal({ book, onClose, onContinue }: RequestLoanBookModalProps) {
  const { t } = useLanguage();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 break-words pr-2">
                {book.title}
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base mt-1">
                {t('by')} {book.author}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 touch-target w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 text-xl"
              aria-label={t('authClose')}
            >
              ×
            </button>
          </div>

          <div className="flex justify-center bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden mb-6">
            {book.cover_image_url ? (
              <div className="relative w-full max-w-[320px] aspect-[2/3] sm:max-w-[360px] sm:h-[480px]">
                <Image
                  src={book.cover_image_url}
                  alt={book.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 360px"
                  priority
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-full max-w-[320px] aspect-[2/3] sm:max-w-[360px] sm:h-[480px] flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                <span className="text-white text-sm font-medium">{t('noCover')}</span>
              </div>
            )}
          </div>

          {book.description && (
            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-6">
              {book.description}
            </p>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="w-full min-h-[48px] px-6 py-2.5 rounded-xl font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
          >
            {t('continueToRequestForm')}
          </button>
        </div>
      </div>
    </div>
  );
}
