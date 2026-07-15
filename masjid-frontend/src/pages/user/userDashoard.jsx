import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';
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
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartHandshake,
  ImageIcon,
  Info,
  Landmark,
  Moon,
  Target,
  UserRound,
  X,
  XCircle
} from 'lucide-react';

// Helper tanggal untuk parameter query API. Ditaruh di luar komponen supaya
// nilainya stabil dan tidak perlu masuk dependency useEffect.
const formatDateParam = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Membuat daftar bulan terakhir yang dipakai chart tren keuangan.
const getLastMonthRanges = (count = 6) => {
  const now = new Date();

  return Array.from({length: count}, (_, index) => {
    const offset = count - 1 - index;
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);

    return {
      label: start.toLocaleDateString('id-ID', {month: 'short', year: '2-digit'}),
      startDate: formatDateParam(start),
      endDate: formatDateParam(end)
    };
  });
};

const UserDashboard = () => {
  const { user } = useAuth();

  // State utama untuk kartu ringkasan di bagian atas dashboard.
  const [stats, setStats] = useState({
    saldoMasjid: 0,
    totalDonasiUser: 0,
    totalZakatUser: 0,
    totalKegiatan: 0,
    programAktif: 0
  });

  // Data chart dipisah dari stats karena bentuknya sudah disesuaikan dengan Recharts.
  const [chartData, setChartData] = useState({
    trenKeuangan: [],
    komposisiDana: []
  })

  // State untuk feed aktivitas terbaru dan modal detail saat item aktivitas diklik.
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState([]);
  const [loadingAktivitas, setLoadingAktivitas] = useState(false);
  const [loading, setLoading] = useState(true);

  // Menggabungkan kontribusi user dan kegiatan masjid menjadi satu feed aktivitas.
  // Data asalnya sudah diambil fetchDashboardData, jadi fungsi ini hanya membentuk UI model.
  const fetchAktivitasTerbaru = useCallback(async (kontribusiHistory, kegiatanData) => {
    setLoadingAktivitas(true);
    try {
      // Aktivitas personal diambil dari riwayat kontribusi user.
      const personalActivities = [];
      
      // Donasi bisa dibuka detailnya karena punya bukti/status pembayaran.
      const userDonasi = kontribusiHistory
        .filter((item) => item.type === 'donasi')
        .slice(0, 2);
      userDonasi.forEach(donasi => {
        personalActivities.push({
          id: `donasi-${donasi.id}`,
          type: 'personal_donasi',
          title: donasi.detail_program,
          description: `${formatRupiah(donasi.jumlah)}`,
          status: donasi.status,
          timestamp: new Date(donasi.created_at),
          isPersonal: true,
          clickable: true,
          data: donasi
        });
      });

      // Zakat ditampilkan sebagai informasi ringkas tanpa modal detail.
      const userZakat = kontribusiHistory
        .filter((item) => item.type === 'zakat')
        .slice(0, 1);
      userZakat.forEach(zakat => {
        personalActivities.push({
          id: `zakat-${zakat.id}`,
          type: 'personal_zakat',
          title: zakat.detail_program,
          description: `${formatRupiah(zakat.jumlah)}`,
          status: zakat.status,
          timestamp: new Date(zakat.created_at),
          isPersonal: true,
          clickable: false,
          data: zakat
        });
      });

      // Aktivitas umum dari data kegiatan masjid.
      const masjidActivities = [];

      // Kegiatan bisa diklik untuk melihat info lokasi, tanggal, dan deskripsi.
      const recentKegiatan = (Array.isArray(kegiatanData) ? kegiatanData : []).slice(0, 1);
      recentKegiatan.forEach(kegiatan => {
        masjidActivities.push({
          id: `kegiatan-${kegiatan.id}`,
          type: 'masjid_kegiatan',
          title: `Kegiatan: ${kegiatan.judul}`,
          description: `${new Date(kegiatan.tanggal).toLocaleDateString('id-ID')} • ${kegiatan.lokasi}`,
          status: 'info',
          timestamp: new Date(kegiatan.created_at || kegiatan.tanggal), // Jika created_at kosong, urutkan memakai tanggal kegiatan.
          isPersonal: false,
          clickable: true,
          data: kegiatan
        });
      });

      // Feed ditampilkan dari yang paling baru dan dibatasi agar dashboard tetap ringkas.
      const allActivities = [...personalActivities, ...masjidActivities]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      setAktivitasTerbaru(allActivities);

    } catch (error) {
      console.error('Error fetching aktivitas:', error);
      setAktivitasTerbaru([]);
    } finally {
      setLoadingAktivitas(false);
    }
  }, []);

  useEffect(() => {
    // Mengambil seluruh data dashboard dalam satu effect saat user sudah tersedia.
    const fetchDashboardData = async () => {
      try {
        const monthRanges = getLastMonthRanges(6);
        // Snapshot data yang dibutuhkan dashboard: kas, kontribusi, kegiatan, program, dan summary bulanan.
        const [
          kasRes,
          kontribusiSummaryRes,
          kontribusiHistoryRes,
          kegiatanRes,
          programRes,
          monthlyKasRes] = await Promise.all([
          api.get('/kas/summary'),
          api.get('/kontribusi/summary'),
          api.get('/kontribusi/history'),
          api.get('/kegiatan'),
          api.get('/pengadaan', { params: { status: 'aktif' } }),
          Promise.all(
            monthRanges.map((range) =>
              api.get('/kas/summary', {
                params: {
                  startDate: range.startDate,
                  endDate: range.endDate
                }
              })
            )
          )
        ]);

        const kontribusiSummary = kontribusiSummaryRes.data?.data || {};
        const kontribusiHistory = kontribusiHistoryRes.data?.data || [];
        const kegiatanList = Array.isArray(kegiatanRes.data)
          ? kegiatanRes.data
          : kegiatanRes.data?.data || [];
        const programList = programRes.data?.data || [];

        setStats({
          saldoMasjid: kasRes.data.data?.totalSaldo || 0,
          totalDonasiUser: kontribusiSummary.donasi?.total_amount || 0,
          totalZakatUser: kontribusiSummary.zakat?.total_amount || 0,
          totalKegiatan: kegiatanList.length || 0,
          programAktif: programList.length || 0
        });

        // Response summary bulanan diubah ke format yang langsung bisa dibaca LineChart.
        const trenKeuangan = monthlyKasRes.map((response, index) => {
          const summary = response.data?.data || {};
          return {
            month: monthRanges[index].label,
            pemasukan: Number(summary.totalPemasukan || 0),
            pengeluaran: Number(summary.totalPengeluaran || 0)
          };
        });

        // Komposisi dana memakai summary kas saat ini, sementara tren memakai summary per bulan.
        processChartDataFromSummary(kasRes.data?.data, trenKeuangan);

        await fetchAktivitasTerbaru(kontribusiHistory, kegiatanList);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, fetchAktivitasTerbaru]);

  // Item aktivitas yang clickable akan membuka modal detail; item info biasa diabaikan.
  const handleAktivitasClick = (aktivitas) => {
    if (!aktivitas.clickable) return;

    setSelectedDetail(aktivitas);
    setShowDetailModal(true);
  };

  // Reset modal sekaligus data pilihan supaya detail lama tidak tertinggal.
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetail(null);
  };

  // Isi modal berbeda per tipe aktivitas karena field donasi dan kegiatan tidak sama.
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
                <p className="text-gray-800">{aktivitas.data.detail_program}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Nominal:</span>
                <p className="text-gray-800 font-bold">{formatRupiah(aktivitas.data.jumlah)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <StatusBadge status={aktivitas.status} verbose />
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
                  src={aktivitas.data.bukti_transfer}
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
            {/* Gambar kegiatan; fallback icon dipakai jika kegiatan belum punya foto. */}
            {aktivitas.data.image_url ? (
              <img
                src={aktivitas.data.image_url}
                alt={aktivitas.data.judul}
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center rounded-lg">
                <ImageIcon className="h-12 w-12 text-white" aria-hidden="true" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">Nama Kegiatan:</span>
                <p className="text-gray-800 font-semibold">{aktivitas.data.judul}</p>
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
                  <p className="text-gray-800">
                    {typeof aktivitas.data.kategori === 'string'
                      ? aktivitas.data.kategori
                      : aktivitas.data.kategori?.nama_kategori || 'N/A'}
                  </p>
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

  // Warna badge status dibuat satu tempat agar konsisten di list dan modal.
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Mengubah timestamp menjadi teks pendek untuk list aktivitas terbaru.
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diffInHours = (now - new Date(timestamp)) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    return new Date(timestamp).toLocaleDateString('id-ID');
  };

  // Menyiapkan data Recharts dari response kas summary.
  const processChartDataFromSummary = (kasData, trenKeuangan = []) => {
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

    setChartData({ trenKeuangan, komposisiDana });
  };

  // Formatter nominal rupiah dipakai di kartu, chart tooltip, dan aktivitas.
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Tooltip khusus agar angka di grafik tetap memakai format rupiah.
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

  // Mapping icon dan label status dipusatkan supaya JSX aktivitas tidak penuh kondisi berulang.
  const activityIconMap = {
    personal_donasi: HeartHandshake,
    personal_zakat: Moon,
    masjid_kegiatan: CalendarDays
  };

  const getActivityIconClass = (type) => {
    switch (type) {
      case 'personal_donasi':
        return 'bg-blue-100 text-blue-700';
      case 'personal_zakat':
        return 'bg-purple-100 text-purple-700';
      case 'masjid_kegiatan':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const ActivityIcon = ({ type, size = 'md' }) => {
    const Icon = activityIconMap[type] || Info;
    const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    const wrapperClass = size === 'lg' ? 'h-11 w-11' : 'h-10 w-10';

    return (
      <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${wrapperClass} ${getActivityIconClass(type)}`}>
        <Icon className={sizeClass} aria-hidden="true" />
      </span>
    );
  };

  const getStatusMeta = (status, verbose = false) => {
    switch (status) {
      case 'approved':
        return { Icon: CheckCircle2, label: 'Disetujui' };
      case 'pending':
        return { Icon: Clock3, label: verbose ? 'Menunggu Persetujuan' : 'Menunggu' };
      case 'rejected':
        return { Icon: XCircle, label: 'Ditolak' };
      case 'info':
        return { Icon: Info, label: 'Info' };
      default:
        return { Icon: Info, label: status || 'Status' };
    }
  };

  const StatusBadge = ({ status, verbose = false }) => {
    const { Icon, label } = getStatusMeta(status, verbose);

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </span>
    );
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

      {/* Kartu ringkasan utama dari data kas, kontribusi user, dan program aktif. */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg border bg-linear-to-br from-green-50 to-green-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-green-800">Saldo Masjid</div>
              <div className="mt-2 text-2xl font-bold text-green-900">
                {formatRupiah(stats.saldoMasjid)}
              </div>
              <div className="text-sm text-green-600">Saldo saat ini</div>
            </div>
            <Landmark className="h-9 w-9 text-green-700" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-lg border bg-linear-to-br from-blue-50 to-blue-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-blue-800">Donasi Anda</div>
              <div className="mt-2 text-2xl font-bold text-blue-900">
                {formatRupiah(stats.totalDonasiUser)}
              </div>
              <div className="text-sm text-blue-600">Total kontribusi</div>
            </div>
            <HeartHandshake className="h-9 w-9 text-blue-700" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-lg border bg-linear-to-br from-purple-50 to-purple-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-purple-800">Zakat Anda</div>
              <div className="mt-2 text-2xl font-bold text-purple-900">
                {formatRupiah(stats.totalZakatUser)}
              </div>
              <div className="text-sm text-purple-600">Total zakat</div>
            </div>
            <Moon className="h-9 w-9 text-purple-700" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-lg border bg-linear-to-br from-orange-50 to-orange-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-orange-800">Program Aktif</div>
              <div className="mt-2 text-2xl font-bold text-orange-900">
                {stats.programAktif}
              </div>
              <div className="text-sm text-orange-600">Dapat didonasi</div>
            </div>
            <Target className="h-9 w-9 text-orange-700" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Grafik dashboard: tren bulanan dan komposisi dana dari summary kas. */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Tren pemasukan dan pengeluaran dalam beberapa bulan terakhir. */}
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
        
        {/* Pembagian pemasukan berdasarkan kategori dana. */}
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

      {/* Feed gabungan kontribusi user dan kegiatan masjid. */}
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
                {/* Icon kiri menunjukkan jenis aktivitas. */}
                <ActivityIcon type={aktivitas.type} />
                
                {/* Ringkasan aktivitas: judul, deskripsi, status, dan sumber data. */}
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
                        <StatusBadge status={aktivitas.status} />
                        
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          aktivitas.isPersonal 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-green-600 bg-green-50'
                        }`}>
                          {aktivitas.isPersonal ? (
                            <>
                              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                              Personal
                            </>
                          ) : (
                            <>
                              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Masjid
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 ml-2 shrink-0">
                      {getRelativeTime(aktivitas.timestamp)}
                    </div>
                  </div>
                </div>
                
                {aktivitas.clickable && (
                  <div className="text-gray-400 mt-1">
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
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
            {/* Header modal mengikuti tipe aktivitas yang sedang dipilih. */}
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-3">
                <ActivityIcon type={selectedDetail.type} size="lg" />
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedDetail.type === 'personal_donasi' ? 'Detail Donasi' : 'Detail Kegiatan'}
                </h3>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            
            {/* Body modal dirender oleh helper agar JSX utama tetap pendek. */}
            <div className="p-6">
              {renderDetailContent(selectedDetail)}
            </div>

            {/* Action modal saat ini menutup detail; upload bukti disiapkan untuk donasi pending. */}
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
                    // Placeholder: nanti arahkan ke flow upload bukti transfer untuk donasi pending.
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
