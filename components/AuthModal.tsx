'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

type Mode = 'login' | 'signup';

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: Mode;
  onSuccess?: () => void;
}

export default function AuthModal({ onClose, defaultMode = 'login', onSuccess }: AuthModalProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('authPasswordsDoNotMatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('authPasswordMinLength'));
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onSuccess?.();
        onClose();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: fullName ? { data: { full_name: fullName } } : undefined,
        });
        if (signUpError) throw signUpError;
        setMessage(t('authCheckEmail'));
      }
    } catch (err: any) {
      setError(err.message || t('authSomethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 w-full max-h-[90vh] sm:max-h-none sm:rounded-2xl shadow-2xl sm:max-w-md overflow-y-auto rounded-t-2xl sm:rounded-b-2xl p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
            {mode === 'login' ? t('authLogIn') : t('authCreateAccount')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 text-xl"
            aria-label={t('authClose')}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('authFullName')}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
                placeholder={t('authYourName')}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('authEmail')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('authPassword')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
              placeholder="••••••••"
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('authConfirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
                placeholder="••••••••"
              />
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 rounded-xl font-semibold bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors text-base"
          >
            {loading ? t('authPleaseWait') : mode === 'login' ? t('authLogIn') : t('authCreateAccount')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              {t('authDontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                className="text-sky-600 hover:underline font-medium"
              >
                {t('authSignUp')}
              </button>
            </>
          ) : (
            <>
              {t('authAlreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setMessage(null); }}
                className="text-sky-600 hover:underline font-medium"
              >
                {t('authLogIn')}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
