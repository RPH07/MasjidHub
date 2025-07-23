import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/nav';
import JadwalSholat from '../components/JadwalSholat';
import Footer from '../components/footer';
import { Button } from "@/components/ui/button";
import apiService from '../services/apiServices'; 
import { API_ENDPOINTS } from '../config/api.config';

const HomePage = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [stats, setStats] = useState({
    totalDonasi: 0,
    totalZakat: 0,
    totalKegiatan: 0,
    totalJamaah: 0
  });

  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };

    const handleDetailKegiatan = (kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedKegiatan(null);
  };

  //  HANDLE DONASI ROUTING
  const handleDonasiClick = () => {
    if (isLoggedIn()) {
      // Jika sudah login, ke dashboard crowdfunding
      navigate('/dashboard/crowdfunding');
    } else {
      // Jika belum login, ke public crowdfunding
      navigate('/crowdfunding');
    }
  };

  // HANDLE ZAKAT ROUTING
  const handleZakatClick = () => {
    navigate('/zakat');
  };

useEffect(() => {
    fetchKegiatan();
    fetchStats();
  }, []);

  const fetchKegiatan = async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.KEGIATAN.BASE);
      
      const kegiatanData = response.data?.data || response.data || [];
      
      // Ambil 6 kegiatan terbaru untuk homepage
      const recentKegiatan = Array.isArray(kegiatanData) 
        ? kegiatanData.slice(0, 6)
        : [];
      
      setKegiatan(recentKegiatan);
    } catch (error) {
      console.error('❌ Error fetching kegiatan:', error);
      setKegiatan([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [kasRes, kegiatanRes] = await Promise.all([
        apiService.get(API_ENDPOINTS.KAS.SUMMARY),
        apiService.get(API_ENDPOINTS.KEGIATAN.BASE)
      ]);

      const kasData = kasRes.data?.data || {};
      const kegiatanData = kegiatanRes.data?.data || kegiatanRes.data || [];
      
      setStats({
        totalDonasi: kasData.pemasukanKategori?.donasi || 0,
        totalZakat: kasData.pemasukanKategori?.zakat || 0,
        totalKegiatan: Array.isArray(kegiatanData) ? kegiatanData.length : 0,
        totalJamaah: 150 // Static untuk sekarang
      });

    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="relative bg-cover bg-center text-white py-32 min-h-screen flex items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1590092794015-bce5431c83f4?q=80&w=1411&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-emerald-800/70 to-teal-900/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Masjid
              <span className="block text-yellow-300">Nurul Ilmi</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 leading-relaxed">
              Pusat Ibadah, Pendidikan, dan Kegiatan Sosial Umat Islam
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={() => scrollToSection('jadwal-sholat')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🕌 Jadwal Sholat
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-yellow-300 text-yellow-300 bg-black/20 hover:bg-yellow-300 hover:text-black font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 backdrop-blur-sm"
                onClick={() => scrollToSection('kegiatan')}
              >
                📅 Lihat Kegiatan
              </Button>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-yellow-300">{stats.totalJamaah}+</div>
                <div className="text-green-100">Jamaah Aktif</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-yellow-300">{stats.totalKegiatan}+</div>
                <div className="text-green-100">Kegiatan</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl md:text-xl font-bold text-yellow-300">{formatCurrency(stats.totalZakat).replace(/\D/g, '').slice(0, -6)}M+</div>
                <div className="text-green-100">Zakat Terkumpul</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl md:text-xl font-bold text-yellow-300">{formatCurrency(stats.totalDonasi).replace(/\D/g, '').slice(0, -6)}M+</div>
                <div className="text-green-100">Donasi Terhimpun</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* TENTANG MASJID */}
      <section className="py-20 px-4 md:px-12 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1512970648279-ff3398568f77?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Masjid" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold">38+</div>
                <div className="text-sm">Tahun Berdiri</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  Tentang <span className="text-green-600">Masjid</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Masjid Jami At-Taubah telah berdiri sejak tahun 1985 dan menjadi pusat 
                  ibadah serta kegiatan keislaman bagi masyarakat sekitar. Dengan fasilitas 
                  lengkap dan program-program yang bermanfaat untuk umat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                  <h3 className="font-semibold text-gray-800 mb-2">🕌 Fasilitas Lengkap</h3>
                  <p className="text-gray-600 text-sm">Ruang sholat yang nyaman, tempat wudhu, dan area parkir yang luas</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                  <h3 className="font-semibold text-gray-800 mb-2">📚 Program Pendidikan</h3>
                  <p className="text-gray-600 text-sm">TPA, kajian rutin, dan pendidikan Islam untuk segala usia</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-gray-800 mb-2">🤝 Kegiatan Sosial</h3>
                  <p className="text-gray-600 text-sm">Program bantuan, santunan, dan kegiatan kemasyarakatan</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                  <h3 className="font-semibold text-gray-800 mb-2">💰 Pengelolaan Amanah</h3>
                  <p className="text-gray-600 text-sm">Transparansi dalam pengelolaan zakat, infaq, dan donasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JADWAL SHOLAT */}
      <section id="jadwal-sholat" className="py-20 px-4 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Jadwal <span className="text-green-600">Sholat</span>
            </h2>
            <p className="text-lg text-gray-600">Jadwal sholat untuk hari ini</p>
          </div>
          <JadwalSholat />
        </div>
      </section>

      {/* KEGIATAN MASJID */}
      <section id="kegiatan" className="py-20 px-4 md:px-12 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Kegiatan <span className="text-green-600">Masjid</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Berbagai program dan kegiatan yang diselenggarakan untuk kemajuan umat
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Memuat kegiatan...</p>
            </div>
          ) : kegiatan.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {kegiatan.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleDetailKegiatan(item)}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {item.foto ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.foto}`}
                        alt={item.nama_kegiatan}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <span className="text-white text-4xl">🕌</span>
                      </div>
                    )}
                    {/* Badge */}
                    {item.kategori_nama && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-green-600 text-white px-2 py-1 text-xs rounded-full font-medium">
                          {item.kategori_nama}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {item.nama_kegiatan}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{item.lokasi}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.deskripsi}
                    </p>

                    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Belum ada kegiatan yang tersedia
            </div>
          )}

          {/* View All Button */}
          {kegiatan.length > 0 && (
            <div className="text-center mt-12">
              <Button
                onClick={() => navigate('/dashboard/kegiatan')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                Lihat Semua Kegiatan
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CALL TO ACTION - Modern Design */}
      <section className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Dukung Kegiatan <span className="text-yellow-300">Masjid</span>
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-3xl mx-auto">
            Bantu operasional masjid dan program sosial kami melalui donasi, zakat, dan infaq Anda. 
            Setiap kontribusi akan dikelola dengan amanah dan transparan.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🕌</div>
              <h3 className="text-xl font-semibold mb-2">Zakat</h3>
              <p className="text-green-100 text-sm">Tunaikan zakat Anda dengan mudah dan aman</p>
            </div>
            {/* <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">Infaq</h3>
              <p className="text-green-100 text-sm">Salurkan infaq untuk operasional masjid</p>
            </div> */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-xl font-semibold mb-2">Donasi</h3>
              <p className="text-green-100 text-sm">Donasi untuk program sosial dan pengadaan
              {isLoggedIn() ? ' Akses dashboard untuk tracking donasi.' : ' Daftar untuk tracking donasi.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
            <Button 
            onClick={handleZakatClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
              💰 Bayar Zakat
            </Button>
            <Button 
              onClick={handleDonasiClick}
              className="bg-white/20 border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              🎁 Donasi Program
            </Button>
          </div>
          {!isLoggedIn() && (
            <div className="mt-8 bg-yellow-400/20 border border-yellow-300/30 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-yellow-100 text-sm">
                💡 <strong>Tips:</strong> Daftar akun untuk melacak riwayat donasi, mendapat notifikasi program baru, 
                dan akses fitur dashboard lengkap!
              </p>
              <div className="flex gap-2 justify-center mt-3">
                <Link to="/signup">
                  <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black">
                    Daftar Gratis
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black">
                    Masuk
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODAL DETAIL KEGIATAN */}
      {showDetailModal && selectedKegiatan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Detail Kegiatan</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            {/* Content Modal */}
            <div className="p-6">
              {/* Foto Kegiatan */}
              {selectedKegiatan.foto ? (
                <img
                  src={`http://localhost:5000/uploads/${selectedKegiatan.foto}`}
                  alt={selectedKegiatan.nama_kegiatan}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center rounded-lg mb-4">
                  <span className="text-white text-6xl">🕌</span>
                </div>
              )}

              {/* Info Kegiatan */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedKegiatan.nama_kegiatan}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📅</span>
                  <span>
                    <strong>Tanggal:</strong> {new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📍</span>
                  <span><strong>Lokasi:</strong> {selectedKegiatan.lokasi}</span>
                </div>
                {selectedKegiatan.kategori && (
                  <div className="flex items-center text-gray-600 md:col-span-2">
                    <span className="mr-2">🏷️</span>
                    <span><strong>Kategori:</strong> {selectedKegiatan.kategori}</span>
                  </div>
                )}
              </div>

              {/* Deskripsi Lengkap */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Deskripsi:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedKegiatan.deskripsi}
                  </p>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={handleCloseModal}
                  className="px-6 py-2"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default HomePage;