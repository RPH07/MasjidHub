import { useCallback, useEffect, useMemo, useState } from 'react';
import { kasService } from '../services/kasService';
import { kategoriPemasukan } from '../utils/constants';

const initialSummary = {
  totalSaldo: 0,
  totalPemasukan: 0,
  totalPengeluaran: 0,
  saldoBersih: 0,
  pemasukanKategori: {},
  pengeluaranKategori: {},
  kodeUnikStats: {
    totalTransaksi: 0,
    totalKodeUnik: 0
  },
  percentageChanges: {
    saldo: 0,
    pemasukan: 0,
    pengeluaran: 0
  }
};

const getFilterParams = (selectedPeriod, customDateRange) => {
  if (customDateRange?.startDate && customDateRange?.endDate) {
    return {
      startDate: customDateRange.startDate,
      endDate: customDateRange.endDate
    };
  }

  return {
    period: selectedPeriod || 'bulan-ini'
  };
};

export const useKasData = (selectedPeriod) => {
  const [summary, setSummary] = useState(initialSummary);
  const [transactions, setTransactions] = useState([]);
  const [pemasukanData, setPemasukanData] = useState([]);
  const [pengeluaranData, setPengeluaranData] = useState([]);
  const [history, setHistory] = useState({ transactions: [], summary: {}, filters: {} });
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({});
  const [customDateRange, setCustomDateRangeState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filterParams = useMemo(
    () => getFilterParams(selectedPeriod, customDateRange),
    [selectedPeriod, customDateRange]
  );

  const setCustomDateRange = useCallback((startDate, endDate) => {
    setCustomDateRangeState({ startDate, endDate });
  }, []);

  const clearCustomDateRange = useCallback(() => {
    setCustomDateRangeState(null);
  }, []);

  const fetchKasData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryData, allData, masukData, keluarData, historyData] = await Promise.all([
        kasService.getSummary(filterParams),
        kasService.getTransactions({ ...filterParams, limit: 200 }),
        kasService.getTransactions({ ...filterParams, jenis: 'masuk', limit: 200 }),
        kasService.getTransactions({ ...filterParams, jenis: 'keluar', limit: 200 }),
        kasService.getHistory({ ...filterParams, type: 'all', status: 'all' })
      ]);

      setSummary({ ...initialSummary, ...summaryData });
      setTransactions(allData.transactions || []);
      setPemasukanData(masukData.transactions || []);
      setPengeluaranData(keluarData.transactions || []);
      setHistory(historyData);
      setPagination(allData.pagination || {});
      setFilters(allData.filters || filterParams);
    } catch (err) {
      console.error('Error fetching kas data:', err);
      setError(err.response?.data?.msg || err.response?.data?.error || 'Gagal mengambil data kas');
      setSummary(initialSummary);
      setTransactions([]);
      setPemasukanData([]);
      setPengeluaranData([]);
      setHistory({ transactions: [], summary: {}, filters: {} });
      setPagination({});
      setFilters(filterParams);
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchKasData();
  }, [fetchKasData]);

  const voidPendingData = useMemo(
    () => transactions.filter((item) => item.void_status === 'requested'),
    [transactions]
  );

  return {
    loading,
    error,
    summary,
    transactions,
    pemasukanData,
    pengeluaranData,
    history,
    pagination,
    filters,
    customDateRange,
    voidPendingData,
    refreshData: fetchKasData,
    setCustomDateRange,
    clearCustomDateRange,
    kategoriPemasukan,

    // Backward-compatible aliases while old components are being retired.
    kasData: transactions,
    zakatData: [],
    infaqData: [],
    donasiData: []
  };
};
