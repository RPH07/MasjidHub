const validateBidAmount = (amount, currentHighest, minIncrement = 1000) => {
  const numAmount = parseInt(amount)
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, message: 'Jumlah bid harus berupa angka positif' }
  }
  
  if (numAmount <= currentHighest) {
    return { 
      valid: false, 
      message: `Bid harus lebih tinggi dari Rp ${currentHighest.toLocaleString('id-ID')}` 
    }
  }
  
  if (numAmount < currentHighest + minIncrement) {
    return { 
      valid: false, 
      message: `Bid minimum Rp ${(currentHighest + minIncrement).toLocaleString('id-ID')}` 
    }
  }
  
  return { valid: true }
}

const validateBidder = (nama, kontak) => {
  if (!nama || nama.trim().length < 2) {
    return { valid: false, message: 'Nama minimal 2 karakter' }
  }
  
  if (nama.trim().length > 100) {
    return { valid: false, message: 'Nama maksimal 100 karakter' }
  }
  
  // Kontak opsional, tapi kalau ada harus valid
  if (kontak && kontak.length > 0) {
    if (kontak.length < 10 || kontak.length > 15) {
      return { valid: false, message: 'Nomor kontak harus 10-15 digit' }
    }
  }
  
  return { valid: true }
}

module.exports = {
  validateBidAmount,
  validateBidder
}