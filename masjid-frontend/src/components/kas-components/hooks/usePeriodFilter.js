import { useState } from 'react';

export const usePeriodFilter = (initialPeriod = 'bulan-ini') => {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  const periodLabels = {
    'hari-ini': 'Hari Ini',
    'minggu-ini': 'Minggu Ini',
    'bulan-ini': 'Bulan Ini',
    'tahun-ini': 'Tahun Ini'
  };

  const periodTexts = {
    'hari-ini': 'day',
    'minggu-ini': 'week',
    'bulan-ini': 'month',
    'tahun-ini': 'year'
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