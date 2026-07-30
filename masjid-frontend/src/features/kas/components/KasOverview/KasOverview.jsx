import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import PercentageBadge from '../shared/PercentageBadge';

const formatLabel = (value) => {
  if (!value) return '-';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const KasOverview = ({ summary = {} }) => {
  const percentageChanges = summary.percentageChanges || {
    saldo: 0,
    pemasukan: 0,
    pengeluaran: 0
  };

  const pemasukanKategori = summary.pemasukanKategori || {};
  const pengeluaranKategori = summary.pengeluaranKategori || {};

  const pemasukanLabels = {
    zakat: 'Zakat',
    infaq: 'Infaq',
    donasi: 'Donasi Program',
    kas_manual: 'Kas Manual'
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 shadow-sm">
          <div className="text-sm opacity-90">Saldo Saat Ini</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold">
            {formatCurrency(summary.totalSaldo || 0)}
          </div>
          <div className="mt-2">
            <PercentageBadge percentage={percentageChanges.saldo} />
          </div>
        </div>

        <div className="rounded-lg border bg-blue-50 p-4 sm:p-6 shadow-sm">
          <div className="text-sm text-blue-600">Total Pemasukan</div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-blue-700">
            {formatCurrency(summary.totalPemasukan || 0)}
          </div>
          <div className="mt-2">
            <PercentageBadge percentage={percentageChanges.pemasukan} />
          </div>
        </div>

        <div className="rounded-lg border bg-red-50 p-4 sm:p-6 shadow-sm">
          <div className="text-sm text-red-600">Total Pengeluaran</div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-red-700">
            {formatCurrency(summary.totalPengeluaran || 0)}
          </div>
          <div className="mt-2">
            <PercentageBadge percentage={percentageChanges.pengeluaran} />
          </div>
        </div>

        <div className="rounded-lg border bg-yellow-50 p-4 sm:p-6 shadow-sm">
          <div className="text-sm text-yellow-600">Total Kode Unik</div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-yellow-700">
            +{formatCurrency(summary.kodeUnikStats?.totalKodeUnik || 0)}
          </div>
          <div className="mt-1 text-xs text-yellow-600">
            {summary.kodeUnikStats?.totalTransaksi || 0} transaksi
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Pemasukan per Kategori</h3>
          <div className="space-y-3">
            {Object.entries(pemasukanKategori).map(([kategori, total]) => (
              <div key={kategori} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-700">
                  {pemasukanLabels[kategori] || formatLabel(kategori)}
                </span>
                <span className="font-bold text-blue-700">{formatCurrency(total)}</span>
              </div>
            ))}

            {Object.keys(pemasukanKategori).length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Belum ada pemasukan pada periode ini
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Pengeluaran per Kategori</h3>
          <div className="space-y-3">
            {Object.entries(pengeluaranKategori).map(([kategori, total]) => (
              <div key={kategori} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-700">{formatLabel(kategori)}</span>
                <span className="font-bold text-red-700">{formatCurrency(total)}</span>
              </div>
            ))}

            {Object.keys(pengeluaranKategori).length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Belum ada pengeluaran pada periode ini
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KasOverview;
