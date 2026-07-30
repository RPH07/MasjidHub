import React, { useState } from 'react';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';
import { Button } from "@/components/ui/button";
import { FloatingInput } from '@/components/form';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Map,
  Send,
  Car,
  Bus,
  Bike
} from 'lucide-react';

const BRAND_ICON_PATHS = {
  facebook:
    'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 1.803-.287 1.364h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  twitter:
    'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
};

const BrandIcon = ({ name, className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d={BRAND_ICON_PATHS[name]} />
  </svg>
);

const INK = '#1c2620';
const INK_SOFT = '#5c6b5f';
const PAPER = '#f3efe4';
const GREEN = '#1f4d3a';
const GREEN_SOFT = '#e8ede8';

const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1618.5399042088643!2d106.4996463929521!3d-6.191246305605924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4200f7581fff27%3A0x629723ba39fcbcf1!2sMasjid%20Nurul%20Ilmi!5e0!3m2!1sid!2sid!4v1751620823720!5m2!1sid!2sid';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Alamat',
    lines: ['Perumahan Talaga Bestari', 'Kabupaten Tangerang, Banten', 'Indonesia']
  },
  {
    icon: Phone,
    label: 'Telepon',
    lines: ['Kantor: (021) 123-4567', 'WhatsApp: +62 812-3456-7890']
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['info@nurulilmi.org', 'takmir@nurulilmi.org']
  },
  {
    icon: Clock,
    label: 'Jam Operasional',
    lines: ['Senin - Jumat: 08:00 - 17:00', 'Sabtu - Minggu: 09:00 - 15:00', 'Masjid buka 24 jam untuk ibadah']
  }
];

const socialLinks = [
  { brand: 'facebook', href: '#', label: 'Facebook' },
  { brand: 'twitter', href: '#', label: 'Twitter' },
  { brand: 'instagram', href: '#', label: 'Instagram' },
  { icon: MessageCircle, href: '#', label: 'WhatsApp' },
  { brand: 'youtube', href: '#', label: 'Youtube' }
];

