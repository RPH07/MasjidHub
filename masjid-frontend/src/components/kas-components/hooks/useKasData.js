import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { kategoriPemasukan } from "../utils/constants";

export const useKasData = (selectedPeriod) => {
  const [state, setState] = useState({
    loading: false,
    kasData: [],
    zakatData: [],
    infaqData: [],
    donasiData: [],
    customDateRange: null, // Pindahkan ke state utama
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
          endDate: today.toISOString().split("T")[0],
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

      case "bulan-ini": {
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          period: "custom",
          startDate: lastMonth.toISOString().split("T")[0],
          endDate: lastMonthEnd.toISOString().split("T")[0],
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
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Build API URLs
      let summaryApiUrl = `http://localhost:5000/api/kas/summary`;
      let kasApiUrl = `http://localhost:5000/api/kas`;

      if (state.customDateRange) {
        const params = `?startDate=${state.customDateRange.startDate}&endDate=${state.customDateRange.endDate}`;
        summaryApiUrl += params;
        kasApiUrl += params;
      } else {
        const params = `?period=${selectedPeriod}`;
        summaryApiUrl += params;
        kasApiUrl += params;
      }

      // Fetch data dari kedua endpoint
      const [summaryResponse, kasResponse] = await Promise.all([
        axios.get(summaryApiUrl, config),
        axios.get(kasApiUrl, config)
      ]);

      // Add null checks untuk response structure
      const currentSummary = summaryResponse.data?.data || {};
      const kasResponseData = kasResponse.data?.data || {};

      const kasData = kasResponseData.kas || [];
      const zakatData = kasResponseData.zakat || [];
      const infaqData = kasResponseData.infaq || [];
      const donasiData = kasResponseData.donasi || [];

      const previousPeriod = getPreviousPeriod(selectedPeriod);
      let previousSummary = {
        totalSaldo: 0,
        totalPemasukan: 0,
        totalPengeluaran: 0,
      };

      if (previousPeriod) {
        try {
          const prevSummaryResponse = await axios.get(
            `http://localhost:5000/api/kas/summary?startDate=${previousPeriod.startDate}&endDate=${previousPeriod.endDate}`,
            config
          );
          previousSummary =
            prevSummaryResponse.data?.data || prevSummaryResponse.data || {};
        } catch {
          console.log("Could not fetch previous period data, using defaults");
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
    } catch (error) {
      console.error("Error fetching kas data:", error);
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
    setCustomDateRange, // Export function ini agar bisa digunakan
    kategoriPemasukan,
  };
};