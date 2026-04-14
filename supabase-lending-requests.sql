-- Public lending request flow (run in Supabase SQL Editor)
-- Creates a table for customer-submitted requests.
-- Admin approves/rejects requests via server APIs.

CREATE TABLE IF NOT EXISTS public.lending_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lending_requests_status ON public.lending_requests(status);
CREATE INDEX IF NOT EXISTS idx_lending_requests_book_id ON public.lending_requests(book_id);

ALTER TABLE public.lending_requests ENABLE ROW LEVEL SECURITY;

-- No anonymous/public direct DB policies on purpose.
-- Submissions go through Next.js API using service role key.
