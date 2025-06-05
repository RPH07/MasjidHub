import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const KasValidation = ({ 
  pendingData, 
  onApprove, 
  onReject, 
  onOpenBukti,
  loading 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pendingData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <p>Tidak ada pembayaran yang perlu divalidasi</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-lg font-medium">Validasi Pembayaran</h3>
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          {pendingData.length} pending
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bukti</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingData.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'zakat' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.type === 'zakat' ? `Zakat ${item.jenis_zakat}` : 'Infaq'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.metode_pembayaran === 'qris'
                        ? 'bg-purple-100 text-purple-800'
                        : item.metode_pembayaran === 'cash'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.metode_pembayaran === 'qris' ? '📱 QRIS' :
                        item.metode_pembayaran === 'cash' ? '💵 Tunai' :
                          '🏦 Transfer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(item.nominal)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.bukti_transfer ? (
                      <button
                        onClick={() => onOpenBukti(item.bukti_transfer)}
                        className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                      >
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onApprove(item.type, item.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => onReject(item.type, item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {pendingData.map((item) => (
          <div key={`${item.type}-mobile-${item.id}`} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString('id-ID')}
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>
            
            <div className="mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.type === 'zakat' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {item.type === 'zakat' ? `Zakat ${item.jenis_zakat}` : 'Infaq'}
              </span>
            </div>
            
            <div className="text-sm font-medium text-gray-900 mb-2">{item.nama}</div>
            
            <div className="flex justify-between items-center mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.metode_pembayaran === 'qris'
                  ? 'bg-purple-100 text-purple-800'
                  : item.metode_pembayaran === 'cash'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
              }`}>
                {item.metode_pembayaran === 'qris' ? '📱 QRIS' :
                  item.metode_pembayaran === 'cash' ? '💵 Tunai' :
                    '🏦 Transfer'}
              </span>
              <div className="text-lg font-medium text-green-600">
                {formatCurrency(item.nominal)}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                {item.bukti_transfer ? (
                  <button
                    onClick={() => onOpenBukti(item.bukti_transfer)}
                    className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                  >
                    Lihat Bukti
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">Tidak ada bukti</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onApprove(item.type, item.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Setujui
                </button>
                <button
                  onClick={() => onReject(item.type, item.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Tolak
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KasValidation;
