import React from 'react';
import { formatTanggal, getKategoriInfo, getWarnaClass } from '../../utils';

const KegiatanCard = ({ kegiatan, kategoriList, onEdit, onDelete }) => {
  const kategoriInfo = getKategoriInfo(kegiatan.kategori, kategoriList);

  return (
    <li className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getWarnaClass(kategoriInfo.warna)}`}>
            {kategoriInfo.icon} {kegiatan.kategori}
          </span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(kegiatan)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="Edit kegiatan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(kegiatan.id, kegiatan.nama_kegiatan)}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            title="Hapus kegiatan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <h3 className="font-semibold text-lg mb-2 text-gray-800">
        {kegiatan.nama_kegiatan}
      </h3>
      
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatTanggal(kegiatan.tanggal)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{kegiatan.lokasi}</span>
        </div>
      </div>
      
      <p className="text-gray-700 text-sm mb-3 line-clamp-2">
        {kegiatan.deskripsi}
      </p>
      
      {kegiatan.foto && (
        <div className="mt-3">
          <img
            src={`http://localhost:5000/${kegiatan.foto}`}
            alt={kegiatan.nama_kegiatan}
            className="w-full h-40 object-cover rounded-md"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </li>
  );
};

export default KegiatanCard;