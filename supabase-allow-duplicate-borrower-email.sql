-- Allow the same email to be used by multiple borrowers.
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query → Paste → Run

-- 1. Drop the unique constraint on email (standard name)
ALTER TABLE borrowers
  DROP CONSTRAINT IF EXISTS borrowers_email_key;

-- 2. If you still get "duplicate key" on email, the constraint may have another name.
--    Run this to drop ANY unique constraint on the borrowers.email column:
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT c.conname INTO con_name
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
  WHERE c.conrelid = 'public.borrowers'::regclass
    AND c.contype = 'u'
    AND a.attname = 'email';
  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.borrowers DROP CONSTRAINT %I', con_name);
    RAISE NOTICE 'Dropped constraint: %', con_name;
  END IF;
END $$;

-- 3. Index for lookups (optional, skip if it already exists)
CREATE INDEX IF NOT EXISTS idx_borrowers_email ON borrowers(email);
