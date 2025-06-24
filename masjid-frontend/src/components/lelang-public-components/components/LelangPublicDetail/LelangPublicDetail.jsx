import React, { useState, useEffect } from 'react'
import { useLelangPublic } from '../../hooks'
import BidFormPublic from '../shared/BidFormPublic'
import CountdownTimer, { CountdownProgress } from '../shared/CountdownTimer'
import { 
  formatRupiah, 
  formatDateTimeIndonesian,
  formatDateIndonesian,
  KONDISI_BARANG_DISPLAY,
  REFRESH_INTERVALS 
} from '../../utils'

const LelangPublicDetail = ({ 
  lelangId,
  onBack,
  autoRefresh = true,
  showBidForm = true,
  className = ''
}) => {
  const {
    currentLelang,
    bidHistory,
    loading,
    bidLoading,
    error,
    bidError,
    refreshing,
    fetchLelangDetail,
    fetchBidHistory,
    submitBid,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh,
    clearError,
    getSuggestedBids,
    getQuickStats,
    isLelangActive
  } = useLelangPublic()

  const [activeTab, setActiveTab] = useState('detail') // detail, bids
  const [imageError, setImageError] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Load data on mount
  useEffect(() => {
    if (lelangId) {
      fetchLelangDetail(lelangId)
      fetchBidHistory(lelangId)
      
      if (autoRefresh) {
        startAutoRefresh(lelangId, REFRESH_INTERVALS.LELANG_DETAIL)
      }
    }

    return () => {
      if (autoRefresh) {
        stopAutoRefresh()
      }
    }
  }, [lelangId, autoRefresh, fetchLelangDetail, fetchBidHistory, startAutoRefresh, stopAutoRefresh])

  // Handle bid submit
  const handleBidSubmit = async (bidData) => {
    const result = await submitBid(lelangId, bidData)
    
    if (result.success) {
      // Refresh bid history setelah berhasil bid
      setTimeout(() => {
        fetchBidHistory(lelangId, false)
      }, 1000)
    }
    
    return result
  }

  // Handle time up
  const handleTimeUp = () => {
    // Refresh data when time is up
    refreshData(lelangId)
  }

  // Handle manual refresh
  const handleRefresh = () => {
    refreshData(lelangId)
  }

  if (loading && !currentLelang) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !currentLelang) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={() => {
                clearError()
                if (lelangId) fetchLelangDetail(lelangId)
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Kembali
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!currentLelang) {
    return null
  }

  const quickStats = getQuickStats(currentLelang)
  const suggestedBids = getSuggestedBids(currentLelang)
  const isActive = isLelangActive(currentLelang)
  const kondisiBadge = KONDISI_BARANG_DISPLAY[currentLelang.kondisi_barang] || currentLelang.kondisi_barang

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentLelang.nama_barang}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentLelang.kondisi_barang === 'baru' ? 'bg-green-100 text-green-800' :
                currentLelang.kondisi_barang === 'bekas_baik' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {kondisiBadge}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isActive ? '🔥 Aktif' : '⏰ Berakhir'}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          title="Refresh"
        >
          <svg 
            className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {currentLelang.foto_barang && !imageError && (
            <div className="relative">
              <img
                src={`http://localhost:5000/uploads/${currentLelang.foto_barang}`}
                alt={currentLelang.nama_barang}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
                onError={() => setImageError(true)}
              />
              <div className="absolute top-4 right-4">
                <CountdownTimer 
                  sisaDetik={currentLelang.sisa_detik}
                  onTimeUp={handleTimeUp}
                  size="large"
                  className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md"
                />
              </div>
            </div>
          )}

          {/* Countdown Progress */}
          {isActive && (
            <CountdownProgress
              sisaDetik={currentLelang.sisa_detik}
              durasiTotalDetik={currentLelang.durasi_lelang_jam * 3600}
              onTimeUp={handleTimeUp}
            />
          )}

          {/* Description */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📝 Deskripsi
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              {currentLelang.deskripsi ? (
                <>
                  <p className={`${!showFullDescription && currentLelang.deskripsi.length > 200 ? 'line-clamp-3' : ''}`}>
                    {currentLelang.deskripsi}
                  </p>
                  {currentLelang.deskripsi.length > 200 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                    >
                      {showFullDescription ? 'Tampilkan Lebih Sedikit' : 'Baca Selengkapnya'}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">Tidak ada deskripsi</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('detail')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'detail'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 Detail
                </button>
                <button
                  onClick={() => setActiveTab('bids')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bids'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💰 History Bid ({bidHistory.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'detail' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Harga Awal:</span>
                      <div className="font-semibold">{formatRupiah(currentLelang.harga_awal)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Bid Tertinggi:</span>
                      <div className="font-semibold text-blue-600">{formatRupiah(quickStats?.harga_tertinggi)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Bid:</span>
                      <div className="font-semibold">{quickStats?.total_bid} bid</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Kenaikan:</span>
                      <div className="font-semibold text-green-600">
                        {quickStats?.kenaikan_harga > 0 ? (
                          <>+{formatRupiah(quickStats.kenaikan_harga)} ({quickStats.persentase_kenaikan}%)</>
                        ) : (
                          'Belum ada kenaikan'
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal Mulai:</span>
                      <div className="font-semibold">{formatDateTimeIndonesian(currentLelang.tanggal_mulai)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal Lelang:</span>
                      <div className="font-semibold">{formatDateIndonesian(currentLelang.tanggal_lelang)}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bids' && (
                <div className="space-y-3">
                  {bidHistory.length > 0 ? (
                    <>
                      {bidHistory.slice(0, 10).map((bid, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              #{index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{bid.nama_bidder}</div>
                              <div className="text-xs text-gray-500">
                                {formatDateTimeIndonesian(bid.tanggal_bid)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${index === 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                              {formatRupiah(bid.jumlah_bid)}
                            </div>
                            {index === 0 && (
                              <div className="text-xs text-blue-500">Tertinggi</div>
                            )}
                          </div>
                        </div>
                      ))}
                      {bidHistory.length > 10 && (
                        <div className="text-center text-sm text-gray-500 pt-2">
                          +{bidHistory.length - 10} bid lainnya
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">💰</div>
                      <p>Belum ada bid untuk lelang ini</p>
                      <p className="text-sm">Jadilah yang pertama!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Bid Form & Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Info Lelang
            </h3>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatRupiah(quickStats?.harga_tertinggi)}
                </div>
                <div className="text-sm text-gray-600">Bid Tertinggi</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-gray-900">{quickStats?.total_bid}</div>
                  <div className="text-xs text-gray-600">Total Bid</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{quickStats?.persentase_kenaikan}%</div>
                  <div className="text-xs text-gray-600">Kenaikan</div>
                </div>
              </div>
              {isActive && (
                <div className="pt-2 border-t border-blue-200">
                  <CountdownTimer 
                    sisaDetik={currentLelang.sisa_detik}
                    onTimeUp={handleTimeUp}
                    size="medium"
                    showLabel={true}
                    className="justify-center"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bid Form */}
          {showBidForm && isActive && (
            <BidFormPublic
              lelang={currentLelang}
              onSubmit={handleBidSubmit}
              loading={bidLoading}
              error={bidError}
              onClearError={clearError}
              suggestedBids={suggestedBids}
            />
          )}

          {/* Lelang Ended Message */}
          {!isActive && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lelang Telah Berakhir
              </h3>
              <p className="text-gray-600 text-sm">
                Lelang ini sudah tidak aktif lagi
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Auto refresh indicator */}
      {autoRefresh && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Auto refresh aktif ({REFRESH_INTERVALS.LELANG_DETAIL / 1000}s)
          </div>
        </div>
      )}
    </div>
  )
}

export default LelangPublicDetail