import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

const formatLabel = (value) => {
  if (!value) return '-';
  return String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const KasValidation = ({
  pendingData = [],
  onApprove,
  onReject,
  loading
}) => {
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    transaction: null,
    reason: ''
  });

  const [actionLoading, setActionLoading] = useState({
    id: null,
    action: ''
  });

  const isActionLoading = (transaction, action) =>
    actionLoading.id === transaction.id && actionLoading.action === action;

  const handleApprove = async (transaction) => {
    setActionLoading({ id: transaction.id, action: 'approve' });
    try {
      const result = await onApprove(transaction.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } finally {
      setActionLoading({ id: null, action: '' });
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }
    setActionLoading({ id: rejectModal.transaction.id, action: 'reject' });

    try {
      const result = await onReject(rejectModal.transaction.id, rejectModal.reason);
    if (result.success) {
      toast.success(result.message);
      setRejectModal({ isOpen: false, transaction: null, reason: '' });
    } else {
      toast.error(result.message);
    }
    } catch  {
      toast.error('Terjadi kesalahan saat menolak void');
    } finally {
      setActionLoading({ id: null, action: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Memuat permintaan void...</span>
      </div>
    );
  }

  if (pendingData.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border">
        <div className="text-gray-600 text-lg mb-1">Tidak ada permintaan void</div>
        <div className="text-gray-400">Semua transaksi aktif belum memiliki request void pending.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <strong>{pendingData.length} transaksi</strong> menunggu persetujuan void ketua/bendahara.
      </div>

      {pendingData.map((transaction) => (
        <div key={transaction.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  transaction.jenis === 'masuk' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Void Pending
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(transaction.void_requested_at || transaction.updated_at).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Deskripsi</p>
                  <p className="font-medium">{transaction.deskripsi || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nominal</p>
                  <p className="font-bold text-lg">{formatCurrency(transaction.jumlah)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sumber</p>
                  <p className="font-medium">{formatLabel(transaction.source_table)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kategori</p>
                  <p className="font-medium">{formatLabel(transaction.kategori)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500">Alasan Void</p>
                  <p className="text-gray-800">{transaction.void_reason || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-40">
              <button
                onClick={() => handleApprove(transaction)}
                disabled={isActionLoading(transaction, 'approve') || isActionLoading(transaction, 'reject')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isActionLoading(transaction, 'approve') ? 'Memproses...' : 'Setujui'}
              </button>
              <button
                onClick={() => setRejectModal({ isOpen: true, transaction, reason: '' })}
                disabled={isActionLoading(transaction, 'approve') || isActionLoading(transaction, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      ))}

      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tolak Permintaan Void</h3>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Masukkan alasan penolakan..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4 text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setRejectModal({ isOpen: false, transaction: null, reason: '' })}
                disabled={rejectModal.transaction && isActionLoading(rejectModal.transaction, 'reject')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={rejectModal.transaction && isActionLoading(rejectModal.transaction, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejectModal.transaction && isActionLoading(rejectModal.transaction, 'reject')
                  ? 'Memproses...'
                  : 'Tolak Void'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KasValidation;
