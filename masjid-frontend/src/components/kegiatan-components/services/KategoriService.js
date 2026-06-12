import api from "@/config/api";

export const KategoriService = {
  // GET semua kategori
  getAll: async () => {
    const response = await api.get('/kategori-kegiatan');
    return response.data;
  },

  // GET kategori by ID
  getById: async (id) => {
    const response = await api.get(`/kategori-kegiatan/${id}`);
    return response.data;
  },

  // CREATE kategori baru
  create: async (kategoriData) => {
    const response = await api.post('/kategori-kegiatan', kategoriData);
    return response.data;
  },

  // UPDATE kategori
  update: async (id, kategoriData) => {
    const response = await api.put(`/kategori-kegiatan/${id}`, kategoriData);
    return response.data;
  },

  // DELETE kategori
  delete: async (id) => {
    const response = await api.delete(`/kategori-kegiatan/${id}`);
    return response.data;
  }
};