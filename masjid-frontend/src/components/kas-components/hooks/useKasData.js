import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {kategoriPemasukan} from '../utils/constants';

export const useKasData = (selectedPeriod) => {
    const [state, setState] = useState({
    loading: false,
    kasData: [],
    zakatData: [],
    infaqData: [],
    lelangData: [],
    summary: {
        totalSaldo: 0,
        totalPemasukan: 0,
        totalPengeluaran: 0,
        pemasukanKategori: {
        zakat: 0,
        infaq: 0,
        lelang: 0,
        donasi: 0
        },
        pengeluaranKategori: {
        operasional: 0,
        kegiatan: 0,
        pemeliharaan: 0,
        bantuan: 0
        }
    }
    });

    const getPreviousPeriod = useCallback((currentPeriod) => {
        const today = new Date();

        switch (currentPeriod){
            case 'hari-ini':{
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return {
                    period: 'custom',
                    startDate: yesterday.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0]
                };
            }

            case 'minggu-ini': {
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
                return {
                    period: 'custom',
                    startDate: lastWeekStart.toISOString().split('T')[0],
                    endDate: lastWeekEnd.toISOString().split('T')[0]
                };
            }

            case 'bulan-ini': {
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
                return {
                    period: 'custom',
                    startDate: lastMonth.toISOString().split('T')[0],
                    endDate: lastMonthEnd.toISOString().split('T')[0]
                };
            }

            case 'tahun-ini': {
                const lastYear = new Date(today.getFullYear() - 1, 0, 1);
                const lastYearEnd = new Date(today.getFullYear(), 0, 1);
                return {
                    period: 'custom',
                    startDate: lastYear.toISOString().split('T')[0],
                    endDate: lastYearEnd.toISOString().split('T')[0]
                };
            }

            default: 
                return null;
        }
    }, []);    const calculatePercentageChange = useCallback((current, previous) => {
        // Handle edge cases to prevent NaN
        if (isNaN(current) || isNaN(previous) || current === null || previous === null) return 0;
        if (previous === 0) return current > 0 ? 100 : 0;
        
        const percentage = ((current - previous) / previous) * 100;
        return isNaN(percentage) ? 0 : percentage;
    }, []);

    const extractManualKategori = useCallback((pemasukanKategori) => {
    const manualKategori = {};
    Object.keys(kategoriPemasukan).forEach(key => {
      manualKategori[key] = pemasukanKategori[key] || 0;
    });
    return manualKategori;
  }, []);

  const fetchKasData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [summaryResponse, kasManualResponse, zakatResponse, infaqResponse, lelangResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/kas/summary?period=${selectedPeriod}`, config),
        axios.get(`http://localhost:5000/api/kas/manual?period=${selectedPeriod}`, config),
        axios.get(`http://localhost:5000/api/kas/zakat?period=${selectedPeriod}`, config),
        axios.get(`http://localhost:5000/api/kas/infaq?period=${selectedPeriod}`, config),
        axios.get(`http://localhost:5000/api/kas/lelang?period=${selectedPeriod}`, config)
      ]);

      const currentSummary = summaryResponse.data;
      const kasData = kasManualResponse.data;
      const zakatData = zakatResponse.data;
      const infaqData = infaqResponse.data;
      const lelangData = lelangResponse.data;

      const previousPeriod = getPreviousPeriod(selectedPeriod);
      let previousSummary = { totalSaldo: 0, totalPemasukan: 0, totalPengeluaran: 0 };

      if (previousPeriod) {
        try {
          const prevSummaryResponse = await axios.get(
            `http://localhost:5000/api/kas/summary?startDate=${previousPeriod.startDate}&endDate=${previousPeriod.endDate}`, 
            config
          );
          previousSummary = prevSummaryResponse.data;
        } catch {
          console.log('Could not fetch previous period data, using defaults');
        }
      }

      const percentageChanges = {
        saldo: calculatePercentageChange(currentSummary.totalSaldo, previousSummary.totalSaldo),
        pemasukan: calculatePercentageChange(currentSummary.totalPemasukan, previousSummary.totalPemasukan),
        pengeluaran: calculatePercentageChange(currentSummary.totalPengeluaran, previousSummary.totalPengeluaran)
      };

      setState(prev => ({
        ...prev,
        kasData,
        zakatData,
        infaqData,
        lelangData,
        summary: {
          ...currentSummary,
          percentageChanges,
          pemasukanKategori: {
            zakat: zakatData.reduce((sum, item) => sum + Number(item.jumlah || 0), 0) || 
               (Number(currentSummary.pemasukanKategori['zakat_fitrah'] || 0) + 
                Number(currentSummary.pemasukanKategori['zakat_mal'] || 0)),
            infaq: Object.keys(currentSummary.pemasukanKategori)
                  .filter(key => key.startsWith('infaq_'))
                  .reduce((sum, key) => sum + Number(currentSummary.pemasukanKategori[key] || 0), 0),
            lelang: currentSummary.pemasukanKategori['lelang'] || 0,
            donasi: Object.keys(currentSummary.pemasukanKategori)
                  .filter(key => key.startsWith('donasi_') || key === 'wakaf' || key === 'qurban')
                  .reduce((sum, key) => sum + Number(currentSummary.pemasukanKategori[key] || 0), 0)
          },
          pengeluaranKategori: {
            operasional: Number(currentSummary.pengeluaranKategori['operasional'] || 0),
            kegiatan: Number(currentSummary.pengeluaranKategori['kegiatan'] || 0),
            pemeliharaan: Number(currentSummary.pengeluaranKategori['pemeliharaan'] || 0),
            bantuan: Number(currentSummary.pengeluaranKategori['bantuan'] || 0)
          },
          pemasukanKategoriManual: extractManualKategori(currentSummary.pemasukanKategori)
        },
        loading: false
      }));

    } catch (error) {
      console.error('Error fetching kas data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [selectedPeriod, getPreviousPeriod, calculatePercentageChange, extractManualKategori]);

  useEffect(() => {
    fetchKasData();
  }, [fetchKasData]);

  return {
    ...state,
    refreshData: fetchKasData,
    kategoriPemasukan
  };
};