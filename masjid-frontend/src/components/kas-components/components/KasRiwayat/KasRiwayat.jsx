import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import axios from 'axios';

const KasRiwayat = ({ kasData, zakatData, infaqData, onOpenBukti, kategoriPemasukan = [], currentPeriod }) => {
  const [exportLoading, setExportLoading] = useState({
    csv: false,
    excel: false
  });

  // export function
  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(prev => ({...prev, [format]: true}))
      const token = localStorage.getItem('token');
      console.log(`🚀 Starting ${format} export...`);

      const response = await axios.get('http://localhost:5000/api/kas/history/export', {
        params: {
          period: currentPeriod,
          type: 'all',
          status: 'all',
          format: format
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      console.log(`📦 Response received:`, response); // DEBUG LOG
      console.log(`📊 Blob size:`, response.data.size)

      // handle csv and excel export
      const blob = new Blob([response.data],{
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'csv'
      ? `riwayat-transaksi-${Date.now()}.csv`
      : `riwayat-transaksi-${Date.now()}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ ${format} export completed!`);
      alert( `Export ${format.toUpperCase()} berhasil! File telah diunduh`);
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      alert('Gagal export data: ' + (error.response?.data?.message || error.message));
    } finally{
      setExportLoading(prev => ({...prev, [format]: false}));
    }
  };

  // Gabungkan semua data dan urutkan berdasarkan tanggal
  const allTransactions = [
    ...kasData.map(item => ({ ...item, type: item.jenis, source: 'kas' })),
    ...zakatData.map(item => ({ ...item, type: 'masuk', source: 'zakat', tanggal: item.created_at })),
    ...infaqData.map(item => ({ ...item, type: 'masuk', source: 'infaq' }))
  ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));


  // helper function untuk get nama pemberi (desktop)
  const getNamaPemberi = (item) => {
    if (item.source === 'zakat') return item.nama;
    if (item.source === 'infaq') return item.nama_pemberi || '-';
    if (item.source === 'kas') {
      return item.type === 'masuk' ? (item.nama_pemberi || 'Hamba Allah') : (item.nama_pember || '-');
    }
    return '-';
  };

  // helper function untuk get nama pemberi (mobile)
  const shouldShowName = (item) => {
    if (item.source === 'zakat') return true;
    if (item.source === 'infaq' && item.nama_pemberi) return true;
    if (item.source === 'kas' && item.type === 'masuk') return true;
    return false;
  }

  
  return (
    <div className="space-y-4">
      <div className='flex justify-between items-center'>
        <h3 className="text-lg font-medium">Riwayat Semua Transaksi</h3>

        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exportLoading.csv || allTransactions.length === 0}
            className='flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {exportLoading.csv ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="3 3 18 18">
                  <path
                    className="opacity-25"
                    fill="currentColor"
                    d="M12 3v2a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M12 3v2a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z"
                  />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>Export CSV</>
            )}
          </button>

          {/* Export button excel */}
          <button
            onClick={() => handleExport('excel')}
            disabled={exportLoading.excel || allTransactions.length === 0}
            className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {exportLoading.excel ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="3 3 18 18">
                  <path
                    className="opacity-25"
                    fill="currentColor"
                    d="M12 3v2a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M12 3v2a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z"
                  />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>Export Excel</>
            )}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {allTransactions.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <p>Tidak ada transaksi yang tersedia.</p>
        </div>
      )}
      {/* Desktop View */}
      {allTransactions.length > 0 && (
      <div className="hidden sm:block rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allTransactions.map((item, index) => {
                return (
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
                        item.type === 'masuk' ? (kategoriPemasukan[item.kategori_pemasukan] || 'Donasi Manual') :
                        item.kategori || 'Operasional'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getNamaPemberi(item)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.source === 'kas' ? (item.keterangan || item.deskripsi || '-') :
                        item.source === 'infaq' ? (item.keterangan || '-') :
                        '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={item.type === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                        {item.type === 'masuk' ? '+' : '-'}{formatCurrency(item.jumlah)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.bukti_transfer ? (
                        <button
                          onClick={() => onOpenBukti(item.bukti_transfer)}
                          className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                        >
                          Lihat
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
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
      {allTransactions.length > 0 && (
      <div className="block sm:hidden space-y-4">
        {allTransactions.map((item, index) => (
          <div key={`${item.source}-mobile-${item.id}-${index}`} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-500">
                {new Date(item.tanggal).toLocaleDateString('id-ID')}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.type === 'masuk'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {item.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
            </div>
            
            <div className="text-sm font-medium text-gray-900 mb-1">
              {item.source === 'zakat' ? `Zakat ${item.jenis_zakat}` :
                item.source === 'infaq' ? 'Infaq' :
                item.type === 'masuk' ? (kategoriPemasukan[item.kategori_pemasukan] || 'Donasi Manual') :
                item.kategori || 'Operasional'}
            </div>
            
            {shouldShowName(item) &&(
              <div className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Nama:</span> {getNamaPemberi(item)}
              </div>
            )}
            
            {((item.source === 'kas' && (item.keterangan || item.deskripsi)) || 
              (item.source === 'infaq' && item.keterangan)) && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Deskripsi:</span> {
                  item.source === 'kas' ? (item.keterangan || item.deskripsi) :
                  item.keterangan
                }
              </div>
            )}
            
            <div className="flex justify-between items-center mb-2">
              <div className="text-lg font-medium">
                <span className={item.type === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                  {item.type === 'masuk' ? '+' : '-'}{formatCurrency(item.jumlah)}
                </span>
              </div>
              {item.bukti_transfer ? (
                <button
                  onClick={() => onOpenBukti(item.bukti_transfer)}
                  className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                >
                  Lihat Bukti
                </button>
              ) : (
                <span className="text-gray-400 text-xs">Tidak ada bukti</span>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default KasRiwayat;