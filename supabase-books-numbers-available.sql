-- Add "numbers available" to books (run in Supabase SQL Editor if table already exists)
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS numbers_available INTEGER NOT NULL DEFAULT 1;
