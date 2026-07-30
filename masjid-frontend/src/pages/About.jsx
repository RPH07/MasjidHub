import React from 'react';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';
import {
  Award,
  Target,
  Rocket,
  User,
  Users,
  Droplet,
  Car,
  BookOpen,
  GraduationCap,
  UtensilsCrossed,
  Home,
  Volume2
} from 'lucide-react';

const INK = '#1c2620';
const INK_SOFT = '#5c6b5f';
const PAPER = '#f3efe4';
const GREEN = '#1f4d3a';
const GREEN_SOFT = '#e8ede8';

const pengurus = [
  { nama: 'H. Bambang Sutrisno', jabatan: 'Ketua Takmir' },
  { nama: 'Drs. Ahmad Fauzi', jabatan: 'Wakil Ketua' },
  { nama: 'Siti Aminah, S.Pd', jabatan: 'Sekretaris' },
  { nama: 'Hj. Fatimah Zahra', jabatan: 'Bendahara' },
  { nama: 'Ust. Muhammad Ridwan', jabatan: 'Imam Masjid' },
  { nama: 'Ust. Abdul Rahman', jabatan: 'Khatib' }
];

const fasilitas = [
  { icon: Users, title: 'Ruang Sholat', desc: 'Kapasitas 500 jamaah dengan AC dan sound system' },
  { icon: Droplet, title: 'Tempat Wudhu', desc: 'Fasilitas wudhu terpisah pria dan wanita' },
  { icon: Car, title: 'Area Parkir', desc: 'Parkir luas untuk mobil dan sepeda motor' },
  { icon: BookOpen, title: 'Perpustakaan', desc: 'Koleksi buku agama dan ruang baca' },
  { icon: GraduationCap, title: 'Ruang TPA', desc: 'Ruang khusus untuk pembelajaran anak-anak' },
  { icon: UtensilsCrossed, title: 'Kantin Halal', desc: 'Menyediakan makanan dan minuman halal' },
  { icon: Home, title: 'Rumah Imam', desc: 'Tempat tinggal imam dan keluarga' },
  { icon: Volume2, title: 'Sound System', desc: 'Audio berkualitas untuk seluruh area masjid' }
];

