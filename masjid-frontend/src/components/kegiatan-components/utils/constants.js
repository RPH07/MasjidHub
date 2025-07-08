// Warna options untuk kategori
export const warnaOptions = [
  { value: 'blue', label: 'Biru', class: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: 'Hijau', class: 'bg-green-100 text-green-800' },
  { value: 'red', label: 'Merah', class: 'bg-red-100 text-red-800' },
  { value: 'purple', label: 'Ungu', class: 'bg-purple-100 text-purple-800' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-100 text-indigo-800' },
  { value: 'yellow', label: 'Kuning', class: 'bg-yellow-100 text-yellow-800' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-100 text-orange-800' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-100 text-pink-800' },
  { value: 'gray', label: 'Abu-abu', class: 'bg-gray-100 text-gray-800' },
  { value: 'slate', label: 'Slate', class: 'bg-slate-100 text-slate-800' }
];

// Initial form data
export const initialFormData = {
  nama_kegiatan: '',
  tanggal: '',
  lokasi: '',
  deskripsi: '',
  kategori: ''
};

// Initial kategori data
export const initialKategoriData = {
  nama_kategori: '',
  icon: '📋',
  warna: '',
  deskripsi: ''
};

// Sort options
export const sortOptions = {
  desc: 'Terbaru',
  asc: 'Terlama'
};

export const API_ENDPOINTS = {
  KEGIATAN: 'http://localhost:5000/api/kegiatan',
  KATEGORI: 'http://localhost:5000/api/kategori-kegiatan'
};