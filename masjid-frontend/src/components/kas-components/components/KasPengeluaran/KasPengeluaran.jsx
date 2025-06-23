import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const KasPengeluaran = ({ kasData, onOpenModal, onEdit, onDelete }) => {
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

      {/* Desktop View */}
      <div className="hidden sm:block rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {kasData.filter(item => item.jenis === 'keluar').map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.kategori || 'Operasional'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {/* fallback untuk berbagai kemungkinan field */}
                      {item.keterangan || item.deskripsi || item.description || 'Tidak ada deskripsi'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600">
                      {formatCurrency(item.jumlah)}
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

      {/* Mobile View */}
      <div className="block sm:hidden space-y-4">
        {kasData.filter(item => item.jenis === 'keluar').map((item) => (
          <div key={`mobile-${item.id}`} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-500">
                {new Date(item.tanggal).toLocaleDateString('id-ID')}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Hapus
                </button>
              </div>
            </div>
            
            <div className="text-sm font-medium text-gray-900 mb-1">
              {item.kategori || 'Operasional'}
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
    </div>
  );
};

export default KasPengeluaran;