const About = () => {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section style={{ backgroundColor: GREEN }} className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ color: GREEN_SOFT }} className="text-[11px] tracking-[0.14em] font-medium mb-3">
            TENTANG KAMI
          </p>
          <h1 style={{ color: PAPER }} className="text-4xl md:text-5xl font-semibold mb-4">
            Masjid Nurul Ilmi
          </h1>
          <p style={{ color: GREEN_SOFT }} className="text-base max-w-2xl mx-auto">
            Mengenal lebih dekat sejarah, visi misi, dan program-program Masjid Nurul Ilmi
            dalam melayani umat.
          </p>
        </div>
      </section>

      {/* SEJARAH */}
      <section style={{ backgroundColor: PAPER }} className="py-20 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p style={{ color: GREEN }} className="text-[11px] tracking-[0.14em] font-medium mb-2">SEJARAH</p>
              <h2 style={{ color: INK }} className="text-3xl font-semibold mb-6">Sejarah pendirian</h2>
              <div style={{ color: INK_SOFT }} className="space-y-4 text-sm leading-relaxed">
                <p>
                  Masjid Nurul Ilmi didirikan pada tahun 1985 atas inisiatif tokoh masyarakat
                  setempat yang dipimpin oleh KH. Ahmad Dahlan (alm) bersama para donatur yang peduli
                  akan pentingnya sarana ibadah di lingkungan ini.
                </p>
                <p>
                  Awalnya masjid ini hanya berupa bangunan sederhana dengan kapasitas 100 jamaah.
                  Seiring berjalannya waktu dan bertambahnya jamaah, masjid mengalami beberapa
                  kali renovasi dan perluasan hingga mencapai kondisi seperti sekarang.
                </p>
                <p>
                  Nama &ldquo;At-Taubah&rdquo; dipilih dengan makna bahwa masjid ini menjadi tempat untuk
                  bertaubat, memperbaiki diri, dan mendekatkan diri kepada Allah SWT.
                </p>
              </div>

              <div style={{ borderColor: INK }} className="mt-8 border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award style={{ color: GREEN }} className="w-5 h-5" />
                  <h3 style={{ color: INK }} className="font-semibold">Prestasi &amp; Pengakuan</h3>
                </div>
                <ul style={{ color: INK_SOFT }} className="text-sm space-y-1.5">
                  <li>Juara 1 Masjid Terbersih Tingkat Kecamatan (2020&ndash;2023)</li>
                  <li>Masjid Percontohan Program Kemandirian Umat (2021)</li>
                  <li>Sertifikat Halal MUI untuk Kantin Masjid (2022)</li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1480&auto=format&fit=crop"
                alt="Sejarah Masjid"
                style={{ borderColor: INK }}
                className="border w-full h-96 object-cover"
              />
              <div style={{ backgroundColor: PAPER, borderColor: INK }} className="absolute top-4 left-4 border p-4">
                <div style={{ color: GREEN }} className="text-2xl font-semibold">1985</div>
                <div style={{ color: INK_SOFT }} className="text-sm">Tahun Berdiri</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISI MISI */}
      <section style={{ backgroundColor: GREEN_SOFT }} className="py-20 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p style={{ color: GREEN }} className="text-[11px] tracking-[0.14em] font-medium mb-2">ARAH KAMI</p>
            <h2 style={{ color: INK }} className="text-3xl font-semibold">Visi &amp; misi</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div style={{ backgroundColor: PAPER, borderColor: INK }} className="border p-8">
              <div className="flex items-center gap-3 mb-5">
                <div style={{ backgroundColor: GREEN }} className="w-11 h-11 flex items-center justify-center shrink-0">
                  <Target style={{ color: PAPER }} className="w-5 h-5" />
                </div>
                <h3 style={{ color: INK }} className="text-xl font-semibold">Visi</h3>
              </div>
              <p style={{ color: INK_SOFT }} className="text-sm leading-relaxed">
                &ldquo;Menjadi masjid yang unggul dalam pembinaan umat, berperan aktif dalam
                pemberdayaan masyarakat, dan menjadi pusat kegiatan keislaman yang
                bermanfaat bagi kemajuan bangsa dan negara.&rdquo;
              </p>
            </div>

            <div style={{ backgroundColor: PAPER, borderColor: INK }} className="border p-8">
              <div className="flex items-center gap-3 mb-5">
                <div style={{ backgroundColor: GREEN }} className="w-11 h-11 flex items-center justify-center shrink-0">
                  <Rocket style={{ color: PAPER }} className="w-5 h-5" />
                </div>
                <h3 style={{ color: INK }} className="text-xl font-semibold">Misi</h3>
              </div>
              <ul style={{ color: INK_SOFT }} className="text-sm space-y-2.5">
                <li className="flex items-start gap-2">
                  <span style={{ color: GREEN }}>&mdash;</span>
                  Menyelenggarakan kegiatan ibadah yang berkualitas
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: GREEN }}>&mdash;</span>
                  Memberikan pendidikan dan pembinaan keislaman
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: GREEN }}>&mdash;</span>
                  Mengembangkan program pemberdayaan ekonomi umat
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: GREEN }}>&mdash;</span>
                  Membangun kepedulian sosial dan kemanusiaan
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* STRUKTUR ORGANISASI */}
      <section style={{ backgroundColor: PAPER }} className="py-20 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p style={{ color: GREEN }} className="text-[11px] tracking-[0.14em] font-medium mb-2">PENGURUS</p>
            <h2 style={{ color: INK }} className="text-3xl font-semibold mb-2">Struktur organisasi</h2>
            <p style={{ color: INK_SOFT }} className="text-sm">Pengurus Masjid Nurul Ilmi Periode 2023&ndash;2028</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pengurus.map((p) => (
              <div key={p.nama} style={{ borderColor: INK }} className="border p-6 text-center">
                <div style={{ backgroundColor: GREEN }} className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <User style={{ color: PAPER }} className="w-6 h-6" />
                </div>
                <h3 style={{ color: INK }} className="font-semibold mb-1">{p.nama}</h3>
                <p style={{ color: GREEN }} className="text-sm font-medium mb-1">{p.jabatan}</p>
                <p style={{ color: INK_SOFT }} className="text-xs">Periode 2023&ndash;2028</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FASILITAS */}
      <section style={{ backgroundColor: GREEN_SOFT }} className="py-20 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p style={{ color: GREEN }} className="text-[11px] tracking-[0.14em] font-medium mb-2">SARANA</p>
            <h2 style={{ color: INK }} className="text-3xl font-semibold">Fasilitas masjid</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {fasilitas.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ backgroundColor: PAPER, borderColor: INK }} className="border p-6 text-center">
                <div style={{ backgroundColor: GREEN }} className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  {React.createElement(Icon, { style: { color: PAPER }, className: 'w-5 h-5' })}
                </div>
                <h3 style={{ color: INK }} className="font-semibold mb-2">{title}</h3>
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

export default About;
