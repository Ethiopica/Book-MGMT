'use client';

import { useState } from 'react';
import { Book } from '@/lib/supabase';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageProvider';

interface BookDetailModalProps {
  book: Book;
  status: 'available' | 'borrowed';
  daysOut: number;
  onClose: () => void;
  onLend: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function BookDetailModal({
  book,
  status,
  daysOut,
  onClose,
  onLend,
  onEdit,
  onDelete,
  isDeleting = false,
}: BookDetailModalProps) {
  const { t } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
            {book.cover_image_url ? (
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
          {/* Book information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 pr-10 sm:pr-8 break-words">{book.title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 touch-target w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xl -mt-1"
                aria-label={t('authClose')}
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">{t('by')} {book.author}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {status === 'available' ? t('available') : t('borrowed')}
              </span>
              {status === 'borrowed' && daysOut > 0 && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                  {daysOut} {daysOut === 1 ? t('day') : t('days')} out
                </span>
              )}
            </div>
            {book.isbn && (
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">{t('isbn')}:</span> {book.isbn}
              </p>
            )}
            {book.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{book.description}</p>
            )}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                type="button"
                onClick={onLend}
                disabled={status === 'borrowed'}
                className={`min-h-[48px] w-full sm:w-auto flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold transition-colors ${
                  status === 'available'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {status === 'available' ? t('lendThisBook') : t('currentlyBorrowed')}
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="min-h-[48px] w-full sm:w-auto flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
              >
                {t('editBook')}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="min-h-[48px] w-full sm:w-auto flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
              >
                {t('deleteBook')}
              </button>
            </div>
            {showDeleteConfirm && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium mb-2">
                  {t('deleteConfirm', { title: book.title })}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg font-medium bg-white border border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      onDelete();
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? t('deleting') : t('yesDelete')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
