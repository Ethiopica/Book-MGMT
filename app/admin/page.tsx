'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';

type PendingUser = { id: string; email: string; approved: boolean; created_at: string };
type PendingLendingRequest = {
  id: string;
  book_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  books?: { title?: string; author?: string } | null;
};

export default function AdminPage() {
  const { user, loading, isAdmin, session } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [requests, setRequests] = useState<PendingLendingRequest[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);

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

    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const res = await fetch('/api/admin/lending-requests', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchPending();
    fetchRequests();
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

  const handleApproveRequest = async (requestId: string) => {
    if (!session?.access_token) return;
    setApprovingRequestId(requestId);
    try {
      const res = await fetch('/api/admin/lending-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) setRequests((r) => r.filter((x) => x.id !== requestId));
    } finally {
      setApprovingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!session?.access_token) return;
    setRejectingRequestId(requestId);
    try {
      const res = await fetch('/api/admin/lending-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) setRequests((r) => r.filter((x) => x.id !== requestId));
    } finally {
      setRejectingRequestId(null);
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

        <div className="mt-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('adminLoanRequestsTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{t('adminLoanRequestsSubtitle')}</p>

          {loadingRequests ? (
            <p className="text-slate-600 dark:text-slate-400">{t('loadingLoanRequests')}</p>
          ) : requests.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">{t('noPendingLoanRequests')}</p>
          ) : (
            <ul className="space-y-3 max-w-3xl">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 break-words">
                        {r.books?.title || t('unknownBook')}
                        {r.books?.author ? ` - ${r.books.author}` : ''}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {t('requestedBy')}: {r.first_name} {r.last_name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('authEmail')}: {r.email} | {t('phoneNumber')}: {r.phone}
                      </p>
                      {r.address && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {t('address')}: {r.address}
                        </p>
                      )}
                      {r.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {t('requestNotes')}: {r.notes}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {t('requestedOn')}: {new Date(r.requested_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(r.id)}
                        disabled={approvingRequestId === r.id || rejectingRequestId === r.id}
                        className="px-4 py-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {approvingRequestId === r.id ? t('approving') : t('approveLoanRequest')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(r.id)}
                        disabled={approvingRequestId === r.id || rejectingRequestId === r.id}
                        className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {rejectingRequestId === r.id ? t('rejecting') : t('rejectLoanRequest')}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
