import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const KasPengeluaran = ({ kasData, onOpenModal, onEdit, onDelete }) => {
  // ✅ STATE UNTUK SORTING
  const [sortConfig, setSortConfig] = useState({
    key: 'tanggal',
    direction: 'desc' // desc = terbaru, asc = terlama
  });

  // ✅ FUNGSI SORTING
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // ✅ ICON UNTUK SORTING
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortConfig.direction === 'desc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
  };

  // ✅ FILTER DAN SORT DATA PENGELUARAN
  const getFilteredAndSortedData = () => {
    // Filter data pengeluaran
    const filteredData = kasData.filter(item => item.jenis === 'keluar');
    
    if (!sortConfig.key) return filteredData;

    // Sort data
    return [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'tanggal':
          aValue = new Date(a.tanggal);
          bValue = new Date(b.tanggal);
          break;
        case 'kategori':
          aValue = (a.kategori || 'Operasional').toLowerCase();
          bValue = (b.kategori || 'Operasional').toLowerCase();
          break;
        case 'deskripsi':
          aValue = (a.keterangan || a.deskripsi || '').toLowerCase();
          bValue = (b.keterangan || b.deskripsi || '').toLowerCase();
          break;
        case 'jumlah':
          aValue = Number(a.jumlah || 0);
          bValue = Number(b.jumlah || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedPengeluaranData = getFilteredAndSortedData();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-lg font-medium">Data Pengeluaran</h3>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm sm:text-base"
          onClick={() => onOpenModal('add-pengeluaran')}
        >
          + Tambah Pengeluaran
        </button>
      </div>

      {/* ✅ INFO SORTING */}
      {sortedPengeluaranData.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Diurutkan berdasarkan: <strong className="capitalize">{sortConfig.key}</strong> 
              ({sortConfig.direction === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}) - 
              Total: <strong>{sortedPengeluaranData.length}</strong> pengeluaran
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedPengeluaranData.length === 0 && (
        <div className="p-6 text-center text-gray-500 bg-white rounded-lg border">
          <p>Belum ada data pengeluaran.</p>
        </div>
      )}

      {/* Desktop View */}
      {sortedPengeluaranData.length > 0 && (
        <div className="hidden sm:block rounded-lg border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  {/* ✅ SORTABLE HEADERS */}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('tanggal')}
                  >
                    <div className="flex items-center gap-1">
                      Tanggal
                      <SortIcon column="tanggal" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('kategori')}
                  >
                    <div className="flex items-center gap-1">
                      Kategori
                      <SortIcon column="kategori" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('deskripsi')}
                  >
                    <div className="flex items-center gap-1">
                      Deskripsi
                      <SortIcon column="deskripsi" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('jumlah')}
                  >
                    <div className="flex items-center gap-1">
                      Jumlah
                      <SortIcon column="jumlah" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* ✅ RENDER DATA YANG SUDAH DI-SORT */}
                {sortedPengeluaranData.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          📤 {item.kategori || 'Operasional'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {/* fallback untuk berbagai kemungkinan field */}
                        {item.keterangan || item.deskripsi || item.description || 'Tidak ada deskripsi'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">
                        -{formatCurrency(item.jumlah)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEdit(item)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Edit
                          </button>
                          <span className="text-gray-500">|</span>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile View */}
      {sortedPengeluaranData.length > 0 && (
        <div className="block sm:hidden space-y-4">
          {/* ✅ Mobile sorting controls */}
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Urutkan berdasarkan:</span>
              <select 
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction });
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="tanggal-desc">Tanggal (Terbaru)</option>
                <option value="tanggal-asc">Tanggal (Terlama)</option>
                <option value="kategori-asc">Kategori (A-Z)</option>
                <option value="kategori-desc">Kategori (Z-A)</option>
                <option value="deskripsi-asc">Deskripsi (A-Z)</option>
                <option value="deskripsi-desc">Deskripsi (Z-A)</option>
                <option value="jumlah-desc">Jumlah (Tertinggi)</option>
                <option value="jumlah-asc">Jumlah (Terendah)</option>
              </select>
            </div>
          </div>

          {/* ✅ Mobile cards dengan data yang sudah di-sort */}
          {sortedPengeluaranData.map((item) => (
            <div key={`mobile-${item.id}`} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-500">
                  {new Date(item.tanggal).toLocaleDateString('id-ID')}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              
              <div className="text-sm font-medium text-gray-900 mb-1">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  📤 {item.kategori || 'Operasional'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Deskripsi:</span> {item.keterangan || item.deskripsi || 'Tidak ada deskripsi'}
              </div>
              
              <div className="flex justify-end">
                <div className="text-lg font-medium text-red-600">
                  -{formatCurrency(item.jumlah)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KasPengeluaran;