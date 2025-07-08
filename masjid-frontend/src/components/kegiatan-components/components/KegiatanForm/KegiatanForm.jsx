import React from 'react';
import { FloatingInput, FloatingSelect, FloatingDate, FloatingTextarea } from '../../../form';
import { ImageUpload } from '../shared';
import { formatKategoriName } from '../../utils';

const KegiatanForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  kategoriList = [], 
  foto, 
  onFileChange, 
  isEditing, 
  onCancelEdit,
  fileInputRef
}) => {
   const safeKategoriList = Array.isArray(kategoriList) ? kategoriList : [];

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="col-span-2 md:col-span-1">
        <FloatingInput
          label="Nama Kegiatan"
          type="text"
          name="nama_kegiatan"
          value={formData.nama_kegiatan}
          onChange={onChange}
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      <div className="col-span-2 md:col-span-1">
        <FloatingSelect
          label="Kategori Kegiatan"
          name="kategori"
          value={formData.kategori}
          onChange={onChange}
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        >
          {safeKategoriList.map(kategori => (
            <option key={kategori.id} value={kategori.nama_kategori}>
              {kategori.icon} {formatKategoriName(kategori.nama_kategori)}
            </option>
          ))}
        </FloatingSelect>
      </div>

      <div className="col-span-2 md:col-span-1">
        <FloatingDate
          label="Tanggal Kegiatan"
          name="tanggal"
          value={formData.tanggal}
          onChange={onChange}
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      <div className="col-span-2 md:col-span-1">
        <FloatingInput
          label="Lokasi"
          type="text"
          name="lokasi"
          value={formData.lokasi}
          onChange={onChange}
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>

      <div className="col-span-2 md:col-span-1">
        <ImageUpload foto={foto} onFileChange={onFileChange} fileInputRef={fileInputRef} />
      </div>

      <div className="col-span-2">
        <FloatingTextarea
          label="Deskripsi Kegiatan"
          name="deskripsi"
          value={formData.deskripsi}
          onChange={onChange}
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
      </div>

      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          className={`flex-1 py-2 rounded hover:opacity-90 flex items-center justify-center transition-colors ${
            isEditing 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isEditing ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            )}
          </svg>
          {isEditing ? 'Update Kegiatan' : 'Tambah Kegiatan'}
        </button>
        
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Batal
          </button>
        )}
      </div>
    </form>
  );
};

export default KegiatanForm;