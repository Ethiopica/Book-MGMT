'use client';

import { useEffect, useState } from 'react';
import { supabase, Book, Loan } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';
import BookCard from './BookCard';
import BookDetailModal from './BookDetailModal';
import LendingForm from './LendingForm';
import AddBookForm from './AddBookForm';
import EditBookForm from './EditBookForm';

export default function BookList() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAddBookForm, setShowAddBookForm] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchLoans();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'borrowed');

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const getBookStatus = (bookId: string) => {
    const loan = loans.find((l) => l.book_id === bookId && l.status === 'borrowed');
    if (!loan) return { status: 'available' as const, daysOut: 0 };

    const borrowedDate = new Date(loan.borrowed_date);
    const today = new Date();
    const daysOut = Math.floor((today.getTime() - borrowedDate.getTime()) / (1000 * 60 * 60 * 24));

    return { status: 'borrowed' as const, daysOut, loan };
  };

  const handleCardClick = (book: Book) => {
    setDetailBook(book);
  };

  const handleLendBook = (book: Book) => {
    setSelectedBook(book);
    setShowForm(true);
  };

  const handleCloseDetail = () => {
    setDetailBook(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedBook(null);
    fetchLoans(); // Refresh loans after lending
  };

  const handleAddBookSuccess = () => {
    fetchBooks();
  };

  const handleEditBook = (book: Book) => {
    setDetailBook(null);
    setEditingBook(book);
  };

  const handleEditBookSuccess = () => {
    fetchBooks();
    setEditingBook(null);
  };

  const handleDeleteBook = async (book: Book) => {
    setDeletingId(book.id);
    try {
      const { error } = await supabase.from('books').delete().eq('id', book.id);
      if (error) throw error;
      handleCloseDetail();
      fetchBooks();
      fetchLoans();
    } catch (err) {
      console.error('Error deleting book:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[280px] sm:min-h-[400px]">
        <p className="text-base sm:text-xl text-gray-600">{t('loadingBooks')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 sm:mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddBookForm(true)}
          className="touch-target min-h-[48px] w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-xl sm:rounded-lg hover:bg-green-700 font-semibold shadow-md active:scale-[0.98] transition-all text-sm sm:text-base"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addNewBook')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {books.map((book) => {
          const bookStatus = getBookStatus(book.id);
          return (
            <BookCard
              key={book.id}
              book={book}
              status={bookStatus.status}
              daysOut={bookStatus.daysOut}
              onClick={() => handleCardClick(book)}
            />
          );
        })}
      </div>

      {detailBook && (
        <BookDetailModal
          book={detailBook}
          status={getBookStatus(detailBook.id).status}
          daysOut={getBookStatus(detailBook.id).daysOut}
          onClose={handleCloseDetail}
          onLend={() => {
            handleCloseDetail();
            handleLendBook(detailBook);
          }}
          onEdit={() => handleEditBook(detailBook)}
          onDelete={() => handleDeleteBook(detailBook)}
          isDeleting={deletingId === detailBook.id}
        />
      )}

      {books.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12 px-2">
          <p className="text-gray-600 text-base sm:text-lg">{t('noBooks')}</p>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">{t('noBooksHint')}</p>
        </div>
      )}

      {showForm && selectedBook && (
        <LendingForm
          book={selectedBook}
          onClose={handleFormClose}
        />
      )}

      {showAddBookForm && (
        <AddBookForm
          onClose={() => setShowAddBookForm(false)}
          onSuccess={handleAddBookSuccess}
        />
      )}

      {editingBook && (
        <EditBookForm
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSuccess={handleEditBookSuccess}
        />
      )}
    </>
  );
}
