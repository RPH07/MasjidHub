import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

export const KategoriService = {
  // GET semua kategori
  getAll: async () => {
    const response = await axios.get(API_ENDPOINTS.KATEGORI);
    return response.data;
  },

  // GET kategori by ID
  getById: async (id) => {
    const response = await axios.get(`${API_ENDPOINTS.KATEGORI}/${id}`);
    return response.data;
  },

  // CREATE kategori baru
  create: async (kategoriData) => {
    const response = await axios.post(API_ENDPOINTS.KATEGORI, kategoriData);
    return response.data;
  },

  // UPDATE kategori
  update: async (id, kategoriData) => {
    const response = await axios.put(`${API_ENDPOINTS.KATEGORI}/${id}`, kategoriData);
    return response.data;
  },

  // DELETE kategori
  delete: async (id) => {
    const response = await axios.delete(`${API_ENDPOINTS.KATEGORI}/${id}`);
    return response.data;
  }
};