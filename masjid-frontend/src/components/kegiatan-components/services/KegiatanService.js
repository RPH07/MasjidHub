import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

export const KegiatanService = {
  // GET semua kegiatan
  getAll: async () => {
    const response = await axios.get(API_ENDPOINTS.KEGIATAN);
    return response.data;
  },

  // GET kegiatan by ID
  getById: async (id) => {
    const response = await axios.get(`${API_ENDPOINTS.KEGIATAN}/${id}`);
    return response.data;
  },

  // CREATE kegiatan baru
  create: async (formData) => {
    const response = await axios.post(API_ENDPOINTS.KEGIATAN, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // UPDATE kegiatan
  update: async (id, formData) => {
    const response = await axios.put(`${API_ENDPOINTS.KEGIATAN}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // DELETE kegiatan
  delete: async (id) => {
    const response = await axios.delete(`${API_ENDPOINTS.KEGIATAN}/${id}`);
    return response.data;
  }
};