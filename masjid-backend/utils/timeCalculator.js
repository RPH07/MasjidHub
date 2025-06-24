const calculateTimeLeft = (tanggalMulai, durasiJam) => {
  if (!tanggalMulai || !durasiJam) return 0
  
  const startTime = new Date(tanggalMulai)
  const endTime = new Date(startTime.getTime() + (durasiJam * 60 * 60 * 1000))
  const now = new Date()
  
  const sisaDetik = Math.max(0, Math.floor((endTime - now) / 1000))
  return sisaDetik
}

const formatTimeRemaining = (sisaDetik) => {
  if (sisaDetik <= 0) return 'Berakhir'
  
  const jam = Math.floor(sisaDetik / 3600)
  const menit = Math.floor((sisaDetik % 3600) / 60)
  const detik = sisaDetik % 60
  
  if (jam > 0) return `${jam}j ${menit}m ${detik}s`
  if (menit > 0) return `${menit}m ${detik}s`
  return `${detik}s`
}

module.exports = {
  calculateTimeLeft,
  formatTimeRemaining
}