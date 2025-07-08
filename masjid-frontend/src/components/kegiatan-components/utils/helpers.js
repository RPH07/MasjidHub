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
  return nama.charAt(0).toUpperCase() + nama.slice(1);
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
    // ✅ Handle response structure: { success: true, data: [...] }
    let arrayToSort;
    
    if (data && typeof data === 'object') {
      // Jika data berbentuk response object dengan property 'data'
      if (data.data && Array.isArray(data.data)) {
        arrayToSort = data.data;
      }
      // Jika data sudah berupa array langsung
      else if (Array.isArray(data)) {
        arrayToSort = data;
      }
      // Jika data bukan array dan tidak ada property 'data'
      else {
        console.warn('⚠️ Data is not in expected format:', data);
        return [];
      }
    } else {
      console.warn('⚠️ Invalid data format:', data);
      return [];
    }

    // ✅ Clone array to avoid mutation
    const sortedData = [...arrayToSort];
    
    switch (sortOrder) {
      case 'terbaru':
        return sortedData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      case 'terlama':
        return sortedData.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
      case 'nama':
        return sortedData.sort((a, b) => a.nama_kegiatan.localeCompare(b.nama_kegiatan));
      default:
        return sortedData;
    }
  } catch (error) {
    console.error('❌ Error in sortData:', error);
    return [];
  }
};

// ✅ FIX: Get kategori info with safe array check
export const getKategoriInfo = (namaKategori, kategoriList = []) => {
  // ✅ SAFE: Ensure kategoriList is always an array
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