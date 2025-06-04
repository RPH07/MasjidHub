import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import PercentageBadge from '../shared/PercentageBadge';

const KasOverview = ({ summary, kategoriPemasukan }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 shadow-sm">
          <div className="text-sm opacity-90">Saldo Saat Ini</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold">{formatCurrency(summary.totalSaldo)}</div>
          <div className="mt-2">
            {summary.percentageChanges && <PercentageBadge percentage={summary.percentageChanges.saldo} />}
          </div>
        </div>

        <div className="rounded-lg border bg-blue-50 p-4 sm:p-6 shadow-sm">
          <div className="text-sm text-blue-600">Total Pemasukan</div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-blue-700">{formatCurrency(summary.totalPemasukan)}</div>
          <div className="mt-2">
            {summary.percentageChanges && <PercentageBadge percentage={summary.percentageChanges.pemasukan} />}
          </div>
        </div>

        <div className="rounded-lg border bg-red-50 p-4 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="text-sm text-red-600">Total Pengeluaran</div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-red-700">{formatCurrency(summary.totalPengeluaran)}</div>
          <div className="mt-2">
            {summary.percentageChanges && <PercentageBadge percentage={summary.percentageChanges.pengeluaran} />}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Pemasukan per Kategori</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base">Zakat</span>
              <span className="font-medium text-green-600 text-sm sm:text-base">{formatCurrency(summary.pemasukanKategori.zakat)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base">Infaq</span>
              <span className="font-medium text-green-600 text-sm sm:text-base">{formatCurrency(summary.pemasukanKategori.infaq)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base">Lelang</span>
              <span className="font-medium text-green-600 text-sm sm:text-base">{formatCurrency(summary.pemasukanKategori.lelang)}</span>
            </div>
            
            {/* UI ADJUSTMENT: Ensured proper hierarchical display for "Donasi Lainnya" aggregate and its corresponding detailed manual entries. */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Donasi Lainnya</span>
                <span className="font-medium text-green-600 text-sm sm:text-base">
                  {formatCurrency(summary.pemasukanKategori.donasi || 0)}
                </span>
              </div>
              
              {summary.pemasukanKategoriManual && Object.entries(summary.pemasukanKategoriManual).map(([key, amount]) => {
                if (amount > 0) {
                  return (
                    <div key={key} className="flex justify-between items-center pl-4 border-l-2 border-gray-200">
                      <span className="text-xs sm:text-sm text-gray-600">• {kategoriPemasukan[key]}</span>
                      <span className="font-medium text-green-600 text-xs sm:text-sm">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Pengeluaran per Kategori</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base">Operasional Masjid</span>
              <span className="font-medium text-red-600 text-sm sm:text-base">{formatCurrency(summary.pengeluaranKategori.operasional)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base">Kegiatan Masjid</span>
              <span className="font-medium text-red-600 text-sm sm:text-base">{formatCurrency(summary.pengeluaranKategori.kegiatan)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base">Pemeliharaan</span>
              <span className="font-medium text-red-600 text-sm sm:text-base">{formatCurrency(summary.pengeluaranKategori.pemeliharaan)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base">Bantuan Sosial</span>
              <span className="font-medium text-red-600 text-sm sm:text-base">{formatCurrency(summary.pengeluaranKategori.bantuan)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KasOverview;
