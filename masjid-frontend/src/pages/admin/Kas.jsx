import React, { useState } from 'react';
import { useKasData } from '../../components/kas-components/hooks/useKasData';
import { usePeriodFilter } from '../../components/kas-components/hooks/usePeriodFilter';
import { useModal } from '../../components/kas-components/hooks/useModal';
import { useTransactionOps } from '../../components/kas-components/hooks/useTransactionOps';
import {
  KasOverview,
  KasPemasukan,
  KasPengeluaran,
  KasRiwayat,
  TransactionModal,
  BuktiModal
} from '../../components/kas-components/components';
import { TABS } from '../../components/kas-components/utils/constants';

const Kas = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Custom hooks
  const { selectedPeriod, setPeriod, getPeriodLabel } = usePeriodFilter('bulan-ini');
  const kasDataHook = useKasData(selectedPeriod);
  const { deleteTransaction } = useTransactionOps(kasDataHook.refreshData);
  const {
    showModal,
    modalType,
    editData,
    showBuktiModal,
    selectedBukti,
    openTransactionModal,
    closeTransactionModal,
    openBuktiModal,
    closeBuktiModal
  } = useModal();

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
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="hari-ini">Hari Ini</option>
            <option value="minggu-ini">Minggu Ini</option>
            <option value="bulan-ini">Bulan Ini</option>
            <option value="tahun-ini">Tahun Ini</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
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
      </div>      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <KasOverview
            summary={kasDataHook.summary}
            periodLabel={getPeriodLabel()}
            kategoriPemasukan={kasDataHook.kategoriPemasukan}
          />
        )}

        {activeTab === 'pemasukan' && (
          <KasPemasukan
            kasData={kasDataHook.kasData}
            zakatData={kasDataHook.zakatData}
            infaqData={kasDataHook.infaqData}
            lelangData={kasDataHook.lelangData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenBukti={openBuktiModal}
            onAddTransaction={() => openTransactionModal('add-pemasukan')}
          />
        )}

        {activeTab === 'pengeluaran' && (
          <KasPengeluaran
            kasData={kasDataHook.kasData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenBukti={openBuktiModal}
            onAddTransaction={() => openTransactionModal('add-pengeluaran')}
          />
        )}

        {activeTab === 'riwayat' && (
          <KasRiwayat
            kasData={kasDataHook.kasData}
            zakatData={kasDataHook.zakatData}
            infaqData={kasDataHook.infaqData}
            onOpenBukti={openBuktiModal}
          />
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={closeTransactionModal}
        type={modalType}
        editData={editData}
        onSuccess={kasDataHook.refreshData}
      />

      {/* Bukti Modal */}
      <BuktiModal
        isOpen={showBuktiModal}
        onClose={closeBuktiModal}
        imageUrl={selectedBukti}
      />
    </div>
  );
};

export default Kas;