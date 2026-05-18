'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase, Book, Loan } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';
import BookCard from '@/components/BookCard';

export default function RequestLoanPage() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    bookId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [booksRes, loansRes] = await Promise.all([
          supabase.from('books').select('*').order('title'),
          supabase.from('loans').select('*').eq('status', 'borrowed'),
        ]);
        if (booksRes.error) throw booksRes.error;
        if (loansRes.error) throw loansRes.error;
        setBooks(booksRes.data || []);
        setLoans(loansRes.data || []);
      } catch (err) {
        console.error('Failed to load request form data:', err);
        setBooks([]);
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableBooks = useMemo(() => {
    const borrowed = new Set(loans.map((l) => l.book_id));
    return books.filter((b) => !borrowed.has(b.id));
  }, [books, loans]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setFormData((prev) => ({ ...prev, bookId: book.id }));
    setError(null);
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setFormData((prev) => ({ ...prev, bookId: '' }));
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/lending-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || t('errorSubmittingLoanRequest'));
      setSuccess(true);
      setSelectedBook(null);
      setFormData({
        bookId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errorSubmittingLoanRequest');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const showForm = selectedBook !== null;
  const containerMaxWidth = showForm ? 'max-w-2xl' : 'max-w-6xl';

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className={`container mx-auto px-3 py-6 sm:px-4 sm:py-8 ${containerMaxWidth}`}>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            {t('loanRequestTitle')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
            {showForm ? t('loanRequestSubtitle') : t('loanRequestPickBook')}
          </p>
        </header>

        {loading ? (
          <p className="text-gray-600 dark:text-slate-400">{t('loadingBooks')}</p>
        ) : success ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6 text-center py-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{t('loanRequestSubmitted')}</p>
            <p className="text-gray-600 dark:text-slate-400 mt-2">{t('loanRequestSubmittedNote')}</p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-6 min-h-[48px] px-6 rounded-xl font-semibold bg-sky-600 text-white hover:bg-sky-700"
            >
              {t('backToBookSelection')}
            </button>
          </div>
        ) : showForm ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
            <button
              type="button"
              onClick={handleBackToBooks}
              className="mb-4 text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline min-h-[44px]"
            >
              ← {t('backToBookSelection')}
            </button>

            <div className="flex gap-4 mb-6 p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700">
              <div className="relative w-20 shrink-0 aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden">
                {selectedBook.cover_image_url ? (
                  <Image
                    src={selectedBook.cover_image_url}
                    alt={selectedBook.title}
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">{t('chooseBook')}</p>
                <p className="font-bold text-gray-900 dark:text-slate-100 text-lg leading-tight">{selectedBook.title}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{selectedBook.author}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="bookId" value={formData.bookId} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {t('firstName')} *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {t('lastName')} *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {t('authEmail')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {t('phoneNumber')} *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('address')}
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('requestNotes')}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t('requestNotesPlaceholder')}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl font-semibold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('submittingLoanRequest') : t('submitLoanRequest')}
              </button>
            </form>
          </div>
        ) : availableBooks.length === 0 ? (
          <p className="text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
            {t('noBooksAvailableToRequest')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {availableBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                status="available"
                daysOut={0}
                onClick={() => handleSelectBook(book)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
