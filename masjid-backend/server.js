require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const kegiatanRoutes = require('./routes/kegiatan');
const kasRoutes = require('./routes/kas');
const zakatRoutes = require('./routes/zakat');
const pengadaanRoutes = require('./routes/pengadaan');
const kategoriKegiatanRoutes = require('./routes/kategori-kegiatan');
const kontribusiRoutes = require('./routes/kontribusi');
const transparansiRoutes = require('./routes/transparansi');
const zakatSettingRoutes = require('./routes/zakat-settings');

dotenv.config();

const app = express();
app.use(express.static('public'));

const allowedOrigins = [
  'https://masjidnurulilmi.my.id',
  'https://www.masjidnurulilmi.my.id',
  'http://masjidnurulilmi.my.id',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());  
// app.use('/images', express.static(path.join(__dirname, 'public/images')));
// Tambahkan static file serving untuk bukti transfer
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MasjidHub API is Running',
    developer: 'Rey'
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/kas', kasRoutes);
app.use('/api/zakat', zakatRoutes);
app.use('/api/kategori-kegiatan', kategoriKegiatanRoutes);
app.use('/api/pengadaan', pengadaanRoutes);
app.use('/api/kontribusi', kontribusiRoutes);
app.use('/api/transparansi', transparansiRoutes);
app.use('/api/zakat-settings', zakatSettingRoutes);

// Backward-compatible routes for clients configured without the /api prefix.
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/kegiatan', kegiatanRoutes);
app.use('/kas', kasRoutes);
app.use('/zakat', zakatRoutes);
app.use('/kategori-kegiatan', kategoriKegiatanRoutes);
app.use('/pengadaan', pengadaanRoutes);
app.use('/kontribusi', kontribusiRoutes);
app.use('/transparansi', transparansiRoutes);
app.use('/zakat-settings', zakatSettingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
