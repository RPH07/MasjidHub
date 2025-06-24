import React, { useState, useEffect } from 'react'
import { useLelangPublic } from '../../hooks'
import LelangPublicCard, { LelangCardGrid } from '../shared/LelangPublicCard'
import { REFRESH_INTERVALS } from '../../utils'

const LelangPublicList = ({ 
  onCardClick,
  autoRefresh = true,
  showSearch = true,
  showSort = true,
  showStats = true,
  gridColumns = 3,
  cardVariant = 'default',
  className = ''
}) => {
  const {
    // lelangList,
    loading,
    error,
    refreshing,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredLelangList,
    totalLelangAktif,
    isEmpty,
    fetchLelangAktif,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh,
    clearError
  } = useLelangPublic()

  // Local search state for debouncing
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // Load data on mount
  useEffect(() => {
    fetchLelangAktif()
    
    if (autoRefresh) {
      startAutoRefresh(null, REFRESH_INTERVALS.LELANG_LIST)
    }

    return () => {
      if (autoRefresh) {
        stopAutoRefresh()
      }
    }
  }, [autoRefresh, fetchLelangAktif, startAutoRefresh, stopAutoRefresh])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [localSearchQuery, setSearchQuery])

  // Handle card click
  const handleCardClick = (lelang) => {
    if (onCardClick) {
      onCardClick(lelang)
    }
  }

  // Handle manual refresh
  const handleRefresh = () => {
    refreshData()
  }

  // Sort options
  const sortOptions = [
    { value: 'newest', label: '🆕 Terbaru' },
    { value: 'ending_soon', label: '⏰ Berakhir Segera' },
    { value: 'price_low', label: '💰 Harga Terendah' },
    { value: 'price_high', label: '💎 Harga Tertinggi' }
  ]

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🔥 Lelang Aktif
            </h1>
            {showStats && (
              <p className="text-gray-600 mt-1">
                {totalLelangAktif} barang sedang dilelang
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg 
                className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refresh...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Search & Filter Section */}
        {(showSearch || showSort) && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="Cari barang lelang..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {localSearchQuery && (
                    <button
                      onClick={() => setLocalSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Sort */}
            {showSort && (
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Active filters indicator */}
        {(searchQuery || sortBy !== 'newest') && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500">Filter aktif:</span>
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Pencarian: "{searchQuery}"
                <button
                  onClick={() => {
                    setLocalSearchQuery('')
                    setSearchQuery('')
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Urutan: {sortOptions.find(opt => opt.value === sortBy)?.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Terjadi Kesalahan
              </h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    clearError()
                    fetchLelangAktif()
                  }}
                  className="text-sm font-medium text-red-800 hover:text-red-700"
                >
                  Coba Lagi →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Memuat lelang aktif...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && isEmpty && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Lelang Aktif
          </h3>
          <p className="text-gray-600 mb-6">
            Saat ini tidak ada barang yang sedang dilelang.
          </p>
          <button
            onClick={() => fetchLelangAktif()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      )}

      {/* No Search Results */}
      {!loading && filteredLelangList.length === 0 && totalLelangAktif > 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak Ada Hasil
          </h3>
          <p className="text-gray-600 mb-6">
            Tidak ditemukan lelang yang sesuai dengan pencarian "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setLocalSearchQuery('')
              setSearchQuery('')
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Hapus Filter
          </button>
        </div>
      )}

      {/* Lelang Grid */}
      {!loading && filteredLelangList.length > 0 && (
        <>
          <LelangCardGrid columns={gridColumns} gap={6}>
            {filteredLelangList.map(lelang => (
              <LelangPublicCard
                key={lelang.id}
                lelang={lelang}
                variant={cardVariant}
                onClick={handleCardClick}
              />
            ))}
          </LelangCardGrid>

          {/* Results info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            {searchQuery ? (
              <>
                Menampilkan {filteredLelangList.length} dari {totalLelangAktif} lelang 
                untuk pencarian "{searchQuery}"
              </>
            ) : (
              <>
                Menampilkan {filteredLelangList.length} lelang aktif
              </>
            )}
          </div>
        </>
      )}

      {/* Auto refresh indicator */}
      {autoRefresh && !loading && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Auto refresh aktif
          </div>
        </div>
      )}
    </div>
  )
}

export default LelangPublicList