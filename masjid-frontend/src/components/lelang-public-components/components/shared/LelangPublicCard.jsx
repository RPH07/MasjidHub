 
import React from 'react'
import { 
  formatRupiah, 
  formatRupiahCompact,
  formatDateIndonesian,
  KONDISI_BARANG_DISPLAY 
} from '../../utils'
import { CountdownBadge } from './CountdownTimer'

const LelangPublicCard = ({ 
  lelang, 
  onClick,
  variant = 'default', // default, compact, featured
  showImage = true,
  showStats = true,
  className = ''
}) => {
  if (!lelang) return null

  const {
    // id,
    nama_barang,
    deskripsi,
    harga_awal,
    harga_tertinggi,
    foto_barang,
    kondisi_barang,
    tanggal_lelang,
    total_bid = 0,
    sisa_detik = 0
  } = lelang

  const currentPrice = harga_tertinggi || harga_awal || 0
  const hasImage = foto_barang && showImage
  const isActive = sisa_detik > 0
  const hasBids = total_bid > 0

  // Calculate price increase
  const priceIncrease = currentPrice - (harga_awal || 0)
  const priceIncreasePercent = harga_awal > 0 ? ((priceIncrease / harga_awal) * 100) : 0

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(lelang)
    }
  }

  // Get kondisi badge style
  const getKondisiBadge = () => {
    const display = KONDISI_BARANG_DISPLAY[kondisi_barang] || kondisi_barang
    const style = {
      'baru': 'bg-green-100 text-green-800',
      'bekas_baik': 'bg-blue-100 text-blue-800',
      'bekas_rusak': 'bg-orange-100 text-orange-800'
    }[kondisi_barang] || 'bg-gray-100 text-gray-800'

    return { display, style }
  }

  const kondisiBadge = getKondisiBadge()

  // Compact variant
  if (variant === 'compact') {
    return (
      <div 
        className={`bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {hasImage && (
              <img
                src={`http://localhost:5000/uploads/${foto_barang}`}
                alt={nama_barang}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {nama_barang}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold text-blue-600">
                  {formatRupiahCompact(currentPrice)}
                </span>
                <CountdownBadge sisaDetik={sisa_detik} />
              </div>
              {hasBids && (
                <div className="text-xs text-gray-500 mt-1">
                  {total_bid} bid
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Featured variant (larger, more prominent)
  if (variant === 'featured') {
    return (
      <div 
        className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-blue-200 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 ${className}`}
        onClick={handleClick}
      >
        <div className="relative">
          {hasImage && (
            <div className="relative h-64 overflow-hidden rounded-t-xl">
              <img
                src={`http://localhost:5000/uploads/${foto_barang}`}
                alt={nama_barang}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.parentElement.style.display = 'none'
                }}
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${kondisiBadge.style}`}>
                  {kondisiBadge.display}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <CountdownBadge sisaDetik={sisa_detik} />
              </div>
              {hasBids && (
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-gray-700">
                    🔥 {total_bid} bid
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {nama_barang}
            </h2>
            {deskripsi && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {deskripsi}
              </p>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Harga Saat Ini:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatRupiah(currentPrice)}
                </span>
              </div>
              {priceIncrease > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Kenaikan:</span>
                  <span className="text-green-600 font-medium">
                    +{formatRupiah(priceIncrease)} ({priceIncreasePercent.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="relative">
        {hasImage && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={`http://localhost:5000/uploads/${foto_barang}`}
              alt={nama_barang}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.parentElement.style.display = 'none'
              }}
            />
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${kondisiBadge.style}`}>
                {kondisiBadge.display}
              </span>
            </div>
            <div className="absolute top-2 right-2">
              <CountdownBadge sisaDetik={sisa_detik} />
            </div>
          </div>
        )}
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {nama_barang}
          </h3>
          
          {deskripsi && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {deskripsi}
            </p>
          )}

          <div className="space-y-2">
            {/* Price Section */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {hasBids ? 'Tertinggi:' : 'Mulai:'}
              </span>
              <span className="text-lg font-bold text-blue-600">
                {formatRupiah(currentPrice)}
              </span>
            </div>

            {/* Price increase if any */}
            {hasBids && priceIncrease > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Naik:</span>
                <span className="text-green-600 font-medium">
                  +{formatRupiahCompact(priceIncrease)} ({priceIncreasePercent.toFixed(0)}%)
                </span>
              </div>
            )}

            {/* Stats */}
            {showStats && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>💰 {total_bid} bid</span>
                  {tanggal_lelang && (
                    <span>📅 {formatDateIndonesian(tanggal_lelang)}</span>
                  )}
                </div>
                {!isActive && (
                  <span className="text-xs text-red-500 font-medium">
                    ⏰ Berakhir
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Preset variants untuk kemudahan
export const LelangPublicCardCompact = (props) => (
  <LelangPublicCard {...props} variant="compact" />
)

export const LelangPublicCardFeatured = (props) => (
  <LelangPublicCard {...props} variant="featured" />
)

// Grid container helper
export const LelangCardGrid = ({ children, columns = 3, gap = 4, className = '' }) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  const gapClass = `gap-${gap}`

  return (
    <div className={`grid ${gridClass} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}

export default LelangPublicCard