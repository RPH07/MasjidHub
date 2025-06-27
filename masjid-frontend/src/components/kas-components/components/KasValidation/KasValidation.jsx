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
        <div className="text-gray-500 text-lg mb-2">✅ Tidak ada transaksi yang perlu divalidasi</div>
        <div className="text-gray-400">Semua pembayaran sudah diproses</div>
      </div>
    );
  }

  console.log('Rendering pending data:', pendingData); // Debug log

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
        <div key={`${transaction.type}-${transaction.id}`} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getTransactionColor(transaction.type)}`}>
                  {getTransactionIcon(transaction.type)} {getTransactionLabel(transaction)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Pemberi</p>
                  <p className="font-medium">{transaction.nama_pemberi}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nominal</p>
                  <p className="font-bold text-lg text-green-600">
                    {formatCurrency(transaction.jumlah)}
                  </p>
                </div>

                {/* Specific fields for each type */}
                {transaction.type === 'zakat' && transaction.jenis_zakat && (
                  <div>
                    <p className="text-sm text-gray-600">Jenis Zakat</p>
                    <p className="font-medium capitalize">{transaction.jenis_zakat}</p>
                  </div>
                )}

                {transaction.type === 'infaq' && transaction.kategori_infaq && (
                  <div>
                    <p className="text-sm text-gray-600">Kategori</p>
                    <p className="font-medium capitalize">{transaction.kategori_infaq}</p>
                  </div>
                )}

                {transaction.type === 'donasi' && (
                  <>
                    {transaction.kode_unik && (
                      <div>
                        <p className="text-sm text-gray-600">Kode Unik</p>
                        <p className="font-mono font-medium text-blue-600">
                          +{transaction.kode_unik.toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                    {transaction.total_transfer && (
                      <div>
                        <p className="text-sm text-gray-600">Total Transfer</p>
                        <p className="font-bold text-purple-600">
                          {formatCurrency(transaction.total_transfer)}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <p className="text-sm text-gray-600">Metode Pembayaran</p>
                  <p className="font-medium capitalize">{transaction.metode_pembayaran?.replace('_', ' ')}</p>
                </div>

                {transaction.keterangan && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Keterangan</p>
                    <p className="text-gray-800">{transaction.keterangan}</p>
                  </div>
                )}
              </div>

              {transaction.bukti_transfer && (
                <div className="mb-4">
                  <button
                    onClick={() => onOpenBukti(transaction.bukti_transfer)}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    📎 Lihat Bukti Transfer
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleApprove(transaction)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleRejectClick(transaction)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ❌ Tolak
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Tolak Transaksi</h3>
            <p className="text-gray-600 mb-4">
              Mengapa Anda menolak transaksi dari{' '}
              <strong>{rejectModal.transaction?.nama_pemberi}</strong>?
            </p>
            
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Masukkan alasan penolakan..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4"
              required
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModal({ isOpen: false, transaction: null, reason: '' })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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