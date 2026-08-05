import React, { useState } from 'react';
import { useCashData } from '@/features/cash/hooks/useCashData';
import { usePeriodFilter } from '@/features/cash/hooks/usePeriodFilter';
import { useModal } from '@/features/cash/hooks/useModal';
import { useTransactionOps } from '@/features/cash/hooks/useTransactionOps';
import { useValidationOps } from '@/features/cash/hooks/useValidationOps';
import { Button } from "@/components/ui/button";
import { FloatingDate } from '@/components/form';
import {
  CashOverview,
  CashIncome,
  CashExpense,
  CashHistory,
  CashValidation,
  TransactionModal,
  BuktiModal
} from '@/features/cash/components';
import { TABS, PERIOD_OPTIONS } from '@/features/cash/utils/constants';
import { Skeleton } from '@/components/ui/skeleton';

const CashSkeleton = () => (
  <div className="space-y-6 px-5 sm:px-0">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-10 w-full sm:w-40" />
    </div>

    <div className="border-b border-gray-200">
      <div className="flex gap-8 overflow-hidden pb-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-24 shrink-0" />
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-8 w-36" />
          <Skeleton className="mt-3 h-6 w-20" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, panelIndex) => (
        <div key={panelIndex} className="rounded-lg border bg-white p-4 shadow-sm">
          <Skeleton className="mb-4 h-6 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Kas = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // State untuk custom date range
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Custom hooks
  const { selectedPeriod, setPeriod, getPeriodLabel } = usePeriodFilter('bulan-ini');
  const kasDataHook = useCashData(selectedPeriod);
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
    return <CashSkeleton />;
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
            <FloatingDate
              label="Tanggal Mulai"
              name="customStartDate"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
            <FloatingDate
              label="Tanggal Selesai"
              name="customEndDate"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
            <Button
              onClick={applyCustomDate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Terapkan
            </Button>
            <Button
              onClick={() => setShowCustomDate(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-8 whitespace-nowrap">
          {Object.entries(TABS).map(([key, tab]) => (
            <Button
              key={key}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(key)}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>     
       {/* Tab Content */}
      <div>        
        {activeTab === 'overview' && (
          <CashOverview
            summary={kasDataHook.summary}
            periodLabel={getPeriodLabel()}
            selectedPeriod={selectedPeriod}
          />
        )}

        {activeTab === 'validasi' && (
          <CashValidation
            pendingData={kasDataHook.voidPendingData}
            loading={kasDataHook.loading || validationOps.loading}
            onApprove={validationOps.approveVoid}
            onReject={validationOps.rejectVoid}
          />
        )}

        {activeTab === 'pemasukan' && (
          <CashIncome
            transactions={kasDataHook.pemasukanData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenBukti={handleOpenBukti}
            onOpenModal={openTransactionModal}
            onRequestVoid={handleRequestVoid}
          />
        )}

        {activeTab === 'pengeluaran' && (
          <CashExpense
            transactions={kasDataHook.pengeluaranData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenModal={openTransactionModal}
            onRequestVoid={handleRequestVoid}
          />
        )}

        {activeTab === 'riwayat' && (
          <CashHistory
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
