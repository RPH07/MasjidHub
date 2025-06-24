import { 
  API_BASE_URL, 
  API_ENDPOINTS, 
  ERROR_MESSAGES 
} from '../utils'

class LelangPublicService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Helper method untuk handle API calls
  async apiCall(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      }

      console.log(`🚀 API Call: ${config.method || 'GET'} ${url}`)
      
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      console.log(`✅ API Success:`, data)
      return {
        success: true,
        data: data.data,
        message: data.message,
        total: data.total
      }
    } catch (error) {
      console.error(`❌ API Error:`, error)
      
      // Handle network errors
      if (error.name === 'TypeError' || !navigator.onLine) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
      }
      
      // Handle rate limiting
      if (error.message.includes('Terlalu banyak')) {
        throw new Error(ERROR_MESSAGES.RATE_LIMIT)
      }
      
      throw new Error(error.message || ERROR_MESSAGES.NETWORK_ERROR)
    }
  }

  // GET - Daftar lelang aktif
  async getLelangAktif() {
    return this.apiCall(API_ENDPOINTS.LELANG_LIST)
  }

  // GET - Detail lelang by ID
  async getLelangDetail(id) {
    if (!id) {
      throw new Error('ID lelang diperlukan')
    }
    return this.apiCall(API_ENDPOINTS.LELANG_DETAIL(id))
  }

  // GET - History bid untuk lelang tertentu
  async getBidHistory(id) {
    if (!id) {
      throw new Error('ID lelang diperlukan')
    }
    return this.apiCall(API_ENDPOINTS.LELANG_BID_HISTORY(id))
  }

  // POST - Submit bid baru
  async submitBid(id, bidData) {
    if (!id) {
      throw new Error('ID lelang diperlukan')
    }

    // Validate bid data
    const { nama_bidder, kontak_bidder, jumlah_bid } = bidData
    
    if (!nama_bidder || !jumlah_bid) {
      throw new Error('Nama bidder dan jumlah bid wajib diisi')
    }

    if (parseInt(jumlah_bid) <= 0) {
      throw new Error('Jumlah bid harus lebih dari 0')
    }

    const payload = {
      nama_bidder: nama_bidder.trim(),
      kontak_bidder: kontak_bidder ? kontak_bidder.trim() : null,
      jumlah_bid: parseInt(jumlah_bid)
    }

    return this.apiCall(API_ENDPOINTS.SUBMIT_BID(id), {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  // Helper - Refresh single lelang data
  async refreshLelang(id) {
    try {
      const [lelangDetail, bidHistory] = await Promise.all([
        this.getLelangDetail(id),
        this.getBidHistory(id)
      ])

      return {
        success: true,
        lelang: lelangDetail.data,
        bids: bidHistory.data || []
      }
    } catch (error) {
      console.error('Error refreshing lelang:', error)
      throw error
    }
  }

  // Helper - Check if lelang is still active by calculating time
  isLelangActive(lelang) {
    if (!lelang || lelang.status_lelang !== 'aktif') {
      return false
    }

    if (lelang.sisa_detik !== undefined) {
      return lelang.sisa_detik > 0
    }

    // Fallback calculation if sisa_detik not provided
    if (lelang.tanggal_mulai && lelang.durasi_lelang_jam) {
      const startTime = new Date(lelang.tanggal_mulai)
      const endTime = new Date(startTime.getTime() + (lelang.durasi_lelang_jam * 60 * 60 * 1000))
      const now = new Date()
      return now < endTime
    }

    return false
  }

  // Helper - Get quick stats for lelang
  getQuickStats(lelang) {
    const hargaAwal = lelang?.harga_awal || 0
    const hargaTertinggi = lelang?.harga_tertinggi || hargaAwal
    const totalBid = lelang?.total_bid || 0
    const kenaikanHarga = hargaTertinggi - hargaAwal
    const persentaseKenaikan = hargaAwal > 0 ? ((kenaikanHarga / hargaAwal) * 100) : 0

    return {
      harga_awal: hargaAwal,
      harga_tertinggi: hargaTertinggi,
      total_bid: totalBid,
      kenaikan_harga: kenaikanHarga,
      persentase_kenaikan: Math.round(persentaseKenaikan),
      is_ada_bid: totalBid > 0
    }
  }

  // Helper - Generate next suggested bid amounts
  getSuggestedBids(currentHighest = 0) {
    const baseAmounts = [1000, 5000, 10000, 25000, 50000, 100000]
    
    return baseAmounts
      .map(amount => currentHighest + amount)
      .filter(amount => amount > currentHighest)
      .slice(0, 4) // Ambil 4 suggestion teratas
  }

  // Helper - Validate bid before submit
  validateBidBeforeSubmit(lelang, bidAmount, bidderName) {
    const errors = []

    // Check lelang masih aktif
    if (!this.isLelangActive(lelang)) {
      errors.push('Lelang sudah tidak aktif')
    }

    // Check bid amount
    const currentHighest = lelang?.harga_tertinggi || lelang?.harga_awal || 0
    if (parseInt(bidAmount) <= currentHighest) {
      errors.push(`Bid harus lebih tinggi dari ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(currentHighest)}`)
    }

    // Check bidder name
    if (!bidderName || bidderName.trim().length < 2) {
      errors.push('Nama minimal 2 karakter')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Create singleton instance
const lelangPublicService = new LelangPublicService()

export default lelangPublicService
export { LelangPublicService }