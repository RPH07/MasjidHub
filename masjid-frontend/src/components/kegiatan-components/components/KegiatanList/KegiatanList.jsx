import React from 'react';
import KegiatanCard from '../KegiatanCard';
import { SortKegiatan } from '../shared';

const KegiatanList = ({ 
  kegiatan = [], 
  kategoriList = [], 
  isLoading, 
  sortOrder, 
  onSort, 
  onEdit, 
  onDelete 
}) => {
  const safeKegiatan = Array.isArray(kegiatan) ? kegiatan : [];
  const safeKategoriList = Array.isArray(kategoriList) ? kategoriList : [];
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Memuat kegiatan...</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Daftar Kegiatan</h2>
        <SortKegiatan sortOrder={sortOrder} onSort={onSort} />
      </div>
      
      {kegiatan.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium">Belum ada kegiatan</p>
          <p className="text-sm">Tambahkan kegiatan pertama Anda</p>
        </div>
      ) : (
        <ul className="space-y-3 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeKegiatan.map((item) => (
            <KegiatanCard
              key={item.id}
              kegiatan={item}
              kategoriList={safeKategoriList}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default KegiatanList;