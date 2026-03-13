'use client';

import { useState } from 'react';
import { supabase, Book } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

interface LendingFormProps {
  book: Book;
  onClose: () => void;
}

export default function LendingForm({ book, onClose }: LendingFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create a new borrower for this loan (same email can be used by multiple borrower records)
      const { data: newBorrower, error: borrowerError } = await supabase
        .from('borrowers')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        })
        .select('id')
        .single();

      if (borrowerError) throw borrowerError;
      const borrowerId = newBorrower.id;

      // Create loan record
      const { error: loanError } = await supabase
        .from('loans')
        .insert({
          book_id: book.id,
          borrower_id: borrowerId,
          borrowed_date: new Date().toISOString(),
          status: 'borrowed',
        });

      if (loanError) throw loanError;

      // Send borrow confirmation email (when they borrow)
      const borrowerName = [formData.firstName, formData.lastName].filter(Boolean).join(' ') || undefined;
      const borrowedDateIso = new Date().toISOString();
      try {
        const notifyRes = await fetch('/api/notify-borrower', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            bookTitle: book.title,
            borrowerName,
            template: 'borrow',
            borrowedDate: borrowedDateIso,
          }),
        });
        if (notifyRes.ok) {
          const data = await notifyRes.json();
          setNotificationSent(!!data.sent);
        }
      } catch (_) {
        // Don't fail the form if notification fails
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('errorProcessingLoan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-md w-full max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('lendBook')}</h2>
            <button
              type="button"
              onClick={onClose}
              className="touch-target w-10 h-10 shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xl"
              aria-label={t('authClose')}
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-900 text-sm sm:text-base">{book.title}</p>
            <p className="text-xs sm:text-sm text-gray-600">{t('by')} {book.author}</p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <p className="text-lg font-semibold text-gray-900">{t('bookLentSuccess')}</p>
              {notificationSent && (
                <p className="text-gray-600 mt-2">{t('confirmationSentToEmail')}</p>
              )}
              <p className="text-gray-600 mt-2">{t('formCloseAuto')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('firstName')} *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lastName')} *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('authEmail')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phoneNumber')} *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('address')}
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 min-h-[48px] px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('processing') : t('lendBook')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
