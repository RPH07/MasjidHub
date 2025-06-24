import { useState, useEffect, useCallback, useRef } from 'react'
import { lelangPublicService } from '../services'
import { 
  REFRESH_INTERVALS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  parseErrorMessage 
} from '../utils'

export const useLelangPublic = () => {
  // States
  const [lelangList, setLelangList] = useState([])
  const [currentLelang, setCurrentLelang] = useState(null)
  const [bidHistory, setBidHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bidLoading, setBidLoading] = useState(false)
  const [bidError, setBidError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Refs untuk cleanup
  const refreshIntervalRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null)
    setBidError(null)
  }, [])

  // ========================================
  // STOP AUTO REFRESH (Pindah ke atas)
  // ========================================
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
      console.log(`⏹️ Auto refresh stopped`)
    }
  }, [])

  // ========================================
  // FETCH LELANG AKTIF
  // ========================================
  const fetchLelangAktif = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      clearError()

      const result = await lelangPublicService.getLelangAktif()
      
      setLelangList(result.data || [])
      
      console.log(`📋 Fetched ${result.data?.length || 0} active lelang`)
      
    } catch (err) {
      const errorMsg = parseErrorMessage(err)
      setError(errorMsg)
      console.error('Error fetching lelang aktif:', err)
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }, [clearError])

  // ========================================
  // FETCH LELANG DETAIL
  // ========================================
  const fetchLelangDetail = useCallback(async (id, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      clearError()

      const result = await lelangPublicService.getLelangDetail(id)
      
      setCurrentLelang(result.data)
      
      console.log(`📝 Fetched lelang detail for ID: ${id}`)
      
      return result.data
      
    } catch (err) {
      const errorMsg = parseErrorMessage(err)
      setError(errorMsg)
      console.error('Error fetching lelang detail:', err)
      return null
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [clearError])

  // ========================================
  // FETCH BID HISTORY
  // ========================================
  const fetchBidHistory = useCallback(async (id, showLoading = false) => {
    try {
      if (showLoading) setLoading(true)
      clearError()

      const result = await lelangPublicService.getBidHistory(id)
      
      setBidHistory(result.data || [])
      
      console.log(`💰 Fetched ${result.data?.length || 0} bid history for ID: ${id}`)
      
      return result.data
      
    } catch (err) {
      const errorMsg = parseErrorMessage(err)
      if (showLoading) setError(errorMsg)
      console.error('Error fetching bid history:', err)
      return []
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [clearError])

  // ========================================
  // REFRESH DATA
  // ========================================
  const refreshData = useCallback(async (lelangId = null) => {
    setRefreshing(true)
    
    try {
      if (lelangId) {
        // Refresh specific lelang
        await Promise.all([
          fetchLelangDetail(lelangId, false),
          fetchBidHistory(lelangId, false)
        ])
      } else {
        // Refresh lelang list
        await fetchLelangAktif(false)
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
    }
  }, [fetchLelangAktif, fetchLelangDetail, fetchBidHistory])

  // ========================================
  // START AUTO REFRESH (Setelah refreshData defined)
  // ========================================
  const startAutoRefresh = useCallback((lelangId = null, interval = REFRESH_INTERVALS.LELANG_LIST) => {
    stopAutoRefresh() // Clear existing interval
    
    refreshIntervalRef.current = setInterval(() => {
      refreshData(lelangId)
    }, interval)
    
    console.log(`🔄 Auto refresh started (${interval}ms)`)
  }, [refreshData, stopAutoRefresh])

  // ========================================
  // SUBMIT BID
  // ========================================
  const submitBid = useCallback(async (id, bidData) => {
    try {
      setBidLoading(true)
      setBidError(null)

      // Validate before submit
      if (currentLelang) {
        const validation = lelangPublicService.validateBidBeforeSubmit(
          currentLelang, 
          bidData.jumlah_bid, 
          bidData.nama_bidder
        )
        
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '))
        }
      }

      const result = await lelangPublicService.submitBid(id, bidData)
      
      console.log(`✅ Bid submitted successfully:`, result.data)
      
      // Refresh data setelah bid berhasil
      setTimeout(() => {
        fetchLelangDetail(id, false)
        fetchBidHistory(id, false)
      }, 1000)
      
      return {
        success: true,
        message: result.message || SUCCESS_MESSAGES.BID_SUCCESS,
        data: result.data
      }
      
    } catch (err) {
      const errorMsg = parseErrorMessage(err)
      setBidError(errorMsg)
      console.error('Error submitting bid:', err)
      
      return {
        success: false,
        message: errorMsg
      }
    } finally {
      setBidLoading(false)
    }
  }, [currentLelang, fetchLelangDetail, fetchBidHistory])

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const getSuggestedBids = useCallback((lelang = currentLelang) => {
    if (!lelang) return []
    
    const currentHighest = lelang.harga_tertinggi || lelang.harga_awal || 0
    return lelangPublicService.getSuggestedBids(currentHighest)
  }, [currentLelang])

  const getQuickStats = useCallback((lelang = currentLelang) => {
    if (!lelang) return null
    
    return lelangPublicService.getQuickStats(lelang)
  }, [currentLelang])

  const isLelangActive = useCallback((lelang = currentLelang) => {
    if (!lelang) return false
    
    return lelangPublicService.isLelangActive(lelang)
  }, [currentLelang])

  // ========================================
  // SEARCH & FILTER
  // ========================================
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const filteredLelangList = useCallback(() => {
    let filtered = [...lelangList]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(lelang => 
        lelang.nama_barang?.toLowerCase().includes(query) ||
        lelang.deskripsi?.toLowerCase().includes(query)
      )
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => (a.harga_tertinggi || a.harga_awal) - (b.harga_tertinggi || b.harga_awal))
        break
      case 'price_high':
        filtered.sort((a, b) => (b.harga_tertinggi || b.harga_awal) - (a.harga_tertinggi || a.harga_awal))
        break
      case 'ending_soon':
        filtered.sort((a, b) => (a.sisa_detik || 0) - (b.sisa_detik || 0))
        break
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.tanggal_mulai || 0) - new Date(a.tanggal_mulai || 0))
        break
    }

    return filtered
  }, [lelangList, searchQuery, sortBy])

  // ========================================
  // CLEANUP - FIXED
  // ========================================
  useEffect(() => {
    // Copy ref value untuk avoid ref change warning
    const currentAbortController = abortControllerRef.current
    
    return () => {
      stopAutoRefresh()
      if (currentAbortController) {
        currentAbortController.abort()
      }
    }
  }, [stopAutoRefresh])

  // ========================================
  // RETURN HOOK
  // ========================================
  return {
    // Data
    lelangList,
    currentLelang,
    bidHistory,
    filteredLelangList: filteredLelangList(),
    
    // Loading states
    loading,
    bidLoading,
    refreshing,
    
    // Error states
    error,
    bidError,
    
    // Actions
    fetchLelangAktif,
    fetchLelangDetail,
    fetchBidHistory,
    submitBid,
    refreshData,
    clearError,
    
    // Auto refresh
    startAutoRefresh,
    stopAutoRefresh,
    
    // Helpers
    getSuggestedBids,
    getQuickStats,
    isLelangActive,
    
    // Search & filter
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    
    // Computed stats
    totalLelangAktif: lelangList.length,
    hasError: !!error || !!bidError,
    isEmpty: !loading && lelangList.length === 0
  }
}

export default useLelangPublic