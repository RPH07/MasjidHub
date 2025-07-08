import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatters';
import PercentageBadge from '../shared/PercentageBadge';

const KasOverview = () => {
  const [summary, setSummary] = useState(null);

useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/kas/summary');
        setSummary(res.data.data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };
    fetchSummary();
  }, []);

  const safePercentageChanges = summary?.percentageChanges || {
    saldo: 0,
    pemasukan: 0,
    pengeluaran: 0,
  };

  //  FUNGSI YANG SUDAH DIPERBAIKI
  const groupByMainKategori = (data) => {
    const result = {};
    Object.entries(data || {}).forEach(([kategori, total]) => {
      const [main, sub] = kategori.split('_');
      const mainCategory = main.charAt(0).toUpperCase() + main.slice(1);

      if(!result[mainCategory]) result[mainCategory] = [];
      result[mainCategory].push({
        sub: sub ? sub.charAt(0).toUpperCase() + sub.slice(1) : 'Umum',
        total
      });
    });
    return result;
  };

  console.log("🔍 KasOverview props:", { summary });


  // ✅ ADD: Check if summary exists
  if (!summary) {
    console.log("❌ No summary data available");
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Data tidak tersedia</p>
      </div>
    );
  }

  // console.log("✅ Rendering KasOverview with summary:", summary);

  //  HANYA UNTUK PENGELUARAN
  const pengeluaran = groupByMainKategori(summary.pengeluaranKategori);

  return (
    <div className="space-y-6">
      {/* Total Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 shadow-sm">
          <div className="text-sm opacity-90">Saldo Saat Ini</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold">
            {formatCurrency(summary.totalSaldo)}
          </div>
          <div className="mt-2">
            {safePercentageChanges && (
              <PercentageBadge percentage={safePercentageChanges?.saldo} />
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-blue-50 p-4 sm:p-6 shadow-sm">
          <div className="text-sm text-blue-600">Total Pemasukan</div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-blue-700">
            {formatCurrency(summary.totalPemasukan)}
          </div>
          <div className="mt-2">
            {safePercentageChanges && (
              <PercentageBadge percentage={safePercentageChanges?.pemasukan} />
            )}
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

        <div className="rounded-lg border bg-red-50 p-4 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="text-sm text-red-600">Total Pengeluaran</div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-red-700">
            {formatCurrency(summary.totalPengeluaran)}
          </div>
          <div className="mt-2">
            {safePercentageChanges && (
              <PercentageBadge percentage={safePercentageChanges?.pengeluaran} />
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Pemasukan */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Pemasukan per Kategori</h3>
          <div className='space-y-3'>
            {Object.entries(summary.pemasukanKategori || {}).map(([kategori, total]) => {
              const icons = {
                'zakat': '🕌',
                'infaq': '📝', 
                'donasi': '💝',
                'kas_manual': '✏️'
              };
              
              const displayNames = {
                'zakat': 'Zakat',
                'infaq': 'Infaq',
                'donasi': 'Donasi Program', 
                'kas_manual': 'Kas Manual'
              };
              
              const icon = icons[kategori] || '💰';
              const name = displayNames[kategori] || kategori;
              
              return (
                <div key={kategori} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium text-blue-700">{name}</span>
                  </div>
                  <span className="font-bold text-blue-700">
                    {formatCurrency(total)}
                  </span>
                </div>
              );
            })}

            {Object.keys(summary.pemasukanKategori || {}).length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Belum ada pemasukan pada periode ini
              </div>
            )}
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Pengeluaran per Kategori</h3>
          {Object.entries(pengeluaran).map(([main, items]) => (
            <div key={main} className="mb-3">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base font-medium capitalize text-red-700">{main}</span>
                <span className="text-sm font-bold text-red-700">
                  {formatCurrency(items.reduce((a, b) => a + b.total, 0))}
                </span>
              </div>
              <ul className="ml-4 mt-1 list-disc text-sm text-gray-700 space-y-1">
                {items.map(({ sub, total }) => (
                  <li key={sub} className="flex justify-between">
                    <span className="capitalize">{sub}</span>
                    <span>{formatCurrency(total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {Object.keys(pengeluaran).length === 0 && (
            <div className="text-center text-gray-500 py-4">
              Belum ada pengeluaran pada periode ini
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KasOverview;