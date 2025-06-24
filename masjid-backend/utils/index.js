// Function yang mungkin sudah ada
const calculateTimeLeft = (tanggalMulai, durasiJam) => {
  const now = new Date()
  const mulai = new Date(tanggalMulai)
  const selesai = new Date(mulai.getTime() + (durasiJam * 60 * 60 * 1000))
  
  const selisihMs = selesai.getTime() - now.getTime()
  return Math.max(0, Math.floor(selisihMs / 1000))
}

// Function yang mungkin sudah ada
const formatPublicLelang = (lelangData) => {
  return lelangData.map(lelang => ({
    ...lelang,
    sisa_detik: calculateTimeLeft(lelang.tanggal_mulai, lelang.durasi_lelang_jam)
  }))
}

// ==========================================
// TAMBAH FUNCTIONS BARU DI SINI:
// ==========================================

const formatPublicBids = (bidData) => {
  return bidData.map(bid => ({
    id: bid.id || Date.now() + Math.random(),
    nama_bidder: bid.nama_bidder || 'Anonymous',
    jumlah_bid: bid.jumlah_bid,
    tanggal_bid: bid.tanggal_bid,
    urutan: bid.urutan || 0
  }))
}

const validateBidder = (nama_bidder, kontak_bidder) => {
  if (!nama_bidder || !nama_bidder.trim()) {
    return { valid: false, message: 'Nama bidder wajib diisi' }
  }
  
  if (nama_bidder.trim().length < 2) {
    return { valid: false, message: 'Nama bidder minimal 2 karakter' }
  }
  
  if (nama_bidder.trim().length > 50) {
    return { valid: false, message: 'Nama bidder maksimal 50 karakter' }
  }
  
  return { valid: true, message: '' }
}

const validateBidAmount = (jumlah_bid, currentHighest) => {
  const amount = parseInt(jumlah_bid)
  
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, message: 'Jumlah bid harus berupa angka positif' }
  }
  
  const minBid = currentHighest + 1000
  if (amount < minBid) {
    return { 
      valid: false, 
      message: `Bid minimal Rp ${minBid.toLocaleString('id-ID')} (Rp 1.000 di atas bid tertinggi)`
    }
  }
  
  return { valid: true, message: '' }
}

// ==========================================
// UPDATE EXPORTS (yang paling bawah file):
// ==========================================

module.exports = {
  calculateTimeLeft,
  formatPublicLelang,
  formatPublicBids,      // ← TAMBAH
  validateBidAmount,     // ← TAMBAH  
  validateBidder         // ← TAMBAH
}