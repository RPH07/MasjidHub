import React, { useState } from 'react';
import Navbar from '../components/nav';
import Footer from '../components/footer';
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle, 
  Youtube,
  Map,
  Send
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    subjek: '',
    pesan: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    alert('Pesan Anda telah terkirim! Kami akan segera merespon.');
    setFormData({
      nama: '',
      email: '',
      telepon: '',
      subjek: '',
      pesan: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Navbar />

      {/* ✅ HERO SECTION */}
      <section className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Hubungi <span className="text-yellow-300">Kami</span>
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Silakan hubungi kami untuk informasi lebih lanjut tentang kegiatan masjid, 
            program pendidikan, atau pertanyaan lainnya
          </p>
        </div>
      </section>

      {/* KONTAK INFO & FORM */}
      <section className="py-20 px-4 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* INFORMASI KONTAK */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Informasi <span className="text-green-600">Kontak</span>
              </h2>
              
              <div className="space-y-6">
                {/* ALAMAT */}
                <div className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Alamat</h3>
                    <p className="text-gray-600">
                      Jl. Raya Masjid No. 123<br/>
                      Kelurahan Sukamaju, Kecamatan Bogor Barat<br/>
                      Kota Bogor, Jawa Barat 16115
                    </p>
                  </div>
                </div>

                {/* TELEPON */}
                <div className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Telepon</h3>
                    <p className="text-gray-600">
                      Kantor: (0251) 123-4567<br/>
                      WhatsApp: +62 812-3456-7890
                    </p>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                    <p className="text-gray-600">
                      info@attaubah.org<br/>
                      takmir@attaubah.org
                    </p>
                  </div>
                </div>

                {/* JAM OPERASIONAL */}
                <div className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Jam Operasional</h3>
                    <p className="text-gray-600">
                      Senin - Jumat: 08:00 - 17:00<br/>
                      Sabtu - Minggu: 09:00 - 15:00<br/>
                      <span className="text-green-600 font-medium">Masjid buka 24 jam untuk ibadah</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* MEDIA SOSIAL */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Ikuti Media Sosial Kami</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors group">
                    <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors group">
                    <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full flex items-center justify-center hover:from-pink-600 hover:to-orange-600 transition-colors group">
                    <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors group">
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors group">
                    <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* FORM KONTAK */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Kirim <span className="text-green-600">Pesan</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      name="telepon"
                      value={formData.telepon}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="nama@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjek *
                  </label>
                  <select
                    name="subjek"
                    value={formData.subjek}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Pilih subjek pesan</option>
                    <option value="informasi-umum">Informasi Umum</option>
                    <option value="kegiatan-masjid">Kegiatan Masjid</option>
                    <option value="program-pendidikan">Program Pendidikan</option>
                    <option value="donasi-zakat">Donasi & Zakat</option>
                    <option value="fasilitas">Fasilitas Masjid</option>
                    <option value="saran-kritik">Saran & Kritik</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan *
                  </label>
                  <textarea
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Tulis pesan Anda di sini..."
                  ></textarea>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Kirim Pesan
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  * Kolom wajib diisi. Kami akan merespon dalam 1x24 jam.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* HERO SECTION */}
<section className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20">
  <div className="max-w-6xl mx-auto px-4 text-center">
    <h1 className="text-5xl md:text-6xl font-bold mb-6">
      Hubungi <span className="text-yellow-300">Kami</span>
    </h1>
    <p className="text-xl text-green-100 max-w-3xl mx-auto">
      Silakan hubungi kami untuk informasi lebih lanjut tentang kegiatan masjid, 
      program pendidikan, atau pertanyaan lainnya
    </p>
  </div>
</section>

{/* ALAMAT */}
<div className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md">
  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
    <MapPin className="w-6 h-6 text-green-600" />
  </div>
  <div>
    <h3 className="font-semibold text-gray-800 mb-1">Alamat</h3>
    <p className="text-gray-600">
      Perumahan Talaga Bestari<br/>
      Kabupaten Tangerang, Banten<br/>
      Indonesia
    </p>
  </div>
</div>

{/* TELEPON */}
<div className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md">
  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
    <Phone className="w-6 h-6 text-blue-600" />
  </div>
  <div>
    <h3 className="font-semibold text-gray-800 mb-1">Telepon</h3>
    <p className="text-gray-600">
      Kantor: (021) 123-4567<br/>
      WhatsApp: +62 812-3456-7890
    </p>
  </div>
</div>

{/* EMAIL */}
<div className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md">
  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
    <Mail className="w-6 h-6 text-purple-600" />
  </div>
  <div>
    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
    <p className="text-gray-600">
      info@nurulilmi.org<br/>
      takmir@nurulilmi.org
    </p>
  </div>
</div>

{/* PETA LOKASI*/}
<section className="py-20 px-4 md:px-12 bg-white">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        Lokasi <span className="text-green-600">Masjid</span>
      </h2>
      <p className="text-lg text-gray-600">Temukan kami di Google Maps</p>
    </div>
    
    {/* ✅ GOOGLE MAPS EMBED - Responsive */}
    <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1618.5399042088643!2d106.4996463929521!3d-6.191246305605924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4200f7581fff27%3A0x629723ba39fcbcf1!2sMasjid%20Nurul%20Ilmi!5e0!3m2!1sid!2sid!4v1751620823720!5m2!1sid!2sid"
        width="100%" 
        height="100%" 
        style={{ border: 0 }}
        allowFullScreen="" 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Lokasi Masjid Jami At-Taubah"
        className="absolute inset-0"
      />
    </div>

    {/* ✅ INFO TAMBAHAN DIBAWAH MAPS */}
    <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Masjid Jami At-Taubah
          </h3>
          <p className="text-gray-600 text-sm">
            Jl. Raya Masjid No. 123, Sukamaju, Bogor Barat, Kota Bogor
          </p>
        </div>
        
        <div className="flex gap-3">
          <a 
            href="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1618.5399042088643!2d106.4996463929521!3d-6.191246305605924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4200f7581fff27%3A0x629723ba39fcbcf1!2sMasjid%20Nurul%20Ilmi!5e0!3m2!1sid!2sid!4v1751620823720!5m2!1sid!2sid"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            Buka di Maps
          </a>
          
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Lokasi Masjid Jami At-Taubah',
                  text: 'Lokasi Masjid Jami At-Taubah',
                  url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1618.5399042088643!2d106.4996463929521!3d-6.191246305605924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4200f7581fff27%3A0x629723ba39fcbcf1!2sMasjid%20Nurul%20Ilmi!5e0!3m2!1sid!2sid!4v1751620823720!5m2!1sid!2sid'
                });
              } else {
                navigator.clipboard.writeText('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1618.5399042088643!2d106.4996463929521!3d-6.191246305605924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4200f7581fff27%3A0x629723ba39fcbcf1!2sMasjid%20Nurul%20Ilmi!5e0!3m2!1sid!2sid!4v1751620823720!5m2!1sid!2sid');
                alert('Link lokasi telah disalin!');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Bagikan
          </button>
        </div>
      </div>
    </div>

    {/* ✅ PETUNJUK AKSES */}
    <div className="mt-8 grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🚗</span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">Kendaraan Pribadi</h3>
        <p className="text-gray-600 text-sm">
          Dari Jakarta: Tol Jagorawi keluar Bogor → Jl. Raya Bogor → Ikuti GPS
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🚌</span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">Transportasi Umum</h3>
        <p className="text-gray-600 text-sm">
          KRL Commuter Line ke Stasiun Bogor → Angkot 03 jurusan Sukamaju
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🏍️</span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">Ojek Online</h3>
        <p className="text-gray-600 text-sm">
          Tersedia Gojek, Grab. Cari lokasi: "Masjid Jami At-Taubah"
        </p>
      </div>
    </div>
  </div>
</section>

      <Footer />
    </>
  );
};

export default Contact;