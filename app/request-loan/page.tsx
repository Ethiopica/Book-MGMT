'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase, Book, Loan } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

export default function RequestLoanPage() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setFormData({
        bookId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err?.message || t('errorSubmittingLoanRequest'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t('loanRequestTitle')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">{t('loanRequestSubtitle')}</p>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
          {loading ? (
            <p className="text-gray-600 dark:text-slate-400">{t('loadingBooks')}</p>
          ) : success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{t('loanRequestSubmitted')}</p>
              <p className="text-gray-600 dark:text-slate-400 mt-2">{t('loanRequestSubmittedNote')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('chooseBook')} *
                </label>
                <select
                  id="bookId"
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value="">{t('selectBookPlaceholder')}</option>
                  {availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.author}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('firstName')} *</label>
                  <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('lastName')} *</label>
                  <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('authEmail')} *</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('phoneNumber')} *</label>
                  <input id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100" />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('address')}</label>
                <textarea id="address" name="address" rows={3} value={formData.address} onChange={handleChange} className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('requestNotes')}</label>
                <textarea id="notes" name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder={t('requestNotesPlaceholder')} className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100" />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || availableBooks.length === 0}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl font-semibold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('submittingLoanRequest') : t('submitLoanRequest')}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
