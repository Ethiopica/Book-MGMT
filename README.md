# Church Library Management System

A modern web application for managing a church library, built with Next.js and Supabase.

## Features

- 🏠 **Landing Page**: Church welcome page with Ethiopian Orthodox imagery (St. Michael, Abune Teklehaimanot) and sign up / login
- 👤 **Auth**: Create account and log in with email (Supabase Auth)
- ✅ **User approval**: Only approved users can access Library and Loaned Books; admin approves from the Admin page
- 👑 **Admin**: One admin (by email) can approve pending users
- 📚 **Book Catalog**: Display all available books with cover images
- ➕ **Add Books**: Form to add new books (with cover upload or URL)
- 📊 **Book Status**: Real-time status tracking (Available/Borrowed)
- ⏱️ **Days Out Counter**: Automatically calculates how many days a book has been borrowed
- 📝 **Lending Form**: Easy-to-use form for lending books with borrower information
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Image Handling**: Next.js Image Optimization

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's **SQL Editor**
3. Run `supabase-schema.sql` to create the tables and policies
4. **Fix "row-level security policy" for books**: If you see that error when adding a book, run `supabase-fix-books-rls.sql` in the SQL Editor (or the schema already includes these policies in the main file)
5. **Cover image uploads**: Run `supabase-storage.sql` in the SQL Editor. This creates the `book-covers` storage bucket and policies. Alternatively: in Supabase go to **Storage** → **New bucket** → name `book-covers`, set **Public bucket** to ON, then run only the policy statements from `supabase-storage.sql` (the four `CREATE POLICY` blocks)
6. **Auth (sign up / login)**: In Supabase go to **Authentication** → **Providers** and ensure **Email** is enabled. Optionally configure **Confirm email** and **Redirect URLs** under **URL Configuration** if you use email confirmation.
7. **User approval**: Run `supabase-profiles.sql` in the SQL Editor to create the `profiles` table and trigger. New users start as unapproved; the admin approves them from the Admin page.

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to your Supabase project settings
   - Navigate to "API" section
   - Copy your "Project URL" and "anon public" key

3. Update `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com
   ADMIN_EMAIL=your_admin_email@example.com
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   Use your own email for `NEXT_PUBLIC_ADMIN_EMAIL` and `ADMIN_EMAIL` (same value). Get the service role key from Supabase Dashboard → Settings → API → `service_role` (keep it secret).

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel (why the build might fail)

The build can fail for two main reasons:

### 1. **Type error: `LockFunc` / `lock`**

If you see a TypeScript error about `lock` or `Promise<unknown>` in `lib/supabase.ts`, the code on the branch you’re deploying (e.g. `main` on GitHub) is likely **out of date**. Fix:

- Commit and push the latest code from this repo (including the `lockNoOp` generic in `lib/supabase.ts`) to the same branch Vercel builds from (e.g. `main` on `Ethiopica/Book-MGMT`).

### 2. **Missing environment variables**

The build needs Supabase env vars at build time. If they’re missing, you’ll see errors like **"Missing Supabase environment variables"** or **"supabaseUrl is required"**.

**Fix:** In Vercel, go to your project → **Settings** → **Environment Variables** and add (for Production, and optionally Preview/Development):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Admin email (e.g. for nav) |
| `ADMIN_EMAIL` | Same admin email (for API checks) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin APIs; keep secret) |

Redeploy after adding or changing variables.

## Database Schema

### Books Table
- `id` (UUID): Primary key
- `title` (VARCHAR): Book title
- `author` (VARCHAR): Author name
- `isbn` (VARCHAR): Optional ISBN
- `cover_image_url` (TEXT): URL to book cover image
- `description` (TEXT): Book description
- `created_at`, `updated_at` (TIMESTAMP): Timestamps

### Borrowers Table
- `id` (UUID): Primary key
- `first_name`, `last_name` (VARCHAR): Borrower name
- `email` (VARCHAR): Unique email address
- `phone` (VARCHAR): Phone number
- `address` (TEXT): Optional address
- `created_at` (TIMESTAMP): Creation timestamp

### Loans Table
- `id` (UUID): Primary key
- `book_id` (UUID): Foreign key to books
- `borrower_id` (UUID): Foreign key to borrowers
- `borrowed_date` (TIMESTAMP): When book was borrowed
- `return_date` (TIMESTAMP): When book was returned (nullable)
- `status` (VARCHAR): 'borrowed' or 'returned'
- `created_at` (TIMESTAMP): Creation timestamp

## Adding Books

You can add books in two ways:

1. **Using the Add Book Form** (Recommended):
   - Click the "Add New Book" button on the main page
   - Fill in the book details (title and author are required)
   - Optionally add ISBN, cover image URL, and description
   - Click "Add Book" to save

2. **Through Supabase Dashboard or SQL**:
   ```sql
   INSERT INTO books (title, author, isbn, cover_image_url, description)
   VALUES (
     'Book Title',
     'Author Name',
     'ISBN-13',
     'https://example.com/cover.jpg',
     'Book description here'
   );
   ```

## Features in Detail

### Book Status
- Books are automatically marked as "Available" or "Borrowed" based on active loan records
- The status badge is displayed on each book card

### Days Out Counter
- Automatically calculates the number of days a book has been borrowed
- Displayed as a badge on borrowed books (e.g., "5 days out")
- Updates in real-time based on the `borrowed_date`

### Lending Form
- Collects borrower information: first name, last name, email, phone, and address
- If a borrower with the same email exists, their information is updated
- Creates a new loan record when submitted
- Shows success message and automatically closes after 2 seconds

## Project Structure

```
ChurchBook/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── AddBookForm.tsx     # Form to add new books
│   ├── BookCard.tsx        # Individual book card component
│   ├── BookList.tsx        # Main book listing component
│   └── LendingForm.tsx     # Lending form modal
├── lib/
│   └── supabase.ts         # Supabase client and types
├── public/                 # Static assets
├── supabase-schema.sql     # Database schema
└── README.md              # This file
```

## Future Enhancements

- Return book functionality
- Search and filter books
- Book categories/genres
- Due date reminders
- Borrower history
- Admin dashboard
- Book reviews/ratings

## License

This project is open source and available for use in church libraries.
