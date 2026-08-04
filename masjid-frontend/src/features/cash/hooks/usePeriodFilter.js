import { useState } from 'react';

export const usePeriodFilter = (initialPeriod = 'bulan-ini') => {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  const periodLabels = {
    'hari-ini': 'Hari Ini',
    'kemarin': 'Kemarin',
    'minggu-ini': 'Minggu Ini',
    'minggu-lalu': 'Minggu Lalu',
    'bulan-ini': 'Bulan Ini',
    'bulan-lalu': 'Bulan Lalu',
    'tahun-ini': 'Tahun Ini',
    'tahun-lalu': 'Tahun Lalu',
    'custom': 'Periode Kustom'
  };

  const periodTexts = {
    'hari-ini': 'today',
    'kemarin': 'yesterday',
    'minggu-ini': 'this week',
    'minggu-lalu': 'last week',
    'bulan-ini': 'this month',
    'bulan-lalu': 'last month',
    'tahun-ini': 'this year',
    'tahun-lalu': 'last year',
    'custom': 'custom period'
  };

  const getPeriodLabel = () => periodLabels[selectedPeriod] || selectedPeriod;
  const getPeriodText = () => periodTexts[selectedPeriod] || 'period';

  return {
    selectedPeriod,
    setPeriod: setSelectedPeriod,
    getPeriodLabel,
    getPeriodText,
    periodLabels,
    periodTexts
  };
};