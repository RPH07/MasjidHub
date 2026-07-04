import React, { useState } from 'react';
import { useKasData } from '../../components/kas-components/hooks/useKasData';
import { usePeriodFilter } from '../../components/kas-components/hooks/usePeriodFilter';
import { useModal } from '../../components/kas-components/hooks/useModal';
import { useTransactionOps } from '../../components/kas-components/hooks/useTransactionOps';
import { useValidationOps } from '../../components/kas-components/hooks/useValidationOps';
import {
  KasOverview,
  KasPemasukan,
  KasPengeluaran,
  KasRiwayat,
  KasValidation,
  TransactionModal,
  BuktiModal
} from '../../components/kas-components/components';
import { TABS, PERIOD_OPTIONS } from '../../components/kas-components/utils/constants';

const Kas = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // State untuk custom date range
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Custom hooks
  const { selectedPeriod, setPeriod, getPeriodLabel } = usePeriodFilter('bulan-ini');
  const kasDataHook = useKasData(selectedPeriod);
  const { deleteTransaction } = useTransactionOps(kasDataHook.refreshData);
  const validationOps = useValidationOps(kasDataHook.refreshData);
  
  const {
    showModal,
    modalType,
    editData,
    showBuktiModal,
    selectedBukti,
    buktiTransactionInfo,
    openTransactionModal,
    closeTransactionModal,
    openBuktiModal,
    closeBuktiModal
  } = useModal();

  const handlePeriodChange = (value) => {
    if (value === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      kasDataHook.clearCustomDateRange();
      setPeriod(value);
    }
  };

  const applyCustomDate = () => {
    if (customStartDate && customEndDate) {
      // Update kasDataHook to accept custom dates
      kasDataHook.setCustomDateRange(customStartDate, customEndDate);
      setShowCustomDate(false);
    }
  };

  const handleOpenBukti = (buktiTransfer, transactionInfo = null) => {
    if (!buktiTransfer) {
      alert('Bukti transfer tidak tersedia');
      return;
    }

    openBuktiModal(buktiTransfer, transactionInfo);
  };

  // Loading state
  if (kasDataHook.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle delete transaction
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      await deleteTransaction(id);
    }
  };

  const handleRequestVoid = async (transaction) => {
    const reason = window.prompt('Masukkan alasan void transaksi:');
    if (!reason?.trim()) return;

    const result = await validationOps.requestVoid(transaction.id, reason.trim());
    if (!result.success) {
      alert(result.message);
    }
  };

  // Handle edit transaction
  const handleEdit = (transaction) => {
    const type = transaction.jenis === 'masuk' ? 'edit-pemasukan' : 'edit-pengeluaran';
    openTransactionModal(type, transaction);
  };

  return (
    <div className="space-y-6 px-5 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Manajemen Kas</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomDate && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium mb-3">Pilih Periode Kustom</h3>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tanggal Selesai</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={applyCustomDate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Terapkan
            </button>
            <button
              onClick={() => setShowCustomDate(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-8 whitespace-nowrap">
          {Object.entries(TABS).map(([key, tab]) => (
            <button
              key={key}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>     
       {/* Tab Content */}
      <div>        
        {activeTab === 'overview' && (
          <KasOverview
            summary={kasDataHook.summary}
            periodLabel={getPeriodLabel()}
            selectedPeriod={selectedPeriod}
          />
        )}

        {activeTab === 'validasi' && (
          <KasValidation
            pendingData={kasDataHook.voidPendingData}
            loading={kasDataHook.loading || validationOps.loading}
            onApprove={validationOps.approveVoid}
            onReject={validationOps.rejectVoid}
          />
        )}

        {activeTab === 'pemasukan' && (
          <KasPemasukan
            transactions={kasDataHook.pemasukanData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenBukti={handleOpenBukti}
            onOpenModal={openTransactionModal}
            onRequestVoid={handleRequestVoid}
          />
        )}

        {activeTab === 'pengeluaran' && (
          <KasPengeluaran
            transactions={kasDataHook.pengeluaranData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenModal={openTransactionModal}
            onRequestVoid={handleRequestVoid}
          />
        )}

        {activeTab === 'riwayat' && (
          <KasRiwayat
            history={kasDataHook.history}
            filters={kasDataHook.history.filters || kasDataHook.filters}
            onOpenBukti={handleOpenBukti}
          />
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={closeTransactionModal}
        type={modalType}
        data={editData}
        onSuccess={kasDataHook.refreshData}
      />

      {/* Bukti Modal */}
      <BuktiModal
        isOpen={showBuktiModal}
        onClose={closeBuktiModal}
        buktiTransfer={selectedBukti}
        transactionInfo={buktiTransactionInfo}
      />
    </div>
  );
};

export default Kas;
