const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const kegiatanRoutes = require('./routes/kegiatan');
const kasRoutes = require('./routes/kas');
const zakatRoutes = require('./routes/zakat');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true                 
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/kas', kasRoutes);
app.use('/api/zakat', zakatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
