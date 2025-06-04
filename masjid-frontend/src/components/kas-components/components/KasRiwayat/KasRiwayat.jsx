import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const KasRiwayat = ({ kasData, zakatData, infaqData, onOpenBuktiModal }) => {
  // Gabungkan semua data dan urutkan berdasarkan tanggal
  const allTransactions = [
    ...kasData.map(item => ({ ...item, type: item.jenis, source: 'kas' })),
    ...zakatData.map(item => ({ ...item, type: 'masuk', source: 'zakat', tanggal: item.created_at })),
    ...infaqData.map(item => ({ ...item, type: 'masuk', source: 'infaq' }))
  ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Riwayat Semua Transaksi</h3>
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bukti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allTransactions.map((item, index) => (
              <tr key={`${item.source}-${item.id}-${index}`}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(item.tanggal).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.type === 'masuk'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {item.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.source === 'zakat' ? `Zakat ${item.jenis_zakat}` :
                    item.source === 'infaq' ? 'Infaq' :
                      item.kategori || item.kategori_pemasukan || 'Operasional'} {/* Penyesuaian untuk kategori */}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.keterangan || item.nama || item.nama_pemberi}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <span className={item.type === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                    {item.type === 'masuk' ? '+' : '-'}{formatCurrency(item.jumlah)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.bukti_transfer ? (
                    <button
                      onClick={() => onOpenBuktiModal(item.bukti_transfer)}
                      className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                    >
                      Lihat
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KasRiwayat;
