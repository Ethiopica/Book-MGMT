'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  isApproved: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  isApproved: false,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase() || '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const isAdmin = !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;
  const isApproved = !!profile?.approved || isAdmin;

  const ensureProfile = async (uid: string, email: string) => {
    const { error } = await supabase.from('profiles').insert({ id: uid, email, approved: false });
    if (error && error.code !== '23505') return; // 23505 = unique violation, ignore
  };

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data as Profile | null);
  };

  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id);
  };

  // Use only onAuthStateChange so only one getSession runs (library emits INITIAL_SESSION).
  // Avoids Navigator Lock timeout from duplicate getSession (e.g. Strict Mode double-mount).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (!sess?.user) setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load profile after auth is ready (avoids holding Navigator Lock during getSession)
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const run = async () => {
      await ensureProfile(user.id, user.email!);
      if (cancelled) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!cancelled) setProfile(data as Profile | null);
    };
    run();
    return () => { cancelled = true; };
  }, [user?.id, user?.email]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        isApproved,
        isAdmin,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
