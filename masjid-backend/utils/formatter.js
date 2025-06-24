const formatPublicLelang = (data) => {
  return data.map(item => ({
    id: item.id,
    nama_barang: item.nama_barang,
    deskripsi: item.deskripsi,
    harga_awal: item.harga_awal,
    harga_tertinggi: item.harga_tertinggi || item.harga_awal,
    foto_barang: item.foto_barang,
    kondisi_barang: item.kondisi_barang,
    tanggal_lelang: item.tanggal_lelang,
    tanggal_mulai: item.tanggal_mulai,
    total_bid: item.total_bid || 0,
    durasi_lelang_jam: item.durasi_lelang_jam,
    status_lelang: item.status_lelang,
    sisa_detik: calculateTimeLeft(item.tanggal_mulai, item.durasi_lelang_jam)
  }))
}

const formatPublicBids = (bids) => {
  return bids.map((bid, index) => ({
    urutan: bid.urutan || (index + 1),
    jumlah_bid: bid.jumlah_bid,
    tanggal_bid: bid.tanggal_bid,
    // Hide nama_bidder dan kontak untuk privacy
    nama_bidder: `Bidder #${bid.urutan || (index + 1)}`
  }))
}

const { calculateTimeLeft } = require('./timeCalculator')

module.exports = {
  formatPublicLelang,
  formatPublicBids
}