import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const KasValidation = ({ 
  pendingData, 
  onApprove, 
  onReject, 
  onOpenBukti,
  loading 
}) => {
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    transaction: null,
    reason: ''
  });

  const handleApprove = async (transaction) => {
    const result = await onApprove(transaction.type, transaction.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleRejectClick = (transaction) => {
    setRejectModal({
      isOpen: true,
      transaction,
      reason: ''
    });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }

    const result = await onReject(
      rejectModal.transaction.type, 
      rejectModal.transaction.id, 
      rejectModal.reason
    );
    
    if (result.success) {
      toast.success(result.message);
      setRejectModal({ isOpen: false, transaction: null, reason: '' });
    } else {
      toast.error(result.message);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'zakat': return '🕌';
      case 'infaq': return '💰';
      case 'donasi': return '🎁';
      default: return '💳';
    }
  };

  const getTransactionLabel = (transaction) => {
    switch (transaction.type) {
      case 'zakat': 
        return `Zakat ${transaction.jenis_zakat || 'Mal'}`;
      case 'infaq': 
        return `Infaq ${transaction.kategori_infaq || 'Umum'}`;
      case 'donasi': 
        return `Donasi - ${transaction.nama_barang || 'Program Donasi'}`;
      default: 
        return 'Transaksi';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'zakat': return 'bg-green-100 text-green-800';
      case 'infaq': return 'bg-blue-100 text-blue-800';
      case 'donasi': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Memuat data validasi...</span>
      </div>
    );
  }

  if (pendingData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2"> Tidak ada transaksi yang perlu divalidasi</div>
        <div className="text-gray-400">Semua pembayaran sudah diproses</div>
      </div>
    );
  }

  console.log('📊 Rendering pending data:', pendingData);
  console.log('📊 Sample zakat data:', pendingData.filter(t => t.type === 'zakat')[0]);
  console.log('📊 Sample transaction fields:', Object.keys(pendingData[0] || {}));

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="text-yellow-600">
            ⚠️ <strong>{pendingData.length} transaksi</strong> menunggu validasi
          </div>
        </div>
      </div>

      {pendingData.map((transaction) => (
        <div key={`${transaction.type}-${transaction.id}`} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 w-fit ${getTransactionColor(transaction.type)}`}>
                  {getTransactionIcon(transaction.type)} {getTransactionLabel(transaction)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Nama Pemberi</p>
                  <p className="font-medium text-sm sm:text-base">{transaction.nama_pemberi}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Nominal</p>
                  <p className="font-bold text-lg sm:text-xl text-green-600">
                    {formatCurrency(transaction.jumlah)}
                  </p>
                </div>

                {/*  KODE UNIK - MOBILE RESPONSIVE */}
                {transaction.kode_unik && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Kode Unik</p>
                    <p className="font-mono font-medium text-orange-600 text-sm sm:text-base">
                      +{transaction.kode_unik}
                    </p>
                  </div>
                )}

                {/*  TOTAL BAYAR - MOBILE RESPONSIVE */}
                {(transaction.total_bayar || transaction.total_transfer) && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {transaction.type === 'zakat' ? 'Total Bayar' : 'Total Transfer'}
                    </p>
                    <p className="font-bold text-sm sm:text-lg text-blue-600">
                      {formatCurrency(transaction.total_bayar || transaction.total_transfer)}
                    </p>
                  </div>
                )}

                {/*  JENIS ZAKAT - MOBILE RESPONSIVE */}
                {transaction.type === 'zakat' && transaction.jenis_zakat && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Jenis Zakat</p>
                    <p className="font-medium capitalize text-sm sm:text-base">{transaction.jenis_zakat}</p>
                  </div>
                )}

                {/*  METODE PEMBAYARAN - MOBILE RESPONSIVE */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Metode Pembayaran</p>
                  <p className="font-medium capitalize text-sm sm:text-base">{transaction.metode_pembayaran?.replace('_', ' ')}</p>
                </div>

                {/*  EMAIL - MOBILE RESPONSIVE */}
                {transaction.email && (
                  <div className="col-span-full sm:col-span-1">
                    <p className="text-xs sm:text-sm text-gray-600">Email</p>
                    <p className="font-medium text-blue-600 text-sm break-all">{transaction.email}</p>
                  </div>
                )}

                {/*  NO TELEPON - MOBILE RESPONSIVE */}
                {transaction.no_telepon && (
                  <div className="col-span-full sm:col-span-1">
                    <p className="text-xs sm:text-sm text-gray-600">No. Telepon</p>
                    <p className="font-medium text-sm">{transaction.no_telepon}</p>
                  </div>
                )}

                {/*  KATEGORI INFAQ - MOBILE RESPONSIVE */}
                {transaction.type === 'infaq' && transaction.kategori_infaq && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Kategori</p>
                    <p className="font-medium capitalize text-sm sm:text-base">{transaction.kategori_infaq}</p>
                  </div>
                )}

                {/*  PROGRAM DONASI - MOBILE RESPONSIVE */}
                {transaction.type === 'donasi' && transaction.nama_barang && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Program Donasi</p>
                    <p className="font-medium text-sm sm:text-base">{transaction.nama_barang}</p>
                  </div>
                )}

                {/*  KETERANGAN - MOBILE RESPONSIVE */}
                {transaction.keterangan && (
                  <div className="col-span-full">
                    <p className="text-xs sm:text-sm text-gray-600">Keterangan</p>
                    <p className="text-gray-800 text-sm">{transaction.keterangan}</p>
                  </div>
                )}

                {/*  KHUSUS ZAKAT: Breakdown Detail - MOBILE RESPONSIVE */}
                {transaction.type === 'zakat' && transaction.kode_unik && (
                  <div className="col-span-full">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 mb-3">🕌 Detail Pembayaran Zakat:</p>
                      
                      <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                        <div className="flex justify-between py-1 border-b border-green-200 sm:border-b-0">
                          <span className="text-sm">Nominal Zakat:</span>
                          <span className="font-medium text-sm">{formatCurrency(transaction.jumlah)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-green-200 sm:border-b-0">
                          <span className="text-sm">Kode Unik:</span>
                          <span className="font-mono text-orange-600 text-sm">+{transaction.kode_unik}</span>
                        </div>
                        {transaction.total_bayar && (
                          <div className="flex justify-between py-2 border-t border-green-300 font-semibold sm:col-span-2 sm:border-t-2">
                            <span className="text-sm">Total Transfer:</span>
                            <span className="text-green-600 text-sm">{formatCurrency(transaction.total_bayar)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/*  KHUSUS ZAKAT FITRAH: Jumlah Jiwa */}
                {transaction.type === 'zakat' && transaction.jenis_zakat === 'fitrah' && transaction.jumlah_jiwa && (
                  <div className="col-span-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800 font-medium">👥 Jumlah Jiwa:</span>
                        <span className="text-sm font-semibold text-blue-900">{transaction.jumlah_jiwa} orang</span>
                      </div>
                    </div>
                  </div>
                )}

                {/*  KHUSUS ZAKAT MAAL: Total Harta */}
                {transaction.type === 'zakat' && transaction.jenis_zakat === 'maal' && transaction.total_harta && (
                  <div className="col-span-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800 font-medium">💎 Total Harta:</span>
                        <span className="text-sm font-semibold text-blue-900">{formatCurrency(transaction.total_harta)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/*  KHUSUS ZAKAT PROFESI: Gaji Kotor */}
                {transaction.type === 'zakat' && transaction.jenis_zakat === 'profesi' && transaction.gaji_kotor && (
                  <div className="col-span-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800 font-medium">💼 Gaji Kotor:</span>
                        <span className="text-sm font-semibold text-blue-900">{formatCurrency(transaction.gaji_kotor)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/*  KHUSUS INFAQ: Detail Breakdown - MOBILE RESPONSIVE */}
                {transaction.type === 'infaq' && transaction.kode_unik && (
                  <div className="col-span-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800 mb-3">💰 Detail Infaq:</p>
                      
                      <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                        <div className="flex justify-between py-1 border-b border-blue-200 sm:border-b-0">
                          <span className="text-sm">Nominal Infaq:</span>
                          <span className="font-medium text-sm">{formatCurrency(transaction.jumlah)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-blue-200 sm:border-b-0">
                          <span className="text-sm">Kode Unik:</span>
                          <span className="font-mono text-orange-600 text-sm">+{transaction.kode_unik}</span>
                        </div>
                        {transaction.total_bayar && (
                          <div className="flex justify-between py-2 border-t border-blue-300 font-semibold sm:col-span-2 sm:border-t-2">
                            <span className="text-sm">Total Transfer:</span>
                            <span className="text-blue-600 text-sm">{formatCurrency(transaction.total_bayar)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/*BUKTI TRANSFER - MOBILE RESPONSIVE */}
              {transaction.bukti_transfer && (
                <div className="mb-4">
                  <button
                    onClick={() => onOpenBukti(transaction.bukti_transfer)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline text-xs sm:text-sm hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  >
                    📎 <span className="hidden sm:inline">Lihat Bukti Transfer</span><span className="sm:hidden">Bukti</span>
                  </button>
                </div>
              )}
            </div>

            {/*  ACTION BUTTONS - MOBILE RESPONSIVE */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto">
              <button
                onClick={() => handleApprove(transaction)}
                className="px-3 py-2 sm:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1 text-sm sm:text-base"
              >
                 <span className="hidden sm:inline">Approve</span><span className="sm:hidden">OK</span>
              </button>
              <button
                onClick={() => handleRejectClick(transaction)}
                className="px-3 py-2 sm:px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 text-sm sm:text-base"
              >
                ❌ <span className="hidden sm:inline">Tolak</span><span className="sm:hidden">No</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/*  REJECT MODAL - MOBILE RESPONSIVE */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tolak Transaksi</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Mengapa Anda menolak transaksi dari{' '}
              <strong>{rejectModal.transaction?.nama_pemberi}</strong>?
            </p>
            
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Masukkan alasan penolakan..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 sm:h-24 mb-4 text-sm sm:text-base"
              required
            />
            
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setRejectModal({ isOpen: false, transaction: null, reason: '' })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
              >
                Tolak Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KasValidation;