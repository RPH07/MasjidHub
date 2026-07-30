import api from '@/config/api';

const normalizeKegiatan = (item = {}) => ({
  id: item.id,
  judul: item.judul || item.nama_kegiatan || '',
  deskripsi: item.deskripsi || '',
  lokasi: item.lokasi || '',
  tanggal: item.tanggal || '',
  jam: item.jam || '',
  image_url: item.image_url || item.foto || null,
  kategori_id: item.kategori_id || '',
  kategori_nama: item.kategori?.nama_kategori || item.kategori_nama || '-',
  user_id: item.user_id || null,
  raw: item
});

const normalizeListResponse = (responseData) => {
  const rows = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.data)
      ? responseData.data
      : [];

  return rows.map(normalizeKegiatan);
};

export const KegiatanService = {
  // GET semua kegiatan
  getAll: async () => {
    const response = await api.get('/kegiatan');
    return normalizeListResponse(response.data);
  },

  // GET kegiatan by ID
  getById: async (id) => {
    const response = await api.get(`/kegiatan/${id}`);
    return normalizeKegiatan(response.data?.data || response.data);
  },

  // CREATE kegiatan baru
  create: async (formData) => {
    const response = await api.post('/kegiatan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // UPDATE kegiatan
  update: async (id, formData) => {
    const response = await api.put(`/kegiatan/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // DELETE kegiatan
  delete: async (id) => {
    const response = await api.delete(`/kegiatan/${id}`);
    return response.data;
  }
};
