'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';

const CHURCH_NAME = 'በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የፊላንድ ሄልሲንኪ ደብረአሚን አቡነ ተክለሃይማኖት ቤተክርስቲያን';

export default function LandingPage() {
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const { user, isApproved, isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Pending approval banner */}
        {user && !isApproved && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-amber-900 text-sm">
            {t('landingPendingApproval')}
          </div>
        )}
        {/* Hero - gocharleston style: name + subtitle + actions */}
        <section className="relative bg-gradient-to-b from-sky-50 to-white border-b border-slate-100">
          <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 text-center">
            <h1
              className="text-2xl min-[380px]:text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 max-w-5xl mx-auto leading-tight mb-4"
              dir="ltr"
              style={{ fontFamily: 'inherit' }}
            >
              {CHURCH_NAME}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mb-8">
              {t('landingSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {user && isApproved ? (
                <Link
                  href="/library"
                  className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-lg font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                >
                  {t('landingGoToLibrary')}
                </Link>
              ) : user && isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-lg font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                >
                  {t('navAdmin')}
                </Link>
              ) : user ? null : (
                <>
                  <button
                    onClick={() => setAuthModal('login')}
                    className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-lg font-semibold text-slate-700 bg-white border-2 border-slate-300 hover:border-sky-400 hover:bg-sky-50/50 transition-colors"
                  >
                    {t('navLogIn')}
                  </button>
                  <button
                    onClick={() => setAuthModal('signup')}
                    className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-lg font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                  >
                    {t('navCreateAccount')}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Images - same style: bordered section, two pics with existing captions */}
        <section className="bg-slate-50 border-b border-slate-100">
          <div className="container mx-auto px-4 py-12 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="relative aspect-[3/4] max-h-[400px] rounded-lg overflow-hidden bg-white shadow-md">
                <Image
                  src="/assets/saint-michael.png"
                  alt="Archangel Saint Michael"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 text-center">
                  <p className="text-white font-medium">አ.ቀ መልአክት ቅዱስ ሚካኤል</p>
                  <p className="text-white/90 text-sm">Archangel Saint Michael</p>
                </div>
              </div>
              <div className="relative aspect-[3/4] max-h-[400px] rounded-lg overflow-hidden bg-white shadow-md">
                <Image
                  src="/assets/abune-teklehaimanot.png"
                  alt="Abune Teklehaimanot"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 text-center">
                  <p className="text-white font-medium">አቡነ ተክለሃይማኖት</p>
                  <p className="text-white/90 text-sm">Abune Teklehaimanot</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA strip - gocharleston-style bar */}
        <section className="border-b border-sky-100 bg-sky-50">
          <div className="container mx-auto px-4 py-12 sm:py-16">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <p className="text-slate-600 text-sm sm:text-base">
                {t('landingWelcomeCta')}
              </p>
              <button
                onClick={() => setAuthModal('signup')}
                className="shrink-0 inline-flex items-center justify-center min-h-[48px] px-8 rounded-lg font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
              >
                {t('navCreateAccount')}
              </button>
            </div>
          </div>
        </section>

        {/* Footer strip */}
        <section className="bg-slate-100 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-600 text-sm">
              {t('landingFooter')}
            </p>
          </div>
        </section>
      </main>

      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={() => setAuthModal(null)}
        />
      )}
    </>
  );
}
