import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    saldoMasjid: 0,
    totalDonasiUser: 0,
    totalZakatUser: 0,
    totalKegiatan: 0,
    programAktif: 0
  });

  // state for chart data
  const [chartData, setChartData] = useState({
    trenKeuangan: [],
    komposisiDana: []
  })

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

 const [aktivitasTerbaru, setAktivitasTerbaru] = useState([]);
  const [loadingAktivitas, setLoadingAktivitas] = useState(false);

  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch data paralel
        const [kasRes, donasiRes, zakatRes, kegiatanRes, programRes] = await Promise.all([
          axios.get('http://localhost:5000/api/kas/summary', config),
          axios.get(`http://localhost:5000/api/donasi/history/user/${user?.id}`, config),
          axios.get(`http://localhost:5000/api/zakat/history/${user?.id}`, config),
          axios.get('http://localhost:5000/api/kegiatan', config),
          axios.get('http://localhost:5000/api/donasi/program?status=aktif', config)
        ]);

        setStats({
          saldoMasjid: kasRes.data.data?.totalSaldo || 0,
          totalDonasiUser: donasiRes.data.data?.statistics?.total_nominal_approved || 0,
          totalZakatUser: zakatRes.data.data?.reduce((sum, item) => 
            item.status === 'approved' ? sum + item.jumlah : sum, 0) || 0,
          totalKegiatan: kegiatanRes.data?.length || 0,
          programAktif: programRes.data?.length || 0
        });

        processChartDataFromSummary(kasRes.data.data);

        // ✅ FETCH AKTIVITAS SETELAH DATA UTAMA
        await fetchAktivitasTerbaru(config, donasiRes.data, zakatRes.data, kegiatanRes.data);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  // FUNCTION FETCH AKTIVITAS MIX
  const fetchAktivitasTerbaru = async (config, donasiUserData, zakatUserData, kegiatanData) => {
    setLoadingAktivitas(true);
    try {
      // 1. Aktivitas Personal User (limit 3)
      const personalActivities = [];
      
      // Donasi user (2 terbaru)
      const userDonasi = donasiUserData?.data?.donations?.slice(0, 2) || [];
      userDonasi.forEach(donasi => {
        personalActivities.push({
          id: `donasi-${donasi.id}`,
          type: 'personal_donasi',
          icon: '💝',
          title: `Donasi "${donasi.nama_barang}"`,
          description: `${formatRupiah(donasi.nominal)}`,
          status: donasi.status,
          timestamp: new Date(donasi.created_at),
          isPersonal: true,
          clickable: true,
          data: donasi
        });
      });

      // Zakat user (1 terbaru)
      const userZakat = zakatUserData?.data?.slice(0, 1) || [];
      userZakat.forEach(zakat => {
        personalActivities.push({
          id: `zakat-${zakat.id}`,
          type: 'personal_zakat',
          icon: '🌙',
          title: `Zakat ${zakat.jenis_zakat}`,
          description: `${formatRupiah(zakat.jumlah)}`,
          status: zakat.status,
          timestamp: new Date(zakat.created_at),
          isPersonal: true,
          clickable: false,
          data: zakat
        });
      });

      // 2. Aktivitas Masjid Umum (limit 2)
      const masjidActivities = [];

      // Donasi masuk dari user lain (menggunakan kas history)
      const kasHistoryRes = await axios.get(
        'http://localhost:5000/api/kas/history?type=donasi&limit=3',
        config
      );
      
      const recentDonations = kasHistoryRes?.data?.data?.transactions || [];
      recentDonations.forEach(donation => {
        // Skip donasi dari user sendiri
        if (donation.user_id && donation.user_id == user.id) return;
        
        masjidActivities.push({
          id: `public-donasi-${donation.id}`,
          type: 'masjid_donasi',
          icon: '🤝',
          title: 'Donasi Masuk',
          description: `${donation.nama_pemberi || 'Anonim'} • ${formatRupiah(donation.jumlah)}`,
          status: 'approved',
          timestamp: new Date(donation.created_at),
          isPersonal: false,
          clickable: false,
          data: donation
        });
      });

      // debug struktur data kegiatan
      // console.log('🔍 Debug kegiatanData structure:', kegiatanData);

      // Kegiatan terbaru masjid (1 terbaru)
      let kegiatanArray = [];
      
      // Cek apakah kegiatanData sudah array atau masih dalam wrapper object
      if (Array.isArray(kegiatanData)) {
        kegiatanArray = kegiatanData;
      } else if (kegiatanData?.data && Array.isArray(kegiatanData.data)) {
        kegiatanArray = kegiatanData.data;
      } 

      const recentKegiatan = kegiatanArray.slice(0, 1) || [];
      recentKegiatan.forEach(kegiatan => {
        masjidActivities.push({
          id: `kegiatan-${kegiatan.id}`,
          type: 'masjid_kegiatan',
          icon: '🕌',
          title: `Kegiatan: ${kegiatan.nama_kegiatan}`,
          description: `${new Date(kegiatan.tanggal).toLocaleDateString('id-ID')} • ${kegiatan.lokasi}`,
          status: 'info',
          timestamp: new Date(kegiatan.created_at || kegiatan.tanggal), // Fallback ke tanggal jika created_at tidak ada
          isPersonal: false,
          clickable: true,
          data: kegiatan
        });
      });

      // 3. Gabungkan dan sort berdasarkan timestamp
      const allActivities = [...personalActivities, ...masjidActivities]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5); // Limit 5 aktivitas

      console.log('📋 All activities:', allActivities); // Debug

      setAktivitasTerbaru(allActivities);

    } catch (error) {
      console.error('Error fetching aktivitas:', error);
      setAktivitasTerbaru([]);
    } finally {
      setLoadingAktivitas(false);
    }
  };

  // FUNCTION HANDLE CLICK AKTIVITAS
  const handleAktivitasClick = (aktivitas) => {
    if (!aktivitas.clickable) return;

    setSelectedDetail(aktivitas);
    setShowDetailModal(true);
  };

  // FUNCTION HANDLE CLOSE MODAL
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetail(null);
  };

    // Function render Detail
  const renderDetailContent = (aktivitas) => {
    if (aktivitas.type === 'personal_donasi') {
      return (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Detail Donasi Anda
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">Program:</span>
                <p className="text-gray-800">{aktivitas.data.nama_barang}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Nominal:</span>
                <p className="text-gray-800 font-bold">{formatRupiah(aktivitas.data.nominal)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(aktivitas.status)}`}>
                  {aktivitas.status === 'approved' && '✅ Disetujui'}
                  {aktivitas.status === 'pending' && '⏳ Menunggu Persetujuan'}
                  {aktivitas.status === 'rejected' && '❌ Ditolak'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Tanggal:</span>
                <p className="text-gray-800">
                  {new Date(aktivitas.data.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {aktivitas.data.kode_unik && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="font-medium text-blue-800">Kode Unik:</span>
                <p className="text-blue-900 font-mono text-lg">{aktivitas.data.kode_unik}</p>
              </div>
            )}

            {aktivitas.data.bukti_transfer && (
              <div>
                <span className="font-medium text-gray-600">Bukti Transfer:</span>
                <img 
                  src={`http://localhost:5000/uploads/bukti/${aktivitas.data.bukti_transfer}`}
                  alt="Bukti Transfer"
                  className="mt-2 max-w-full h-auto rounded border"
                />
              </div>
            )}
          </div>
        </div>
      );
    } else if (aktivitas.type === 'masjid_kegiatan') {
      return (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Detail Kegiatan Masjid
          </h2>
          <div className="space-y-4">
            {/* Foto Kegiatan */}
            {aktivitas.data.foto ? (
              <img
                src={`http://localhost:5000/uploads/${aktivitas.data.foto}`}
                alt={aktivitas.data.nama_kegiatan}
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center rounded-lg">
                <span className="text-white text-4xl">🕌</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">Nama Kegiatan:</span>
                <p className="text-gray-800 font-semibold">{aktivitas.data.nama_kegiatan}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Tanggal:</span>
                <p className="text-gray-800">
                  {new Date(aktivitas.data.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Lokasi:</span>
                <p className="text-gray-800">{aktivitas.data.lokasi}</p>
              </div>
              {aktivitas.data.kategori && (
                <div>
                  <span className="font-medium text-gray-600">Kategori:</span>
                  <p className="text-gray-800">{aktivitas.data.kategori}</p>
                </div>
              )}
            </div>

            {aktivitas.data.deskripsi && (
              <div>
                <span className="font-medium text-gray-600">Deskripsi:</span>
                <div className="bg-gray-50 p-3 rounded-lg mt-1">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {aktivitas.data.deskripsi}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // FUNCTION GET STATUS COLOR
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  //  FUNCTION FORMAT WAKTU RELATIF
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diffInHours = (now - new Date(timestamp)) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    return new Date(timestamp).toLocaleDateString('id-ID');
  };

  const processChartDataFromSummary = (kasData) => {
    console.log('🔍 Processing from summary:', kasData);

    // ✅ TREN KEUANGAN - DUMMY DATA + DATA REAL BULAN INI
    // Karena API tidak punya historical monthly, kita buat dummy + real data
    const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    
    const trenKeuangan = [
      { month: 'Agu 24', pemasukan: 8500000, pengeluaran: 1200000 },
      { month: 'Sep 24', pemasukan: 12300000, pengeluaran: 800000 },
      { month: 'Okt 24', pemasukan: 9800000, pengeluaran: 1500000 },
      { month: 'Nov 24', pemasukan: 15200000, pengeluaran: 900000 },
      { month: 'Des 24', pemasukan: 18700000, pengeluaran: 2100000 },
      { 
        month: currentMonth, // Bulan saat ini
        pemasukan: kasData?.totalPemasukan || 0, 
        pengeluaran: kasData?.totalPengeluaran || 0 
      }
    ];

    // ✅ KOMPOSISI DANA - DARI SUMMARY YANG AKURAT
    const pemasukanKategori = kasData?.pemasukanKategori || {};
    
    const komposisiDana = [
      { 
        name: 'Donasi', 
        value: pemasukanKategori.donasi || 0, 
        color: '#3B82F6' 
      },
      { 
        name: 'Zakat', 
        value: pemasukanKategori.zakat || 0, 
        color: '#8B5CF6' 
      },
      { 
        name: 'Infaq', 
        value: pemasukanKategori.infaq || 0, 
        color: '#F59E0B' 
      },
      { 
        name: 'Kas Manual', 
        value: pemasukanKategori.kas_manual || 0, 
        color: '#10B981' 
      }
    ].filter(item => item.value > 0);

    console.log('📊 Tren Keuangan (from summary):', trenKeuangan);
    console.log('🥧 Komposisi Dana (from summary):', komposisiDana);

    setChartData({ trenKeuangan, komposisiDana });
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {formatRupiah(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">
        Assalamualaikum, {user?.nama || 'Jamaah'}!
      </h1>

      {/*  RINGKASAN DINAMIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Saldo Masjid */}
        <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-green-800">Saldo Masjid</div>
              <div className="mt-2 text-2xl font-bold text-green-900">
                {formatRupiah(stats.saldoMasjid)}
              </div>
              <div className="text-sm text-green-600">Saldo saat ini</div>
            </div>
            <div className="text-3xl">🏛️</div>
          </div>
        </div>

        {/* Total Donasi User */}
        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-blue-800">Donasi Anda</div>
              <div className="mt-2 text-2xl font-bold text-blue-900">
                {formatRupiah(stats.totalDonasiUser)}
              </div>
              <div className="text-sm text-blue-600">Total kontribusi</div>
            </div>
            <div className="text-3xl">💝</div>
          </div>
        </div>

        {/* Total Zakat User */}
        <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-purple-800">Zakat Anda</div>
              <div className="mt-2 text-2xl font-bold text-purple-900">
                {formatRupiah(stats.totalZakatUser)}
              </div>
              <div className="text-sm text-purple-600">Total zakat</div>
            </div>
            <div className="text-3xl">🌙</div>
          </div>
        </div>

        {/* Program Aktif */}
        <div className="rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-orange-800">Program Aktif</div>
              <div className="mt-2 text-2xl font-bold text-orange-900">
                {stats.programAktif}
              </div>
              <div className="text-sm text-orange-600">Dapat didonasi</div>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
      </div>

      {/*  CHARTS SECTION */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Tren Keuangan Line Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tren Keuangan Masjid</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.trenKeuangan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pemasukan" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Pemasukan"
              />
              <Line 
                type="monotone" 
                dataKey="pengeluaran" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Pengeluaran"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Komposisi Dana Pie Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Komposisi Dana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.komposisiDana}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.komposisiDana.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRupiah(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
          <span className="text-sm text-gray-500">Mix Personal & Masjid</span>
        </div>
        
        {loadingAktivitas ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Memuat aktivitas...</p>
          </div>
        ) : aktivitasTerbaru.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Belum ada aktivitas terbaru
          </div>
        ) : (
          <div className="space-y-3">
            {aktivitasTerbaru.map((aktivitas) => (
              <div 
                key={aktivitas.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  aktivitas.clickable 
                    ? 'hover:bg-gray-50 cursor-pointer' 
                    : 'bg-gray-50/50'
                } ${aktivitas.isPersonal ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'}`}
                onClick={() => handleAktivitasClick(aktivitas)}
              >
                {/* Icon */}
                <div className="text-2xl mt-1">
                  {aktivitas.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {aktivitas.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {aktivitas.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {/* Status Badge */}
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(aktivitas.status)}`}>
                          {aktivitas.status === 'approved' && '✅ Disetujui'}
                          {aktivitas.status === 'pending' && '⏳ Menunggu'}
                          {aktivitas.status === 'rejected' && '❌ Ditolak'}
                          {aktivitas.status === 'info' && '📋 Info'}
                        </span>
                        
                        {/* Personal/Public Badge */}
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          aktivitas.isPersonal 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-green-600 bg-green-50'
                        }`}>
                          {aktivitas.isPersonal ? '👤 Personal' : '🏛️ Masjid'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="text-xs text-gray-500 ml-2 shrink-0">
                      {getRelativeTime(aktivitas.timestamp)}
                    </div>
                  </div>
                </div>
                
                {/* Click indicator */}
                {aktivitas.clickable && (
                  <div className="text-gray-400 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedDetail.icon}</span>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedDetail.type === 'personal_donasi' ? 'Detail Donasi' : 'Detail Kegiatan'}
                </h3>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            {/* Content Modal */}
            <div className="p-6">
              {renderDetailContent(selectedDetail)}
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCloseDetailModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              {selectedDetail.type === 'personal_donasi' && selectedDetail.status === 'pending' && (
                <button
                  onClick={() => {
                    // Bisa navigate ke halaman edit atau upload bukti
                    console.log('Upload bukti untuk:', selectedDetail.data);
                    handleCloseDetailModal();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Bukti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;