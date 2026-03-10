'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';

type PendingUser = { id: string; email: string; approved: boolean; created_at: string };

export default function AdminPage() {
  const { user, loading, isAdmin, session } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (!isAdmin) {
      router.replace('/');
      return;
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (!user || !isAdmin || !session?.access_token) return;
    const fetchPending = async () => {
      setLoadingList(true);
      try {
        const res = await fetch('/api/admin/pending-users', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPending(data);
        }
      } finally {
        setLoadingList(false);
      }
    };
    fetchPending();
  }, [user, isAdmin, session?.access_token]);

  const handleApprove = async (userId: string) => {
    if (!session?.access_token) return;
    setApprovingId(userId);
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) setPending((p) => p.filter((u) => u.id !== userId));
    } finally {
      setApprovingId(null);
    }
  };

  if (loading || !user || !isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">{t('libraryLoading')}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('adminTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">{t('adminSubtitle')}</p>

        {loadingList ? (
          <p className="text-slate-600 dark:text-slate-400">{t('loadingPendingUsers')}</p>
        ) : pending.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">{t('noPendingUsers')}</p>
        ) : (
          <ul className="space-y-3 max-w-xl">
            {pending.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{u.email}</span>
                <button
                  type="button"
                  onClick={() => handleApprove(u.id)}
                  disabled={approvingId === u.id}
                  className="shrink-0 px-4 py-2 rounded-lg font-semibold bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 disabled:opacity-50"
                >
                  {approvingId === u.id ? t('approving') : t('approve')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
