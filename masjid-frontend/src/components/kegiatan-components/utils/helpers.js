import { warnaOptions } from './constants';

// Get warna class dari value
export const getWarnaClass = (warna) => {
  const warnaObj = warnaOptions.find(w => w.value === warna);
  return warnaObj?.class || 'bg-gray-100 text-gray-800';
};

// Format tanggal untuk display
export const formatTanggal = (tanggal) => {
  const date = new Date(tanggal);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format tanggal singkat
export const formatTanggalSingkat = (tanggal) => {
  const date = new Date(tanggal);
  return date.toLocaleDateString('id-ID');
};

// Format nama kategori
export const formatKategoriName = (nama) => {
  if (!nama) return '-';
  return String(nama)
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Validate form data
export const validateFormData = (formData) => {
  const errors = [];
  
  if (!formData.nama_kegiatan.trim()) {
    errors.push('Nama kegiatan wajib diisi');
  }
  
  if (!formData.tanggal) {
    errors.push('Tanggal kegiatan wajib diisi');
  }
  
  if (!formData.lokasi.trim()) {
    errors.push('Lokasi wajib diisi');
  }
  
  if (!formData.deskripsi.trim()) {
    errors.push('Deskripsi wajib diisi');
  }
  
  return errors;
};

// Get sort label
export const getSortLabel = (sortOrder) => {
  return sortOrder === 'desc' ? 'Terbaru' : 'Terlama';
};

// Sort data helper
export const sortData = (data, sortOrder = 'terbaru') => {
  try {
    const sortedData = Array.isArray(data) ? [...data] : [];
    
    switch (sortOrder) {
      case 'desc':
      case 'terbaru':
        return sortedData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      case 'asc':
      case 'terlama':
        return sortedData.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
      case 'nama':
        return sortedData.sort((a, b) => (a.judul || '').localeCompare(b.judul || ''));
      default:
        return sortedData;
    }
  } catch (error) {
    console.error('❌ Error in sortData:', error);
    return [];
  }
};

export const getKategoriInfo = (namaKategori, kategoriList = []) => {
  const safeKategoriList = Array.isArray(kategoriList) ? kategoriList : [];
  
  try {
    const kategori = safeKategoriList.find(k => k.nama_kategori === namaKategori);
    return kategori || { 
      icon: '📋', 
      warna: 'gray', 
      nama_kategori: namaKategori || 'Unknown' 
    };
    
  } catch (error) {
    console.error('❌ Error in getKategoriInfo:', error);
    return { 
      icon: '📋', 
      warna: 'gray', 
      nama_kategori: namaKategori || 'Unknown' 
    };
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  return (bytes / 1024).toFixed(2);
};
