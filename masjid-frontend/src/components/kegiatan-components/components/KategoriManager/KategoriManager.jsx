import React from 'react';
import { FloatingInput, FloatingSelect, FloatingTextarea } from '../../../form';
import { warnaOptions, getWarnaClass } from '../../utils';

const KategoriManager = ({ 
  showModal, 
  onClose, 
  newKategori, 
  onKategoriChange, 
  onSubmit 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tambah Kategori Baru</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
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
            value={newKategori.nama_kategori}
            onChange={(e) => onKategoriChange('nama_kategori', e.target.value)}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          />
          
          <FloatingInput
            label="Icon (Emoji)"
            type="text"
            name="icon"
            value={newKategori.icon}
            onChange={(e) => onKategoriChange('icon', e.target.value)}
            icon={<span className="text-lg">😀</span>}
          />
          
          <FloatingSelect
            label="Warna Badge"
            name="warna"
            value={newKategori.warna}
            onChange={(e) => onKategoriChange('warna', e.target.value)}
            options={warnaOptions}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21a4 4 0 004-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4" />
              </svg>
            }
          />
          
          <FloatingTextarea
            label="Deskripsi (Opsional)"
            name="deskripsi"
            value={newKategori.deskripsi}
            onChange={(e) => onKategoriChange('deskripsi', e.target.value)}
            rows={2}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview Badge
            </label>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getWarnaClass(newKategori.warna || 'blue')}`}>
              {newKategori.icon} {newKategori.nama_kategori || 'Nama Kategori'}
            </span>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
            >
              Tambah Kategori
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
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