const accessInfo = [
  {
    icon: Car,
    title: 'Kendaraan Pribadi',
    desc: 'Dari Jakarta: Tol Jagorawi keluar Bogor → Jl. Raya Bogor → Ikuti GPS'
  },
  {
    icon: Bus,
    title: 'Transportasi Umum',
    desc: 'KRL Commuter Line ke Stasiun Bogor → Angkot 03 jurusan Sukamaju'
  },
  {
    icon: Bike,
    title: 'Ojek Online',
    desc: 'Tersedia Gojek, Grab. Cari lokasi: "Masjid Jami At-Taubah"'
  }
];

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Lokasi Masjid Jami At-Taubah',
        text: 'Lokasi Masjid Jami At-Taubah',
        url: MAPS_EMBED_URL
      });
    } else {
      navigator.clipboard.writeText(MAPS_EMBED_URL);
      alert('Link lokasi telah disalin!');
    }
  };

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section style={{ backgroundColor: GREEN }} className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ color: GREEN_SOFT }} className="text-[11px] tracking-[0.14em] font-medium mb-3">
            KONTAK
          </p>
          <h1 style={{ color: PAPER }} className="text-4xl md:text-5xl font-semibold mb-4">
            Hubungi kami
          </h1>
          <p style={{ color: GREEN_SOFT }} className="text-base max-w-2xl mx-auto">
            Silakan hubungi kami untuk informasi lebih lanjut tentang kegiatan masjid,
            program pendidikan, atau pertanyaan lainnya.
          </p>
        </div>
      </section>

      {/* KONTAK INFO & FORM */}
      <section style={{ backgroundColor: PAPER }} className="py-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* INFORMASI KONTAK */}
            <div>
              <h2 style={{ color: INK }} className="text-2xl font-semibold mb-8">
                Informasi kontak
              </h2>

              <div className="space-y-4">
                {contactInfo.map(({ icon: Icon, label, lines }) => (
                  <div
                    key={label}
                    style={{ borderColor: INK }}
                    className="flex items-start space-x-4 bg-transparent border p-5"
                  >
                    <div style={{ backgroundColor: GREEN }} className="w-11 h-11 flex items-center justify-center shrink-0">
                      {React.createElement(Icon, { style: { color: PAPER }, className: 'w-5 h-5' })}
                    </div>
                    <div>
                      <h3 style={{ color: INK }} className="font-medium mb-1">{label}</h3>
                      <p style={{ color: INK_SOFT }} className="text-sm leading-relaxed">
                        {lines.map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < lines.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* MEDIA SOSIAL */}
              <div className="mt-8">
                <h3 style={{ color: INK }} className="text-base font-medium mb-4">Ikuti media sosial kami</h3>
                <div className="flex space-x-3">
                  {socialLinks.map(({ icon: Icon, brand, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      style={{ borderColor: INK, color: INK }}
                      className="w-10 h-10 border flex items-center justify-center hover:text-(--paper) transition-colors duration-200"
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.color = PAPER; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = INK; }}
                    >
                      {brand ? <BrandIcon name={brand} className="w-4 h-4" /> : React.createElement(Icon, {className: 'w-4 h-4'})}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* FORM KONTAK */}
            <div style={{ borderColor: INK, backgroundColor: PAPER }} className="border p-8">
              <h2 style={{ color: INK }} className="text-2xl font-semibold mb-6">
                Kirim pesan
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <FloatingInput
                    label="Nama Lengkap"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                    style={{ borderColor: INK }}
                    labelBgClass="bg-[#F5F0E8]"
                    inputClassName="bg-transparent text-sm focus:ring-1"
                  />
                  <FloatingInput
                    label="No. Telepon"
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    style={{ borderColor: INK }}
                    labelBgClass="bg-[#F5F0E8]"
                    inputClassName="bg-transparent text-sm focus:ring-1"
                  />
                </div>

                <FloatingInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ borderColor: INK }}
                  labelBgClass="bg-[#F5F0E8]"
                  inputClassName="bg-transparent text-sm focus:ring-1"
                />

                <div>
                  <label style={{ color: INK }} className="block text-sm font-medium mb-2">
                    Subjek *
                  </label>
                  <select
                    name="subjek"
                    value={formData.subjek}
                    onChange={handleChange}
                    required
                    style={{ borderColor: INK }}
                    className="w-full px-4 py-2.5 border bg-transparent text-sm focus:outline-none focus:ring-1"
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
                  <label style={{ color: INK }} className="block text-sm font-medium mb-2">
                    Pesan *
                  </label>
                  <textarea
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleChange}
                    required
                    rows={5}
                    style={{ borderColor: INK }}
                    className="w-full px-4 py-2.5 border bg-transparent text-sm focus:outline-none focus:ring-1 resize-none"
                    placeholder="Tulis pesan Anda di sini..."
                  />
                </div>

                <Button
                  type="submit"
                  style={{ backgroundColor: GREEN, borderColor: INK, color: PAPER }}
                  className="w-full border font-medium py-3 text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-none"
                >
                  <Send className="w-4 h-4" />
                  Kirim Pesan
                </Button>

                <p style={{ color: INK_SOFT }} className="text-xs text-center">
                  * Kolom wajib diisi. Kami akan merespon dalam 1x24 jam.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* PETA LOKASI */}
      <section style={{ backgroundColor: PAPER }} className="py-20 px-4 md:px-12 border-t border-dashed" >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ color: GREEN }} className="text-[11px] tracking-[0.14em] font-medium mb-2">LOKASI</p>
            <h2 style={{ color: INK }} className="text-3xl font-semibold mb-3">Lokasi masjid</h2>
            <p style={{ color: INK_SOFT }} className="text-sm">Temukan kami di Google Maps</p>
          </div>

          <div style={{ borderColor: INK }} className="relative w-full h-96 border overflow-hidden">
            <iframe
              src={MAPS_EMBED_URL}
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

          <div style={{ borderColor: INK }} className="mt-8 border p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 style={{ color: INK }} className="font-medium mb-2 flex items-center gap-2 justify-center md:justify-start">
                  <MapPin style={{ color: GREEN }} className="w-4 h-4" />
                  Masjid Jami At-Taubah
                </h3>
                <p style={{ color: INK_SOFT }} className="text-sm">
                  Perumahan Talaga Bestari, Kabupaten Tangerang, Banten
                </p>
              </div>

              <div className="flex gap-3">
                <a
                  href={MAPS_EMBED_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: GREEN, borderColor: INK, color: PAPER }}
                  className="border px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Map className="w-4 h-4" />
                  Buka di Maps
                </a>

                <Button
                  onClick={handleShare}
                  style={{ borderColor: INK, color: INK }}
                  className="border bg-transparent px-4 py-2 text-sm font-medium hover:bg-(--green-soft) transition-colors flex items-center gap-2 rounded-none"
                >
                  <MessageCircle className="w-4 h-4" />
                  Bagikan
                </Button>
              </div>
            </div>
          </div>

          {/* PETUNJUK AKSES */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {accessInfo.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ borderColor: INK }} className="border p-6">
                <div style={{ backgroundColor: GREEN }} className="w-10 h-10 flex items-center justify-center mb-4">
                  {React.createElement(Icon, { style: { color: PAPER }, className: 'w-5 h-5' })}
                </div>
                <h3 style={{ color: INK }} className="font-medium mb-2">{title}</h3>
                <p style={{ color: INK_SOFT }} className="text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
