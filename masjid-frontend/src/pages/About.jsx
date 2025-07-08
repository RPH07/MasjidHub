import React from 'react';
import Navbar from '../components/nav';
import Footer from '../components/footer';
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <>
      <Navbar />

      {/* ✅ HERO SECTION */}
      <section className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Tentang <span className="text-yellow-300">Masjid Jami At-Taubah</span>
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Mengenal lebih dekat sejarah, visi misi, dan program-program 
            Masjid Jami At-Taubah dalam melayani umat
          </p>
        </div>
      </section>

      {/* ✅ SEJARAH MASJID */}
      <section className="py-20 px-4 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Sejarah <span className="text-green-600">Pendirian</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Masjid Jami At-Taubah didirikan pada tahun 1985 atas inisiatif tokoh masyarakat 
                  setempat yang dipimpin oleh KH. Ahmad Dahlan (alm) bersama para donatur yang peduli 
                  akan pentingnya sarana ibadah di lingkungan ini.
                </p>
                <p>
                  Awalnya masjid ini hanya berupa bangunan sederhana dengan kapasitas 100 jamaah. 
                  Seiring berjalannya waktu dan bertambahnya jamaah, masjid mengalami beberapa 
                  kali renovasi dan perluasan hingga mencapai kondisi seperti sekarang.
                </p>
                <p>
                  Nama "At-Taubah" dipilih dengan makna bahwa masjid ini menjadi tempat untuk 
                  bertaubat, memperbaiki diri, dan mendekatkan diri kepada Allah SWT.
                </p>
              </div>
              
              <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">🏆 Prestasi & Pengakuan</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Juara 1 Masjid Terbersih Tingkat Kecamatan (2020-2023)</li>
                  <li>• Masjid Percontohan Program Kemandirian Umat (2021)</li>
                  <li>• Sertifikat Halal MUI untuk Kantin Masjid (2022)</li>
                </ul>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1480&auto=format&fit=crop" 
                alt="Sejarah Masjid" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">1985</div>
                <div className="text-sm text-gray-600">Tahun Berdiri</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ VISI MISI */}
      <section className="py-20 px-4 md:px-12 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Visi & <span className="text-green-600">Misi</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* VISI */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-green-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">VISI</h3>
              </div>
              <p className="text-gray-600 text-center leading-relaxed">
                "Menjadi masjid yang unggul dalam pembinaan umat, berperan aktif dalam 
                pemberdayaan masyarakat, dan menjadi pusat kegiatan keislaman yang 
                bermanfaat bagi kemajuan bangsa dan negara."
              </p>
            </div>

            {/* MISI */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-blue-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">MISI</h3>
              </div>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Menyelenggarakan kegiatan ibadah yang berkualitas
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Memberikan pendidikan dan pembinaan keislaman
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Mengembangkan program pemberdayaan ekonomi umat
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Membangun kepedulian sosial dan kemanusiaan
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ STRUKTUR ORGANISASI */}
      <section className="py-20 px-4 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Struktur <span className="text-green-600">Organisasi</span>
            </h2>
            <p className="text-lg text-gray-600">Pengurus Masjid Jami At-Taubah Periode 2023-2028</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Ketua Takmir */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-200">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">👨‍💼</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">H. Bambang Sutrisno</h3>
              <p className="text-green-600 font-medium mb-2">Ketua Takmir</p>
              <p className="text-sm text-gray-600">Periode 2023-2028</p>
            </div>

            {/* Wakil Ketua */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 text-center border border-blue-200">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">👨‍💼</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Drs. Ahmad Fauzi</h3>
              <p className="text-blue-600 font-medium mb-2">Wakil Ketua</p>
              <p className="text-sm text-gray-600">Periode 2023-2028</p>
            </div>

            {/* Sekretaris */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 text-center border border-purple-200">
              <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Siti Aminah, S.Pd</h3>
              <p className="text-purple-600 font-medium mb-2">Sekretaris</p>
              <p className="text-sm text-gray-600">Periode 2023-2028</p>
            </div>

            {/* Bendahara */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 text-center border border-yellow-200">
              <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Hj. Fatimah Zahra</h3>
              <p className="text-yellow-600 font-medium mb-2">Bendahara</p>
              <p className="text-sm text-gray-600">Periode 2023-2028</p>
            </div>

            {/* Imam */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center border border-emerald-200">
              <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🕌</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Ust. Muhammad Ridwan</h3>
              <p className="text-emerald-600 font-medium mb-2">Imam Masjid</p>
              <p className="text-sm text-gray-600">Periode 2023-2028</p>
            </div>

            {/* Khatib */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 text-center border border-rose-200">
              <div className="w-20 h-20 bg-rose-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">📢</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Ust. Abdul Rahman</h3>
              <p className="text-rose-600 font-medium mb-2">Khatib</p>
              <p className="text-sm text-gray-600">Periode 2023-2028</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FASILITAS */}
      <section className="py-20 px-4 md:px-12 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Fasilitas <span className="text-green-600">Masjid</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg border-l-4 border-green-500">
              <div className="text-4xl mb-4">🕌</div>
              <h3 className="font-semibold text-gray-800 mb-2">Ruang Sholat</h3>
              <p className="text-sm text-gray-600">Kapasitas 500 jamaah dengan AC dan sound system</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg border-l-4 border-blue-500">
              <div className="text-4xl mb-4">🚿</div>
              <h3 className="font-semibold text-gray-800 mb-2">Tempat Wudhu</h3>
              <p className="text-sm text-gray-600">Fasilitas wudhu terpisah pria dan wanita</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg border-l-4 border-yellow-500">
              <div className="text-4xl mb-4">🅿️</div>
              <h3 className="font-semibold text-gray-800 mb-2">Area Parkir</h3>
              <p className="text-sm text-gray-600">Parkir luas untuk mobil dan sepeda motor</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg border-l-4 border-purple-500">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-semibold text-gray-800 mb-2">Perpustakaan</h3>
              <p className="text-sm text-gray-600">Koleksi buku agama dan ruang baca</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg border-l-4 border-red-500">
              <div className="text-4xl mb-4">🏫</div>
              <h3 className="font-semibold text-gray-800 mb-2">Ruang TPA</h3>
              <p className="text-sm text-gray-600">Ruang khusus untuk pembelajaran anak-anak</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg border-l-4 border-indigo-500">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="font-semibold text-gray-800 mb-2">Kantin Halal</h3>
              <p className="text-sm text-gray-600">Menyediakan makanan dan minuman halal</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg border-l-4 border-pink-500">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="font-semibold text-gray-800 mb-2">Rumah Imam</h3>
              <p className="text-sm text-gray-600">Tempat tinggal imam dan keluarga</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg border-l-4 border-teal-500">
              <div className="text-4xl mb-4">🔊</div>
              <h3 className="font-semibold text-gray-800 mb-2">Sound System</h3>
              <p className="text-sm text-gray-600">Audio berkualitas untuk seluruh area masjid</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;