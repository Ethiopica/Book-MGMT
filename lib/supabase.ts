import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/** No-op lock to avoid Navigator LockManager timeout (e.g. with React Strict Mode / multiple tabs). */
const lockNoOp: (name: string, acquireTimeout: number, fn: () => Promise<unknown>) => Promise<unknown> =
  async (_name, _acquireTimeout, fn) => fn();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { lock: lockNoOp },
});

// Database types
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  cover_image_url?: string;
  description?: string;
  numbers_available?: number;
  created_at: string;
  updated_at: string;
}

export interface Borrower {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  book_id: string;
  borrower_id: string;
  borrowed_date: string;
  return_date?: string;
  status: 'borrowed' | 'returned';
  created_at: string;
  books?: Book;
  borrowers?: Borrower;
}

export interface Profile {
  id: string;
  email: string;
  approved: boolean;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}
