'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

const COVER_BUCKET = 'book-covers';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface AddBookFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBookForm({ onClose, onSuccess }: AddBookFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    coverImageUrl: '',
    description: '',
    numbersAvailable: '1',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t('imageTypeError'));
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t('imageSizeError'));
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, coverImageUrl: '' })); // clear URL when uploading file
  };

  const clearCover = () => {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile) return null;
    const ext = coverFile.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(path, coverFile, { upsert: false });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let coverUrl: string | null = null;
      if (coverFile) {
        coverUrl = await uploadCover();
      } else if (formData.coverImageUrl.trim()) {
        coverUrl = formData.coverImageUrl.trim();
      }

      const numbersAvailable = Math.max(1, parseInt(formData.numbersAvailable, 10) || 1);

      const { error: insertError } = await supabase
        .from('books')
        .insert({
          title: formData.title.trim(),
          author: formData.author.trim(),
          isbn: formData.isbn.trim() || null,
          cover_image_url: coverUrl,
          description: formData.description.trim() || null,
          numbers_available: numbersAvailable,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('errorAddingBook'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('addBookTitle')}</h2>
            <button
              type="button"
              onClick={onClose}
              className="touch-target w-10 h-10 shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xl disabled:opacity-50"
              disabled={loading}
              aria-label={t('authClose')}
            >
              ×
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <p className="text-lg font-semibold text-gray-900">{t('addBookSuccess')}</p>
              <p className="text-gray-600 mt-2">{t('addBookSuccessClose')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('titleLabel')} *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t('titlePlaceholder')}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('authorLabel')} *
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  required
                  value={formData.author}
                  onChange={handleChange}
                  placeholder={t('authorPlaceholder')}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('isbn')}
                </label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder={t('isbnPlaceholder')}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label htmlFor="numbersAvailable" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('numbersAvailable')}
                </label>
                <input
                  type="number"
                  id="numbersAvailable"
                  name="numbersAvailable"
                  min={1}
                  value={formData.numbersAvailable}
                  onChange={handleChange}
                  placeholder="1"
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
                <p className="text-xs text-gray-500 mt-1">{t('numbersAvailableHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('coverImage')}
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ALLOWED_TYPES.join(',')}
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={clearCover}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {t('remove')}
                      </button>
                    )}
                  </div>
                  {coverPreview && (
                    <div className="relative w-32 h-40 rounded border border-gray-200 overflow-hidden bg-gray-100">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {t('coverUploadHint')}
                  </p>
                  <input
                    type="url"
                    id="coverImageUrl"
                    name="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={handleChange}
                    placeholder={t('coverUrlPlaceholder')}
                    disabled={!!coverFile}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('descriptionLabel')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 min-h-[48px] px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('adding') : t('addBook')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
