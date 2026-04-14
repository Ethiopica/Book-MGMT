-- Church Library Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20),
  cover_image_url TEXT,
  description TEXT,
  numbers_available INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create borrowers table
CREATE TABLE IF NOT EXISTS borrowers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  borrowed_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  return_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public loan request submissions (approved by admin before creating real loans)
CREATE TABLE IF NOT EXISTS lending_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loans_book_id ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_borrowers_email ON borrowers(email);
CREATE INDEX IF NOT EXISTS idx_lending_requests_status ON lending_requests(status);
CREATE INDEX IF NOT EXISTS idx_lending_requests_book_id ON lending_requests(book_id);

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE lending_requests ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access to books
CREATE POLICY "Allow public read access to books"
  ON books FOR SELECT
  USING (true);

-- Allow public insert and update for books (add/edit books)
CREATE POLICY "Allow public insert access to books"
  ON books FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to books"
  ON books FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to books"
  ON books FOR DELETE
  USING (true);

-- Create policies to allow public insert/update access to borrowers
CREATE POLICY "Allow public insert access to borrowers"
  ON borrowers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to borrowers"
  ON borrowers FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to borrowers"
  ON borrowers FOR SELECT
  USING (true);

-- Create policies to allow public access to loans
CREATE POLICY "Allow public read access to loans"
  ON loans FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to loans"
  ON loans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to loans"
  ON loans FOR UPDATE
  USING (true);

-- Insert some sample books (optional)
INSERT INTO books (title, author, isbn, description) VALUES
  ('The Holy Bible', 'Various Authors', '978-0-00-000000-0', 'The sacred text of Christianity'),
  ('Mere Christianity', 'C.S. Lewis', '978-0-06-065292-0', 'A classic work of Christian apologetics'),
  ('The Purpose Driven Life', 'Rick Warren', '978-0-310-27771-0', 'A guide to finding your purpose in life'),
  ('The Case for Christ', 'Lee Strobel', '978-0-310-20930-9', 'A journalists personal investigation of the evidence for Jesus'),
  ('The Screwtape Letters', 'C.S. Lewis', '978-0-06-065293-7', 'A satirical Christian apologetics novel')
ON CONFLICT DO NOTHING;
