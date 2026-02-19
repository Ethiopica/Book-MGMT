-- Run this in Supabase SQL Editor if you get "new row violates row-level security policy for table books"
-- This adds the missing INSERT and UPDATE policies for the books table

CREATE POLICY "Allow public insert access to books"
  ON books FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to books"
  ON books FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to books"
  ON books FOR DELETE
  USING (true);
