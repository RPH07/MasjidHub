// Format currency to Rupiah
export const formatRupiah = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0'
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format compact currency (K, M)
export const formatRupiahCompact = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0'
  
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}K`
  }
  return formatRupiah(amount)
}

// Format time remaining to human readable
export const formatTimeRemaining = (sisaDetik) => {
  if (sisaDetik <= 0) return 'Berakhir'
  
  const hari = Math.floor(sisaDetik / (24 * 3600))
  const jam = Math.floor((sisaDetik % (24 * 3600)) / 3600)
  const menit = Math.floor((sisaDetik % 3600) / 60)
  const detik = sisaDetik % 60
  
  if (hari > 0) return `${hari}h ${jam}j ${menit}m`
  if (jam > 0) return `${jam}j ${menit}m ${detik}s`
  if (menit > 0) return `${menit}m ${detik}s`
  return `${detik}s`
}

// Get time urgency class for styling
export const getTimeUrgencyClass = (sisaDetik) => {
  if (sisaDetik <= 0) return 'text-gray-500'
  if (sisaDetik <= 300) return 'text-red-600 animate-pulse' // 5 menit terakhir
  if (sisaDetik <= 1800) return 'text-orange-600' // 30 menit terakhir  
  if (sisaDetik <= 3600) return 'text-yellow-600' // 1 jam terakhir
  return 'text-green-600'
}

// Format date to Indonesian
export const formatDateIndonesian = (dateString) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  })
}

// Format datetime to Indonesian
export const formatDateTimeIndonesian = (dateString) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Parse error message from API response
export const parseErrorMessage = (error) => {
  if (typeof error === 'string') return error
  
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.message) {
    return error.message
  }
  
  return 'Terjadi kesalahan tidak terduga'
}

// Validate bid amount input
export const validateBidAmount = (amount, currentHighest = 0) => {
  const numAmount = parseInt(amount?.toString().replace(/\D/g, ''))
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, message: 'Jumlah bid harus berupa angka positif' }
  }
  
  if (numAmount <= currentHighest) {
    return { 
      valid: false, 
      message: `Bid harus lebih tinggi dari ${formatRupiah(currentHighest)}` 
    }
  }
  
  const minIncrement = Math.max(1000, currentHighest * 0.05) // Min 1K atau 5% dari harga current
  if (numAmount < currentHighest + minIncrement) {
    return { 
      valid: false, 
      message: `Bid minimum ${formatRupiah(currentHighest + minIncrement)}` 
    }
  }
  
  return { valid: true }
}

// Validate bidder name
export const validateBidderName = (name) => {
  if (!name || name.trim().length < 2) {
    return { valid: false, message: 'Nama minimal 2 karakter' }
  }
  
  if (name.trim().length > 100) {
    return { valid: false, message: 'Nama maksimal 100 karakter' }
  }
  
  return { valid: true }
}

// Validate phone number (optional)
export const validatePhoneNumber = (phone) => {
  if (!phone || phone.length === 0) {
    return { valid: true } // Optional field
  }
  
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { valid: false, message: 'Nomor telepon harus 10-15 digit' }
  }
  
  return { valid: true }
}

// Generate random bid placeholder
export const generateBidPlaceholder = (currentHighest = 0) => {
  const increments = [1000, 5000, 10000, 25000, 50000]
  const randomIncrement = increments[Math.floor(Math.random() * increments.length)]
  return currentHighest + randomIncrement
}

// Debounce function for search/input
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

// Generate share URL for lelang
export const generateShareUrl = (lelangId) => {
  return `${window.location.origin}/lelang-public/${lelangId}`
}

