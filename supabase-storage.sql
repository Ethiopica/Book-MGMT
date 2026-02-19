-- Run this in Supabase SQL Editor after the main schema
-- Creates Storage bucket and policies for book cover uploads

-- Create a public bucket for book covers (allows reading without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,
  5242880,  -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to book covers
CREATE POLICY "Allow public read access to book covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');

-- Allow anyone to upload (anon key) - restrict in production if needed
CREATE POLICY "Allow public upload to book-covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'book-covers');

-- Allow update/delete for cleanup
CREATE POLICY "Allow public update book covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'book-covers');

CREATE POLICY "Allow public delete book covers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'book-covers');
