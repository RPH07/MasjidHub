import api from '@/config/api';

const getData = (response) => response.data?.data || response.data;

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getFilename = (response, fallback) => {
  const disposition = response.headers?.['content-disposition'];
  const match = disposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] || fallback;
};

export const transparencyService = {
  getZakat: async (params = {}) => {
    const response = await api.get('/transparansi/zakat', { params });
    return getData(response);
  },

  downloadZakatPdf: async () => {
    const response = await api.get('/transparansi/zakat/pdf', { responseType: 'blob' });
    downloadBlob(response.data, getFilename(response, 'laporan-transparansi-zakat.pdf'));
  },

  createZakatDistribution: async (payload) => {
    const response = await api.post('/transparansi/zakat/distribusi', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return getData(response);
  },

  updateZakatDistribution: async (id, payload) => {
    const response = await api.put(`/transparansi/zakat/distribusi/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return getData(response);
  },

  approveZakatDistribution: async (id) => {
    const response = await api.post(`/transparansi/zakat/distribusi/${id}/approve`);
    return getData(response);
  },

  rejectZakatDistribution: async (id, reason) => {
    const response = await api.post(`/transparansi/zakat/distribusi/${id}/reject`, { reason });
    return getData(response);
  },

  getProgram: async (programId, params = {}) => {
    const response = await api.get(`/transparansi/pengadaan/${programId}`, { params });
    return getData(response);
  },

  downloadProgramPdf: async (programId) => {
    const response = await api.get(`/transparansi/pengadaan/${programId}/pdf`, { responseType: 'blob' });
    downloadBlob(response.data, getFilename(response, 'laporan-transparansi-program.pdf'));
  },

  createProgramRealisasi: async (programId, payload) => {
    const response = await api.post(`/transparansi/pengadaan/${programId}/realisasi`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return getData(response);
  },

  updateProgramRealisasi: async (id, payload) => {
    const response = await api.put(`/transparansi/pengadaan/realisasi/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return getData(response);
  },

  approveProgramRealisasi: async (id) => {
    const response = await api.post(`/transparansi/pengadaan/realisasi/${id}/approve`);
    return getData(response);
  },

  rejectProgramRealisasi: async (id, reason) => {
    const response = await api.post(`/transparansi/pengadaan/realisasi/${id}/reject`, { reason });
    return getData(response);
  }
};

export default transparencyService;
