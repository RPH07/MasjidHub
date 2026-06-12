import React, { useEffect, useState } from 'react';
import { FloatingInput } from '../../../form';

const KategoriManager = ({
  showModal,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [namaKategori, setNamaKategori] = useState('');

  useEffect(() => {
    if (showModal) {
      setNamaKategori('');
    }
  }, [showModal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nama_kategori: namaKategori.trim() });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tambah Kategori Baru</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            aria-label="Tutup modal kategori"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Nama Kategori"
            type="text"
            name="nama_kategori"
            value={namaKategori}
            onChange={(e) => setNamaKategori(e.target.value)}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          />

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-500 text-white py-2 rounded hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Tambah Kategori'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KategoriManager;
