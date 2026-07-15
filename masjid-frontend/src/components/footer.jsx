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
  Home,
  Info,
  PhoneCall,
  Coins,
  Gift,
  Users,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  Sparkles,
  Compass,
  ArrowUp,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainLinks = [
    { to: '/', label: 'Beranda', icon: Home },
    { to: '/about', label: 'Tentang Kami', icon: Info },
    { to: '/contact', label: 'Kontak', icon: PhoneCall },
    { to: '/zakat', label: 'Zakat', icon: Coins },
    { to: '/crowdfunding', label: 'Donasi', icon: Gift },
  ];

  const services = [
    { label: 'Sholat Berjamaah', icon: Sparkles },
    { label: 'Pendidikan TPA', icon: BookOpen },
    { label: 'Kajian Rutin', icon: GraduationCap },
    { label: 'Program Sosial', icon: HeartHandshake },
    { label: 'Akad Nikah', icon: Users },
    { label: 'Konsultasi Agama', icon: Compass },
  ];

  const socials = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="bg-[#0B1410] text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">

          {/* TENTANG */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-stone-50 tracking-tight mb-3">
              Masjid Nurul Ilmi
            </h3>
            <p className="text-sm leading-relaxed text-stone-400">
              Pusat ibadah, pendidikan, dan kegiatan sosial umat Islam di
              Perumahan Talaga Bestari sejak tahun 1985. Melayani dengan amanah
              dan transparansi.
            </p>

            <div className="flex gap-3 mt-6">
              {socials.map((social) => {
                const SocialIcon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:text-emerald-400 hover:border-emerald-400 transition-colors"
                  >
                    <SocialIcon className="w-4 h-4" strokeWidth={1.75} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* MENU UTAMA */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-5">
              Menu Utama
            </h4>
            <ul className="space-y-3">
              {mainLinks.map((link) => {
                const LinkIcon = link.icon;

                return (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-2.5 text-sm text-stone-300 hover:text-emerald-400 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 text-stone-500" strokeWidth={1.75} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* LAYANAN */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-5">
              Layanan
            </h4>
            <ul className="space-y-3">
              {services.map((service) => {
                const ServiceIcon = service.icon;

                return (
                  <li key={service.label} className="flex items-center gap-2.5 text-sm text-stone-300">
                    <ServiceIcon className="w-4 h-4 text-stone-500" strokeWidth={1.75} />
                    {service.label}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* KONTAK */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-5">
              Hubungi Kami
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" strokeWidth={1.75} />
                <p className="text-stone-300 leading-relaxed">
                  Perumahan Talaga Bestari<br />
                  Kabupaten Tangerang, Banten
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-stone-500 shrink-0" strokeWidth={1.75} />
                <p className="text-stone-300">+62 812-3456-7890</p>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-stone-500 shrink-0" strokeWidth={1.75} />
                <p className="text-stone-300">info@masjidnurulilmi.my.id</p>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-stone-300">Kantor: 08:00 - 17:00</p>
                  <p className="text-emerald-400">Masjid: 24 Jam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-500">
            © {currentYear} Masjid Nurul Ilmi. Seluruh hak cipta dilindungi.
          </p>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-stone-500 hover:text-emerald-400 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link to="/terms" className="text-xs text-stone-500 hover:text-emerald-400 transition-colors">
              Syarat & Ketentuan
            </Link>
            <button
              onClick={scrollToTop}
              aria-label="Kembali ke atas"
              className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:text-emerald-400 hover:border-emerald-400 transition-colors"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
