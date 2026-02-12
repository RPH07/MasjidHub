const rateLimit = require('express-rate-limit')

// Rate limiting untuk public endpoints
const publicRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 30, // max 30 requests per menit per IP
  message: {
    success: false,
    message: 'Terlalu banyak request. Coba lagi dalam 1 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const permintaanRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit  
  max: 5, // max 5 permintaan per menit per IP
  message: {
    success: false,
    message: 'Terlalu banyak permintaan. Tunggu 1 menit sebelum permintaan lagi.'
  }
})

// Middleware untuk public access
const publicAccess = (req, res, next) => {
  // Set flag bahwa ini public request
  req.isPublic = true
  
  // Add CORS headers untuk public access
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  
  // Log public usage (optional)
  console.log(`Public access: ${req.method} ${req.path} from ${req.ip}`)
  
  next()
}

module.exports = {
  publicAccess,
  publicRateLimit,
  permintaanRateLimit
}