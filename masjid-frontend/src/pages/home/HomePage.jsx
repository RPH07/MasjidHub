import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/navigation/Navbar';
import JadwalSholat from './components/JadwalSholat';
import Footer from '@/components/navigation/Footer';
import { Button } from "@/components/ui/button";
import api from '@/config/api';
import { formatRupiahCompactMillions } from '@/utils/formatters';

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

  const navigate = useNavigate();
  const getImageUrl = (foto) => {
    if (!foto) return '';

    if (foto.startsWith('http')) return foto
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}/uploads/${foto}`;
  }

  const isLoggedIn = () => {
    return localStorage.getItem('accessToken') !== null;
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
      // Jika sudah login, ke dashboard donasi
      navigate('/dashboard/donation-programs');
    } else {
      // Jika belum login, ke donasi publik
      navigate('/donation-programs');
    }
  };

  // HANDLE ZAKAT ROUTING
  const handleZakatClick = () => {
    navigate('/zakat');
  };

useEffect(() => {
  const fetchKegiatan = async () => {
    try {
      const res = await api.get('/kegiatan');
      console.log('Response data:', res.data);
      
      // Validasi apakah res.data adalah array
      if (Array.isArray(res.data)) {
        const sortedKegiatan = res.data.sort((a, b) => {
          return new Date(b.tanggal) - new Date(a.tanggal);
        });
        setKegiatan(sortedKegiatan);
      } else if (res.data && Array.isArray(res.data.data)) {
        // Jika data ada di dalam property 'data'
        const sortedKegiatan = res.data.data.sort((a, b) => {
          return new Date(b.tanggal) - new Date(a.tanggal);
        });
        setKegiatan(sortedKegiatan);
      } else {
        console.warn('Data kegiatan tidak dalam format array:', res.data);
        setKegiatan([]); // Set empty array jika bukan array
      }
    } catch (err) {
      console.error('Gagal mengambil data kegiatan:', err);
      setKegiatan([]); // Set empty array saat error
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch basic stats - sesuaikan dengan API yang ada
      setStats({
        totalDonasi: 25000000,
        totalZakat: 15000000,
        totalKegiatan: kegiatan.length,
        totalJamaah: 350
      });
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  fetchKegiatan();
  fetchStats();
}, [kegiatan.length]);

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
        {/* Solid dark overlay — bukan gradient */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 42, 26, 0.82)' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Eyebrow label */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="block w-8 h-px bg-amber-400"></span>
              <span className="text-xs font-medium tracking-widest uppercase text-amber-400">Masjid Nurul Ilmi</span>
              <span className="block w-8 h-px bg-amber-400"></span>
            </div>

            <h1 className="text-5xl md:text-6xl font-semibold mb-5 leading-tight tracking-tight">
              Pusat Ibadah &{' '}
              <span className="text-amber-400">Kegiatan Sosial</span>
            </h1>
            <p className="text-base md:text-lg mb-10 leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Melayani umat sejak 1985 dengan transparansi dan amanah.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
              <Button 
                onClick={() => scrollToSection('jadwal-sholat')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-7 py-3 text-sm rounded-md transition-colors duration-200"
              >
                Jadwal Sholat
              </Button>
              <Button 
                variant="outline" 
                className="border border-white/30 text-white bg-transparent hover:bg-white/10 font-medium px-7 py-3 text-sm rounded-md transition-colors duration-200"
                onClick={() => scrollToSection('kegiatan')}
              >
                Lihat Kegiatan
              </Button>
            </div>

            {/* Stats — flat, no backdrop-blur */}
            <div className="grid grid-cols-2 md:grid-cols-4 border border-white/10 rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-r border-white/10">
                <div className="text-2xl font-semibold text-amber-400 mb-1">{stats.totalJamaah}+</div>
                <div className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Jamaah Aktif</div>
              </div>
              <div className="px-6 py-5 border-r border-white/10">
                <div className="text-2xl font-semibold text-amber-400 mb-1">{stats.totalKegiatan}+</div>
                <div className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Program Rutin</div>
              </div>
              <div className="px-6 py-5 border-r border-white/10">
                <div className="text-2xl font-semibold text-amber-400 mb-1">{formatRupiahCompactMillions(stats.totalZakat)}M+</div>
                <div className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Zakat Terkumpul</div>
              </div>
              <div className="px-6 py-5">
                <div className="text-2xl font-semibold text-amber-400 mb-1">{formatRupiahCompactMillions(stats.totalDonasi)}M+</div>
                <div className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Donasi Masuk</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG MASJID */}
      <section className="py-20 px-4 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1512970648279-ff3398568f77?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Masjid" 
                className="rounded-lg w-full h-96 object-cover"
              />
              {/* Badge tahun berdiri — solid, bukan shadow-lg */}
              <div className="absolute -bottom-5 -right-5 text-white px-5 py-4 rounded-lg" style={{ backgroundColor: '#1a4731' }}>
                <div className="text-xl font-semibold">38+</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Tahun Berdiri</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: '#1a4731' }}>Tentang Kami</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5 leading-tight">
                  Masjid Nurul Ilmi
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Masjid Jami At-Taubah telah berdiri sejak tahun 1985 dan menjadi pusat 
                  ibadah serta kegiatan keislaman bagi masyarakat sekitar. Dengan fasilitas 
                  lengkap dan program-program yang bermanfaat untuk umat.
                </p>
              </div>

              {/* Feature cards — border konsisten semua pakai hijau tua, tanpa shadow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-5 rounded-lg border-l-2" style={{ borderColor: '#1a4731' }}>
                  <h3 className="font-medium text-gray-800 text-sm mb-1">Fasilitas Lengkap</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">Ruang sholat yang nyaman, tempat wudhu, dan area parkir yang luas</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-2" style={{ borderColor: '#1a4731' }}>
                  <h3 className="font-medium text-gray-800 text-sm mb-1">Program Pendidikan</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">TPA, kajian rutin, dan pendidikan Islam untuk segala usia</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-2" style={{ borderColor: '#c9922a' }}>
                  <h3 className="font-medium text-gray-800 text-sm mb-1">Kegiatan Sosial</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">Program bantuan, santunan, dan kegiatan kemasyarakatan</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-2" style={{ borderColor: '#c9922a' }}>
                  <h3 className="font-medium text-gray-800 text-sm mb-1">Pengelolaan Amanah</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">Transparansi dalam pengelolaan zakat, infaq, dan donasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JADWAL SHOLAT */}
      <section id="jadwal-sholat" className="py-20 px-4 md:px-12 bg-[#f3efe4] scroll-mt-20">
        <JadwalSholat />
      </section>

      {/* KEGIATAN MASJID */}
      <section id="kegiatan" className="py-20 px-4 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: '#1a4731' }}>Program & Kegiatan</p>
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">
              Kegiatan Masjid
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Berbagai program dan kegiatan yang diselenggarakan untuk kemajuan umat
            </p>
          </div>

          {kegiatan.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kegiatan.slice(0, 6).map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors duration-200">
                  {item.image_url ? (
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.judul}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    // Fallback: solid bg
                    <div className="w-full h-44 flex items-center justify-center" style={{ backgroundColor: '#f0f5f1' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a4731" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 line-clamp-2">
                      {item.nama_kegiatan}
                    </h3>
                    <div className="flex items-center text-xs text-gray-400 mb-3 gap-3">
                      <span>{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                      <span>{item.lokasi}</span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed">{item.deskripsi}</p>
                    <Button 
                      className="w-full text-sm font-medium py-2 px-4 rounded border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => handleDetailKegiatan(item)}
                    >
                      Selengkapnya
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Belum Ada Kegiatan</h3>
              <p className="text-xs text-gray-400">Kegiatan akan segera diumumkan</p>
            </div>
          )}

          {kegiatan.length > 6 && (
            <div className="text-center mt-10">
              <Button className="text-sm font-medium px-6 py-2.5 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                Lihat Semua Kegiatan
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 px-4 text-white" style={{ backgroundColor: '#1a4731' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'rgba(201,146,42,0.8)' }}>Kontribusi</p>
              <h2 className="text-3xl font-semibold mb-4 leading-tight">
                Dukung Kegiatan Masjid
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Bantu operasional masjid dan program sosial kami melalui donasi, zakat, dan infaq. 
                Setiap kontribusi dikelola dengan amanah dan transparan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleZakatClick}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2.5 text-sm rounded-md transition-colors duration-200 border-0">
                  Bayar Zakat
                </Button>
                <Button 
                  onClick={handleDonasiClick}
                  className="font-medium px-6 py-2.5 text-sm rounded-md transition-colors duration-200 border border-white/20 bg-transparent text-white hover:bg-white/10">
                  Donasi Program
                </Button>
              </div>
              {!isLoggedIn() && (
                <p className="text-xs mt-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Daftar akun untuk melacak riwayat donasi dan mendapat notifikasi program baru.{' '}
                  <Link to="/signup" className="underline" style={{ color: 'rgba(201,146,42,0.9)' }}>Daftar gratis</Link>
                  {' '}atau{' '}
                  <Link to="/login" className="underline" style={{ color: 'rgba(201,146,42,0.9)' }}>masuk</Link>.
                </p>
              )}
            </div>

            {/* Right: channel cards */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-4 p-5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(201,146,42,0.15)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9922a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-0.5">Zakat</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Tunaikan zakat Anda dengan mudah dan aman</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(201,146,42,0.15)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9922a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-0.5">Donasi</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {isLoggedIn() ? 'Akses dashboard untuk tracking donasi.' : 'Daftar untuk tracking donasi.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DETAIL KEGIATAN */}
      {showDetailModal && selectedKegiatan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Detail Kegiatan</h3>
              <Button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Tutup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </Button>
            </div>
            
            <div className="p-6">
              {selectedKegiatan.image_url ? (
                <img
                  src={getImageUrl(selectedKegiatan.image_url)}
                  alt={selectedKegiatan.nama_kegiatan}
                  className="w-full h-56 object-cover rounded-lg mb-5"
                />
              ) : (
                <div className="w-full h-56 flex items-center justify-center rounded-lg mb-5" style={{ backgroundColor: '#f0f5f1' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a4731" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
              )}

              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedKegiatan.nama_kegiatan}
              </h2>
              
              <div className="flex flex-wrap gap-4 mb-5 text-sm text-gray-500">
                <span>
                  {new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
                <span>{selectedKegiatan.lokasi}</span>
                {selectedKegiatan.kategori && <span>
                  {typeof selectedKegiatan.kategori === 'object' 
                    ? selectedKegiatan.kategori.nama_kategori
                    : selectedKegiatan.kategori}
                  </span>}
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                  {selectedKegiatan.deskripsi}
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="outline"
                  onClick={handleCloseModal}
                  className="px-5 py-2 text-sm"
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
