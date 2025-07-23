import { useState, useEffect, useCallback } from "react";
import apiService from "../../../services/apiServices";
import { API_ENDPOINTS } from "../../../config/api.config";
import { kategoriPemasukan } from "../utils/constants";

export const useKasData = (selectedPeriod) => {
  const [state, setState] = useState({
    loading: false,
    kasData: [],
    zakatData: [],
    infaqData: [],
    donasiData: [],
    customDateRange: null,
    summary: {
      totalSaldo: 0,
      totalPemasukan: 0,
      totalPengeluaran: 0,
      pemasukanKategori: {
        zakat: 0,
        infaq: 0,
        donasi: 0,
      },
      pengeluaranKategori: {
        operasional: 0,
        kegiatan: 0,
        pemeliharaan: 0,
        bantuan: 0,
      },
      percentageChanges: null,
    },
  });

  const setCustomDateRange = useCallback((startDate, endDate) => {
    setState(prev => ({
      ...prev,
      customDateRange: { startDate, endDate }
    }));
  }, []);

  const getPreviousPeriod = useCallback((currentPeriod) => {
    const today = new Date();

    switch (currentPeriod) {
      case "hari-ini": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return {
          period: "custom",
          startDate: yesterday.toISOString().split("T")[0],
          endDate: yesterday.toISOString().split("T")[0],
        };
      }

      case "kemarin": {
        const dayBeforeYesterday = new Date(today);
        dayBeforeYesterday.setDate(today.getDate() - 2);
        return {
          period: "custom",
          startDate: dayBeforeYesterday.toISOString().split("T")[0],
          endDate: dayBeforeYesterday.toISOString().split("T")[0],
        };
      }

      case "minggu-ini": {
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        return {
          period: "custom",
          startDate: lastWeekStart.toISOString().split("T")[0],
          endDate: lastWeekEnd.toISOString().split("T")[0],
        };
      }

      case "minggu-lalu": {
        const twoWeeksAgoStart = new Date(today);
        twoWeeksAgoStart.setDate(today.getDate() - today.getDay() - 14);
        const twoWeeksAgoEnd = new Date(twoWeeksAgoStart);
        twoWeeksAgoEnd.setDate(twoWeeksAgoStart.getDate() + 6);
        return {
          period: "custom",
          startDate: twoWeeksAgoStart.toISOString().split("T")[0],
          endDate: twoWeeksAgoEnd.toISOString().split("T")[0],
        };
      }

      case "bulan-ini": {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          period: "custom",
          startDate: lastMonth.toISOString().split("T")[0],
          endDate: lastMonthEnd.toISOString().split("T")[0],
        };
      }

      case "bulan-lalu": {
        const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        const twoMonthsAgoEnd = new Date(today.getFullYear(), today.getMonth() - 1, 0);
        return {
          period: "custom",
          startDate: twoMonthsAgo.toISOString().split("T")[0],
          endDate: twoMonthsAgoEnd.toISOString().split("T")[0],
        };
      }

      case "tahun-ini": {
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        return {
          period: "custom",
          startDate: lastYear.toISOString().split("T")[0],
          endDate: lastYearEnd.toISOString().split("T")[0],
        };
      }

      case "tahun-lalu": {
        const twoYearsAgo = new Date(today.getFullYear() - 2, 0, 1);
        const twoYearsAgoEnd = new Date(today.getFullYear() - 2, 11, 31);
        return {
          period: "custom",
          startDate: twoYearsAgo.toISOString().split("T")[0],
          endDate: twoYearsAgoEnd.toISOString().split("T")[0],
        };
      }

      default:
        return null;
    }
  }, []);

  const calculatePercentageChange = useCallback((current, previous) => {
    if (
      isNaN(current) ||
      isNaN(previous) ||
      current === null ||
      previous === null
    )
      return 0;
    if (previous === 0) return current > 0 ? 100 : 0;

    const percentage = ((current - previous) / Math.abs(previous)) * 100;
    return isNaN(percentage) ? 0 : percentage;
  }, []);

  const extractManualKategori = useCallback((pemasukanKategori) => {
    const manualKategori = {};
    Object.keys(kategoriPemasukan).forEach((key) => {
      manualKategori[key] = pemasukanKategori[key] || 0;
    });
    return manualKategori;
  }, []);

  const fetchKasData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Build parameters berdasarkan custom date range atau selected period
      const params = state.customDateRange 
        ? {
            startDate: state.customDateRange.startDate,
            endDate: state.customDateRange.endDate
          }
        : { period: selectedPeriod };

      console.log('🔄 Fetching kas data with params:', params);

      // Fetch data menggunakan API service yang baru
      const [summaryResponse, kasResponse] = await Promise.all([
        apiService.get(API_ENDPOINTS.KAS.SUMMARY, {params}),
        apiService.get(API_ENDPOINTS.KAS.BASE, {params})
      ]);

      // Add null checks untuk response structure
      const currentSummary = summaryResponse.data?.data || {};
      const kasResponseData = kasResponse.data?.data || {};

      const kasData = kasResponseData.kas || [];
      const zakatData = kasResponseData.zakat || [];
      const infaqData = kasResponseData.infaq || [];
      const donasiData = kasResponseData.donasi || [];

      // Fetch previous period data untuk comparison
      const previousPeriod = getPreviousPeriod(selectedPeriod);
      let previousSummary = {
        totalSaldo: 0,
        totalPemasukan: 0,
        totalPengeluaran: 0,
      };

      if (previousPeriod) {
        try {
          const prevParams = {
            startDate: previousPeriod.startDate,
            endDate: previousPeriod.endDate
          };
          
          const prevSummaryResponse = await apiService.get(API_ENDPOINTS.KAS.SUMMARY, {params: prevParams});
          previousSummary = prevSummaryResponse.data?.data || prevSummaryResponse.data || {};
        } catch (error) {
          console.log("Could not fetch previous period data, using defaults:", error);
        }
      }

      const percentageChanges = {
        saldo: calculatePercentageChange(
          currentSummary.saldoBersih || currentSummary.totalSaldo,
          previousSummary.saldoBersih || previousSummary.totalSaldo
        ),
        pemasukan: calculatePercentageChange(
          currentSummary.totalPemasukan,
          previousSummary.totalPemasukan
        ),
        pengeluaran: calculatePercentageChange(
          currentSummary.totalPengeluaran,
          previousSummary.totalPengeluaran
        ),
      };

      // Add null checks untuk Object.keys() calls
      const pemasukanKategori = currentSummary.pemasukanKategori || {};
      const pengeluaranKategori = currentSummary.pengeluaranKategori || {};
      const breakdown = currentSummary.breakdown || {};

      setState((prev) => ({
        ...prev,
        kasData,
        zakatData,
        infaqData,
        donasiData,
        summary: {
          totalSaldo: currentSummary.saldoBersih || 0,
          totalPemasukan: currentSummary.totalPemasukan || 0,
          totalPengeluaran: currentSummary.totalPengeluaran || 0,
          percentageChanges,
          pemasukanKategori: {
            zakat: breakdown.zakat || 0,
            infaq: breakdown.infaq || 0,
            donasi: breakdown.kasManual || 0,
          },
          pengeluaranKategori: {
            operasional: Number(pengeluaranKategori["operasional"] || 0),
            kegiatan: Number(pengeluaranKategori["kegiatan"] || 0),
            pemeliharaan: Number(pengeluaranKategori["pemeliharaan"] || 0),
            bantuan: Number(pengeluaranKategori["bantuan"] || 0),
          },
          pemasukanKategoriManual: extractManualKategori(pemasukanKategori),
        },
        loading: false,
      }));

      console.log('✅ Kas data fetched successfully');
    } catch (error) {
      console.error("❌ Error fetching kas data:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        summary: {
          totalSaldo: 0,
          totalPemasukan: 0,
          totalPengeluaran: 0,
          percentageChanges: { saldo: 0, pemasukan: 0, pengeluaran: 0 },
          pemasukanKategori: { zakat: 0, infaq: 0, donasi: 0 },
          pengeluaranKategori: {
            operasional: 0,
            kegiatan: 0,
            pemeliharaan: 0,
            bantuan: 0,
          },
          pemasukanKategoriManual: {},
        },
      }));
    }
  }, [
    selectedPeriod,
    getPreviousPeriod,
    calculatePercentageChange,
    state.customDateRange,
    extractManualKategori,
  ]);

  useEffect(() => {
    fetchKasData();
  }, [fetchKasData]);

  return {
    ...state,
    refreshData: fetchKasData,
    setCustomDateRange,
    getPreviousPeriod,
    kategoriPemasukan,
  };
};