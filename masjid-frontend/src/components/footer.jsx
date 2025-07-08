import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  MessageCircle,
  Heart,
  ArrowUp
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white relative">
      {/* ✅ MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          
          {/* ✅ TENTANG MASJID */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-green-400 mb-3">
                🕌 Masjid Nurul Ilmi
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">
                Pusat ibadah, pendidikan, dan kegiatan sosial umat Islam di 
                Perumahan Talaga Bestari sejak tahun 1985. Melayani dengan amanah 
                dan transparansi.
              </p>
            </div>
            
            {/* SOCIAL MEDIA */}
            <div>
              <h4 className="font-semibold mb-3 text-green-400">Ikuti Kami</h4>
              <div className="flex space-x-3">
                <a href="#" className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors group">
                  <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="w-9 h-9 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors group">
                  <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="w-9 h-9 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 rounded-full flex items-center justify-center transition-colors group">
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors group">
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="w-9 h-9 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors group">
                  <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* ✅ QUICK LINKS */}
          <div>
            <h4 className="font-semibold mb-6 text-green-400">Menu Utama</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-green-400 transition-colors flex items-center text-sm">
                  🏠 Beranda
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-green-400 transition-colors flex items-center text-sm">
                  ℹ️ Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-green-400 transition-colors flex items-center text-sm">
                  📞 Kontak
                </Link>
              </li>
              <li>
                <Link to="/zakat" className="text-gray-300 hover:text-green-400 transition-colors flex items-center text-sm">
                  💰 Zakat
                </Link>
              </li>
              <li>
                <Link to="/crowdfunding" className="text-gray-300 hover:text-green-400 transition-colors flex items-center text-sm">
                  🎁 Donasi
                </Link>
              </li>
            </ul>
          </div>

          {/* ✅ LAYANAN */}
          <div>
            <h4 className="font-semibold mb-6 text-green-400">Layanan</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-300 text-sm flex items-center">
                  🕌 Sholat Berjamaah
                </span>
              </li>
              <li>
                <span className="text-gray-300 text-sm flex items-center">
                  📚 Pendidikan TPA
                </span>
              </li>
              <li>
                <span className="text-gray-300 text-sm flex items-center">
                  🎓 Kajian Rutin
                </span>
              </li>
              <li>
                <span className="text-gray-300 text-sm flex items-center">
                  🤝 Program Sosial
                </span>
              </li>
              <li>
                <span className="text-gray-300 text-sm flex items-center">
                  💒 Akad Nikah
                </span>
              </li>
              <li>
                <span className="text-gray-300 text-sm flex items-center">
                  🎯 Konsultasi Agama
                </span>
              </li>
            </ul>
          </div>

          {/* ✅ KONTAK INFO */}
          <div>
            <h4 className="font-semibold mb-6 text-green-400">Hubungi Kami</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Perumahan Talaga Bestari<br/>
                    Kabupaten Tangerang, Banten<br/>
                    Indonesia
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">(021) 123-4567</p>
                  <p className="text-gray-300 text-sm">+62 812-3456-7890</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">info@nurulilmi.org</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">Kantor: 08:00 - 17:00</p>
                  <p className="text-green-400 text-sm font-medium">Masjid: 24 Jam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ DIVIDER */}
      <div className="border-t border-gray-700"></div>

      {/* ✅ BOTTOM FOOTER */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Masjid Nurul Ilmi. Dibuat dengan{' '}
              <Heart className="w-4 h-4 inline text-red-500" fill="currentColor" />{' '}
              untuk umat.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
              Kebijakan Privasi
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
              Syarat & Ketentuan
            </Link>
            <button 
              onClick={scrollToTop}
              className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors group"
              title="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ DECORATION */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
    </footer>
  );
};

export default Footer;