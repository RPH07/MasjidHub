import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const KasPengeluaran = ({ kasData, onOpenModal, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Data Pengeluaran</h3>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          onClick={() => onOpenModal('add-pengeluaran')}
        >
          + Tambah Pengeluaran
        </button>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full">
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
            {kasData.filter(item => item.jenis === 'keluar').map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(item.tanggal).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.kategori || 'Operasional'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.keterangan}</td>
                <td className="px-6 py-4 text-sm font-medium text-red-600">{formatCurrency(item.jumlah)}</td>
                <td className="px-6 py-4">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KasPengeluaran;
