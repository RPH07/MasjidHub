// API Base URL
export const API_BASE_URL = 'http://localhost:5000/api'

// API Endpoints
export const API_ENDPOINTS = {
  LELANG_LIST: '/lelang?public_view=true&status=aktif',
  LELANG_DETAIL: (id) => `/lelang/${id}?public_view=true`,
  LELANG_BID_HISTORY: (id) => `/lelang/${id}/bids?public_view=true`,
  SUBMIT_BID: (id) => `/lelang/${id}/bid`
}

// Kondisi Barang untuk Display
export const KONDISI_BARANG_DISPLAY = {
  'baru': '✨ Baru',
  'bekas_baik': '👍 Bekas Baik', 
  'bekas_rusak': '⚠️ Bekas Perlu Perbaikan'
}

// Status Lelang untuk Display
export const STATUS_LELANG_DISPLAY = {
  'aktif': '🔥 Aktif',
  'selesai': '✅ Selesai',
  'batal': '❌ Dibatalkan'
}

// Bid Increment Options
export const BID_INCREMENTS = [
  { label: '+1K', value: 1000 },
  { label: '+5K', value: 5000 },
  { label: '+10K', value: 10000 },
  { label: '+25K', value: 25000 },
  { label: '+50K', value: 50000 },
  { label: '+100K', value: 100000 }
]

// Refresh Intervals
export const REFRESH_INTERVALS = {
  LELANG_LIST: 30000, // 30 detik
  LELANG_DETAIL: 10000, // 10 detik
  BID_HISTORY: 5000, // 5 detik
  COUNTDOWN: 1000 // 1 detik
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  LELANG_NOT_FOUND: 'Lelang tidak ditemukan atau sudah tidak aktif.',
  BID_TOO_LOW: 'Bid Anda harus lebih tinggi dari bid tertinggi saat ini.',
  BID_FAILED: 'Gagal mengirim bid. Silakan coba lagi.',
  VALIDATION_ERROR: 'Data yang Anda masukkan tidak valid.',
  RATE_LIMIT: 'Terlalu banyak request. Tunggu sebentar sebelum mencoba lagi.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  BID_SUCCESS: 'Bid Anda berhasil dikirim!',
  DATA_UPDATED: 'Data telah diperbarui.'
}

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING_LELANG: 'Memuat daftar lelang...',
  LOADING_DETAIL: 'Memuat detail lelang...',
  LOADING_BIDS: 'Memuat history bid...',
  SUBMITTING_BID: 'Mengirim bid...'
}

// Time Units
export const TIME_UNITS = {
  DETIK: 'detik',
  MENIT: 'menit', 
  JAM: 'jam',
  HARI: 'hari'
}

// Breakpoints for Responsive
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px', 
  LG: '1024px',
  XL: '1280px'
}