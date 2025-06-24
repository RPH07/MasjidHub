import React, { useState, useEffect } from 'react'
import { 
  formatRupiah, 
  validateBidAmount, 
  validateBidderName, 
  validatePhoneNumber,
//parseErrorMessage 
} from '../../utils'

const BidFormPublic = ({ 
  lelang,
  onSubmit,
  loading = false,
  error = null,
  onClearError,
  suggestedBids = [],
  className = ''
}) => {
  // Form state
  const [formData, setFormData] = useState({
    nama_bidder: '',
    kontak_bidder: '',
    jumlah_bid: ''
  })
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({})
  const [isValid, setIsValid] = useState(false)

  // Focus states
  const [focusedField, setFocusedField] = useState(null)

  const currentHighest = lelang?.harga_tertinggi || lelang?.harga_awal || 0
  const minBid = currentHighest + 1000 // Minimum increment 1K

  // Validate form
  useEffect(() => {
    const errors = {}
    
    // Validate nama
    const nameValidation = validateBidderName(formData.nama_bidder)
    if (!nameValidation.valid) {
      errors.nama_bidder = nameValidation.message
    }

    // Validate kontak (optional)
    if (formData.kontak_bidder) {
      const phoneValidation = validatePhoneNumber(formData.kontak_bidder)
      if (!phoneValidation.valid) {
        errors.kontak_bidder = phoneValidation.message
      }
    }

    // Validate bid amount
    const bidValidation = validateBidAmount(formData.jumlah_bid, currentHighest)
    if (!bidValidation.valid) {
      errors.jumlah_bid = bidValidation.message
    }

    setValidationErrors(errors)
    setIsValid(Object.keys(errors).length === 0 && formData.nama_bidder && formData.jumlah_bid)
  }, [formData, currentHighest])

  // Handle input change
  const handleInputChange = (field, value) => {
    // Clear server error when user starts typing
    if (error && onClearError) {
      onClearError()
    }

    // Special handling untuk jumlah_bid (only numbers)
    if (field === 'jumlah_bid') {
      // Remove non-numeric characters
      const numericValue = value.replace(/[^\d]/g, '')
      setFormData(prev => ({ ...prev, [field]: numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Handle suggested bid click
  const handleSuggestedBid = (amount) => {
    handleInputChange('jumlah_bid', amount.toString())
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isValid || loading) return

    // Final validation
    const finalValidation = validateBidAmount(formData.jumlah_bid, currentHighest)
    if (!finalValidation.valid) {
      setValidationErrors(prev => ({ ...prev, jumlah_bid: finalValidation.message }))
      return
    }

    // Submit bid
    if (onSubmit) {
      const bidData = {
        nama_bidder: formData.nama_bidder.trim(),
        kontak_bidder: formData.kontak_bidder.trim() || null,
        jumlah_bid: parseInt(formData.jumlah_bid)
      }
      
      const result = await onSubmit(bidData)
      
      // Reset form if successful
      if (result?.success) {
        setFormData({
          nama_bidder: '',
          kontak_bidder: '',
          jumlah_bid: ''
        })
      }
    }
  }

  // Quick increment buttons
  const quickIncrements = [1000, 5000, 10000, 25000, 50000]

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💰 Submit Bid
        </h3>

        {/* Current highest bid info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Bid Tertinggi Saat Ini:</span>
            <span className="text-xl font-bold text-blue-800">
              {formatRupiah(currentHighest)}
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Bid minimum: {formatRupiah(minBid)}
          </div>
        </div>

        {/* Server Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Bidder */}
          <div>
            <label htmlFor="nama_bidder" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Bidder <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama_bidder"
              value={formData.nama_bidder}
              onChange={(e) => handleInputChange('nama_bidder', e.target.value)}
              onFocus={() => setFocusedField('nama_bidder')}
              onBlur={() => setFocusedField(null)}
              placeholder="Masukkan nama Anda"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                validationErrors.nama_bidder ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
              required
            />
            {validationErrors.nama_bidder && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.nama_bidder}</p>
            )}
          </div>

          {/* Kontak Bidder */}
          <div>
            <label htmlFor="kontak_bidder" className="block text-sm font-medium text-gray-700 mb-1">
              No. HP/WhatsApp <span className="text-gray-400">(Opsional)</span>
            </label>
            <input
              type="tel"
              id="kontak_bidder"
              value={formData.kontak_bidder}
              onChange={(e) => handleInputChange('kontak_bidder', e.target.value)}
              onFocus={() => setFocusedField('kontak_bidder')}
              onBlur={() => setFocusedField(null)}
              placeholder="08123456789"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                validationErrors.kontak_bidder ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {validationErrors.kontak_bidder && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.kontak_bidder}</p>
            )}
            {focusedField === 'kontak_bidder' && !validationErrors.kontak_bidder && (
              <p className="text-gray-500 text-xs mt-1">
                Nomor kontak untuk konfirmasi jika bid Anda menang
              </p>
            )}
          </div>

          {/* Jumlah Bid */}
          <div>
            <label htmlFor="jumlah_bid" className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Bid <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">Rp</span>
              <input
                type="text"
                id="jumlah_bid"
                value={formData.jumlah_bid ? parseInt(formData.jumlah_bid).toLocaleString('id-ID') : ''}
                onChange={(e) => handleInputChange('jumlah_bid', e.target.value)}
                onFocus={() => setFocusedField('jumlah_bid')}
                onBlur={() => setFocusedField(null)}
                placeholder="50000"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.jumlah_bid ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                required
              />
            </div>
            {validationErrors.jumlah_bid && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.jumlah_bid}</p>
            )}
          </div>

          {/* Quick Increment Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Add:
            </label>
            <div className="flex flex-wrap gap-2">
              {quickIncrements.map(increment => (
                <button
                  key={increment}
                  type="button"
                  onClick={() => {
                    const newAmount = currentHighest + increment
                    handleInputChange('jumlah_bid', newAmount.toString())
                  }}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors"
                  disabled={loading}
                >
                  +{formatRupiah(increment).replace('Rp ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Bids */}
          {suggestedBids.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saran Bid:
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedBids.slice(0, 4).map((amount, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestedBid(amount)}
                    className="px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    disabled={loading}
                  >
                    {formatRupiah(amount)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isValid && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengirim Bid...
              </span>
            ) : (
              '💰 Submit Bid'
            )}
          </button>
        </form>

        {/* Info Text */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            ℹ️ Dengan submit bid, Anda berkomitmen untuk membeli barang ini jika menjadi pemenang.
            Pastikan bid Anda sesuai kemampuan.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BidFormPublic