import axiosInstance from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../config/api.config';

export const donasiService = {
  // CRUD Program Donasi
  getPrograms: (status) => {
    const params = status ? { status } : {};
    return axiosInstance.get(API_ENDPOINTS.DONASI.PROGRAM, { params });
  },

  createProgram: (formData) => {
    return axiosInstance.post(API_ENDPOINTS.DONASI.PROGRAM, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateProgram: (id, formData) => {
    return axiosInstance.put(`${API_ENDPOINTS.DONASI.PROGRAM}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteProgram: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.DONASI.PROGRAM}/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting program:', error);
      // Throw error agar bisa di-catch di component
      throw {
        response: {
          data: {
            message: error.response?.data?.message || 'Gagal menghapus program donasi'
          }
        }
      };
    }
  },

  // Kelola Status Program
  activateProgram: (id) => {
    return axiosInstance.post(API_ENDPOINTS.DONASI.PROGRAM_ACTIVATE(id));
  },

  deactivateProgram: (id) => {
    return axiosInstance.post(API_ENDPOINTS.DONASI.PROGRAM_DEACTIVATE(id));
  },

  completeProgram: (id) => {
    return axiosInstance.post(API_ENDPOINTS.DONASI.PROGRAM_COMPLETE(id));
  },

  // Donasi Management
  getActivePrograms: () => {
    return axiosInstance.get(API_ENDPOINTS.DONASI.PROGRAM, { 
      params: { status: 'aktif' } 
    });
  },

  submitDonation: (programId, donationData) => {
    return axiosInstance.post(`${API_ENDPOINTS.DONASI.SUBMIT}/${programId}`, donationData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getDonationHistory: (programId) => {
    return axiosInstance.get(API_ENDPOINTS.DONASI.PROGRAM_DONATIONS(programId));
  },

  // Export Methods
  exportProgramData: (programId, format = 'excel') => {
    return axiosInstance.get(API_ENDPOINTS.DONASI.PROGRAM_EXPORT(programId), {
      params: { format },
      responseType: 'blob'
    });
  },

  exportAllDonations: (params = {}) => {
    return axiosInstance.get(API_ENDPOINTS.DONASI.EXPORT, {
      params,
      responseType: 'blob'
    });
  },

  // Statistics & Analytics
  getProgramStats: (programId) => {
    return axiosInstance.get(`${API_ENDPOINTS.DONASI.PROGRAM}/${programId}/stats`);
  },

  getDonationSummary: (period = 'bulan-ini') => {
    return axiosInstance.get(`${API_ENDPOINTS.DONASI.BASE}/summary`, {
      params: { period }
    });
  }
};

export default donasiService;