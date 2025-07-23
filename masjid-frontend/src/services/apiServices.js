import axiosInstance from '../config/axios.config';
import { API_ENDPOINTS, buildApiUrl } from '../config/api.config';

class ApiService {
  // Generic HTTP methods
  async get(endpoint, params = {}) {
    const url = Object.keys(params).length > 0 
      ? buildApiUrl(endpoint, params) 
      : endpoint;
    return axiosInstance.get(url);
  }

  async post(endpoint, data = {}, config = {}) {
    return axiosInstance.post(endpoint, data, config);
  }

  async put(endpoint, data = {}, config = {}) {
    return axiosInstance.put(endpoint, data, config);
  }

  async delete(endpoint, config = {}) {
    return axiosInstance.delete(endpoint, config);
  }

  // Specific API methods
  // Kas methods
  async getKasSummary(period) {
    return this.get(API_ENDPOINTS.KAS.SUMMARY, { period });
  }

  async getKasHistory(params = {}) {
    return this.get(API_ENDPOINTS.KAS.HISTORY, params);
  }

  async exportKasData(format, period) {
    return this.get(API_ENDPOINTS.KAS.EXPORT, { format, period }, {
      responseType: 'blob'
    });
  }

  // Donasi methods
  async getDonasiPrograms(status = 'all') {
    const params = status === 'all' ? {} : { status };
    return this.get(API_ENDPOINTS.DONASI.PROGRAM, params);
  }

  async createDonasiProgram(formData) {
    return this.post(API_ENDPOINTS.DONASI.PROGRAM, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async updateDonasiProgram(id, formData) {
    return this.put(`${API_ENDPOINTS.DONASI.PROGRAM}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async deleteDonasiProgram(id) {
    return this.delete(`${API_ENDPOINTS.DONASI.PROGRAM}/${id}`);
  }

  async activateDonasiProgram(id) {
    return this.post(API_ENDPOINTS.DONASI.PROGRAM_ACTIVATE(id));
  }

  // Kegiatan methods
  async getKegiatan() {
    return this.get(API_ENDPOINTS.KEGIATAN.BASE);
  }

  async createKegiatan(formData) {
    return this.post(API_ENDPOINTS.KEGIATAN.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Zakat methods
  async getZakatHistory(userId) {
    return this.get(API_ENDPOINTS.ZAKAT.HISTORY(userId));
  }

  async submitZakat(formData) {
    return this.post(API_ENDPOINTS.ZAKAT.SUBMIT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // User methods
  async getUserProfile() {
    return this.get(API_ENDPOINTS.USER.PROFILE);
  }

  // Kontribusi methods
  async getKontribusiHistory(userId) {
    return this.get(API_ENDPOINTS.KONTRIBUSI.HISTORY(userId));
  }

  async getKontribusiSummary(userId) {
    return this.get(API_ENDPOINTS.KONTRIBUSI.SUMMARY(userId));
  }
}

export default new ApiService();