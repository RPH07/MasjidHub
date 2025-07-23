export const kategoriPemasukan = {
  donasi_umum: "Donasi Umum",
  infaq_tromol: "Infaq Tromol",
  infaq_jumat: "Infaq Jumat",
  donasi_pembangunan: "Donasi Pembangunan",
  donasi_yatim: "Donasi Yatim Piatu",
  donasi_ramadan: "Donasi Ramadan",
  wakaf: "Wakaf",
  qurban: "Qurban",
  lainnya: "Lainnya",
};

export const kategoriPengeluaran = {
  operasional: "Operasional",
  kegiatan: "Kegiatan",
  pemeliharaan: "Pemeliharaan",
  bantuan: "Bantuan Sosial",
};

export const PERIOD_OPTIONS = [
  { value: 'hari-ini', label: 'Hari Ini' },
  { value: 'kemarin', label: 'Kemarin' },
  { value: 'minggu-ini', label: 'Minggu Ini' },
  { value: 'minggu-lalu', label: 'Minggu Lalu' },
  { value: 'bulan-ini', label: 'Bulan Ini' },
  { value: 'bulan-lalu', label: 'Bulan Lalu' },
  { value: 'tahun-ini', label: 'Tahun Ini' },
  { value: 'tahun-lalu', label: 'Tahun Lalu' },
  { value: 'custom', label: 'Periode Kustom' }
];

// export const TABS = [
//   { key: 'overview', label: 'Ringkasan' },
//   { key: 'pemasukan', label: 'Pemasukan' },
//   { key: 'pengeluaran', label: 'Pengeluaran' },
//   { key: 'riwayat', label: 'Riwayat' }
// ];

export const TABS = {
  overview: { label: 'Ringkasan' },
  validasi: { label: 'Validasi' },
  pemasukan: { label: 'Pemasukan' },
  pengeluaran: { label: 'Pengeluaran' },
  riwayat: { label: 'Riwayat' },
};
