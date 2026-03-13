'use client';

import { useState, useEffect } from 'react';
import { supabase, Borrower } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

interface EditBorrowerFormProps {
  borrower: Borrower;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBorrowerForm({ borrower, onClose, onSuccess }: EditBorrowerFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: borrower.first_name,
    lastName: borrower.last_name,
    email: borrower.email,
    phone: borrower.phone,
    address: borrower.address ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: borrower.first_name,
      lastName: borrower.last_name,
      email: borrower.email,
      phone: borrower.phone,
      address: borrower.address ?? '',
    });
  }, [borrower]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('borrowers')
        .update({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim() || null,
        })
        .eq('id', borrower.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || t('errorUpdatingBorrower'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl max-w-md w-full max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{t('editBorrowerTitle')}</h2>
            <button
              type="button"
              onClick={onClose}
              className="touch-target w-10 h-10 shrink-0 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 text-xl disabled:opacity-50"
              disabled={loading}
              aria-label={t('authClose')}
            >
              ×
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{t('borrowerUpdated')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="eb-firstName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('firstName')} *
                </label>
                <input
                  type="text"
                  id="eb-firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="eb-lastName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('lastName')} *
                </label>
                <input
                  type="text"
                  id="eb-lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="eb-email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('authEmail')} *
                </label>
                <input
                  type="email"
                  id="eb-email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="eb-phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('phoneNumber')} *
                </label>
                <input
                  type="tel"
                  id="eb-phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="eb-address" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('address')}
                </label>
                <textarea
                  id="eb-address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 min-h-[48px] px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 min-h-[48px] px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {loading ? t('saving') : t('saveChanges')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
