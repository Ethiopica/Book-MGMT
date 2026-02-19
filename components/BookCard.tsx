'use client';

import { Book } from '@/lib/supabase';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageProvider';

interface BookCardProps {
  book: Book;
  status: 'available' | 'borrowed';
  daysOut: number;
  onClick: () => void;
}

export default function BookCard({ book, status, daysOut, onClick }: BookCardProps) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 active:scale-[0.98] sm:hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-0"
    >
      <div className="relative aspect-[2/3] bg-gray-200 overflow-hidden min-h-[120px]">
        {book.cover_image_url ? (
          <Image
            src={book.cover_image_url}
            alt={book.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
            <svg
              className="w-12 h-12 text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
            status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {status === 'available' ? t('available') : t('borrowed')}
        </span>
        {status === 'borrowed' && daysOut > 0 && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded">
            {daysOut}{t('daysOutShort')}
          </span>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h3 className="font-bold text-gray-900 line-clamp-2 text-xs sm:text-sm md:text-base">
          {book.title}
        </h3>
      </div>
    </button>
  );
}
